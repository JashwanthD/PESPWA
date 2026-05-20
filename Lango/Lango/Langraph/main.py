"""
Main Entry Point — Company Intelligence Pipeline
==================================================

Loads the real CSV dataset, iterates through each company row, and
runs the full LangGraph pipeline:

    Research (3 LLMs)  ->  Validate (custom suite)  ->  Consolidate  ->  Golden Record

Results are saved to ``output/golden_records.json``.
"""

from dotenv import load_dotenv
load_dotenv()

from langsmith import Client
client = Client()

import asyncio
import json
import os
import sys
import pandas as pd
from supabase import create_client, Client

# ---------------------------------------------------------------------------
# Resolve project root
# ---------------------------------------------------------------------------
_PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

# Load API keys before importing the graph
load_dotenv()

from app.graph import app  # noqa: E402

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
CSV_PATH = os.path.join(
    _PROJECT_ROOT, "validation suit 2", "data",
    "116 companies--163 parameters - Sheet1.csv",
)
OUTPUT_DIR = os.path.join(_PROJECT_ROOT, "output")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "golden_records.json")

# ---------------------------------------------------------------------------
# Supabase Configuration
# ---------------------------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized successfully.\n")
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase client: {e}\n")


async def main() -> None:
    """Run the pipeline for every company in the CSV dataset."""

    # ------------------------------------------------------------------
    # Load dataset
    # ------------------------------------------------------------------
    if not os.path.exists(CSV_PATH):
        print(f"ERROR: CSV file not found at {CSV_PATH}")
        return

    df = pd.read_csv(CSV_PATH).iloc[4:5]
    print(f"Loaded {len(df)} companies from CSV (Testing mode: limited to 1)\n")

    # Prepare output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    all_golden_records: list[dict] = []
    failed_companies: list[dict] = []

    # ------------------------------------------------------------------
    # Process each company
    # ------------------------------------------------------------------
    for index, row in df.iterrows():
        company_name = str(row.get("name", f"Company_{index}"))

        # Convert the row to a clean JSON context (drop NaN values)
        row_clean = row.dropna().to_dict()
        
        # Pass all available fields as requested by the user
        filtered_row = row_clean
        
        # We increase the string truncation limit to fit 163 fields
        company_context = json.dumps(filtered_row, default=str)[:30000]

        print("=" * 60)
        print(f"  [{index + 1}/{len(df)}] Processing: {company_name}")
        print("=" * 60)

        # Build initial state
        initial_state = {
            "company_name": company_name,
            "company_context": company_context,
            "search_snippets": "",
            "temp_directory": "",
            "raw_outputs": [],
            "validated_outputs": [],
            "golden_record": {},
            "failed_fields": [],
            "retry_count": 0,
        }

        try:
            # Run the full graph
            final_state = await app.ainvoke(initial_state)

            golden = final_state.get("golden_record", {})
            failed = final_state.get("failed_fields", [])
            validation_passed = final_state.get("golden_validation_passed", False)

            if golden and validation_passed:
                golden["_source_company"] = company_name
                golden["_source_index"] = index
                all_golden_records.append(golden)
                print(f"\n  Golden Record (Validated):")
                print(f"  {json.dumps(golden, indent=2, default=str)}")
            elif golden and not validation_passed:
                failed_companies.append({
                    "company": company_name,
                    "index": index,
                    "reason": "Golden record failed validation (max retries reached)",
                })
                print(f"\n  WARNING: Golden record generated but failed final validation.")
            else:
                failed_companies.append({
                    "company": company_name,
                    "index": index,
                    "reason": "Empty golden record",
                })
                print(f"\n  WARNING: No golden record produced.")

            if failed:
                print(f"  Failed fields: {failed}")

        except Exception as e:
            print(f"\n  ERROR processing {company_name}: {type(e).__name__}: {e}")
            failed_companies.append({
                "company": company_name,
                "index": index,
                "reason": str(e),
            })

        print()

        # ------------------------------------------------------------------
        # RATE LIMITING: Pacing the requests
        # Sleep for 6 seconds between companies to keep the request rate
        # around ~10 per minute. This prevents triggering the 429 errors 
        # on the free tiers of Groq, Google, and Azure.
        # ------------------------------------------------------------------
        if index < len(df) - 1:
            print(f"  Sleeping for 6 seconds to respect free-tier rate limits...")
            await asyncio.sleep(6)

    # ------------------------------------------------------------------
    # Save results to JSON
    # ------------------------------------------------------------------
    output_data = {
        "total_companies": len(df),
        "successful": len(all_golden_records),
        "failed": len(failed_companies),
        "golden_records": all_golden_records,
        "failed_companies": failed_companies,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, default=str)

    print("=" * 60)
    print("  PIPELINE COMPLETE")
    print("=" * 60)
    print(f"  Total companies:  {len(df)}")
    print(f"  Successful:       {len(all_golden_records)}")
    print(f"  Failed:           {len(failed_companies)}")
    print(f"  Output saved to:  {OUTPUT_FILE}")
    print()

    # ------------------------------------------------------------------
    # Send results to Supabase
    # ------------------------------------------------------------------
    if supabase and all_golden_records:
        print("=" * 60)
        print("  UPLOADING TO SUPABASE")
        print("=" * 60)
        try:
            # Clean up records to remove non-schema fields before insert if needed
            # For now, we will insert them directly into a 'companies' table.
            # Make sure your Supabase table schema matches these fields!
            response = supabase.table("companies").insert(all_golden_records).execute()
            print(f"  Successfully inserted {len(response.data)} records into 'companies' table.")
        except Exception as e:
            print(f"  ERROR inserting into Supabase: {type(e).__name__}: {e}")
            print(f"  (Ensure the 'companies' table exists and matches the schema.)")
        print()
    elif not supabase:
        print("  Note: Supabase upload skipped. SUPABASE_URL or SUPABASE_KEY is missing.")
        print()

    # ------------------------------------------------------------------
    # Rebuild local index
    # ------------------------------------------------------------------
    try:
        from build_index import build_index
        print("=" * 60)
        print("  REBUILDING LOCAL INDEX")
        print("=" * 60)
        build_index()
    except Exception as e:
        print(f"  ERROR rebuilding local index: {e}")
        print()


if __name__ == "__main__":
    asyncio.run(main())


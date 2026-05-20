import asyncio
import json
import os
import sys

from dotenv import load_dotenv
load_dotenv()

# Resolve project root
_PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from app.graph import app
from langsmith import Client

OUTPUT_DIR = os.path.join(_PROJECT_ROOT, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Ensure LangSmith project exists
try:
    client = Client()
    client.create_project(project_name="company-research-agent")
    print("Created LangSmith project: company-research-agent")
except Exception as e:
    print(f"LangSmith project status: {e}")

async def run_for_company(company_name: str):
    print(f"Running LangGraph pipeline for: {company_name}...")
    
    initial_state = {
        "company_name": company_name,
        "company_context": "{}", # Empty context since we don't have CSV data
        "search_snippets": "",
        "temp_directory": "",
        "raw_outputs": [],
        "validated_outputs": [],
        "golden_record": {},
        "failed_fields": [],
        "retry_count": 0,
    }

    try:
        final_state = await app.ainvoke(initial_state)
        
        golden = final_state.get("golden_record", {})
        
        output_file = os.path.join(OUTPUT_DIR, f"{company_name.replace(' ', '_')}_consolidated.json")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(golden, f, indent=2, default=str)
            
        print(f"Pipeline complete! Data saved to: {output_file}")
        
        # Rebuild local index
        try:
            from build_index import build_index
            build_index()
        except Exception as e:
            print(f"ERROR rebuilding local index: {e}")
            
    except Exception as e:
        print(f"ERROR processing {company_name}: {e}")


if __name__ == "__main__":
    company = "Netflix"
    if len(sys.argv) > 1:
        company = sys.argv[1]
    asyncio.run(run_for_company(company))

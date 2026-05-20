import os
import json
import csv
import time
import requests
import re
import subprocess
from typing import Dict, Any

from models.parameter_mapping import PARAMETER_MAPPING
from models.prompt_schema import SYSTEM_PROMPT_TEMPLATE, MAPPED_SCHEMA

# Ensure output directories exist
os.makedirs("data/temp", exist_ok=True)
os.makedirs("data/output", exist_ok=True)

# Custom .env parser to avoid python-dotenv dependency issues
def load_env():
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    if "=" in line:
                        key, val = line.split("=", 1)
                        os.environ[key.strip()] = val.strip()

load_env()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

CSV_PATH = "validation suit 2/data/116 companies--163 parameters - Sheet1.csv"

def get_companies_to_process(limit: int = 2) -> list:
    companies = []
    if not os.path.exists(CSV_PATH):
        print(f"CSV not found at {CSV_PATH}")
        return companies

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            company_name = row.get("name", "").strip()
            if not company_name:
                continue
            
            final_file = f"data/output/{company_name}_final.json"
            if not os.path.exists(final_file):
                companies.append(company_name)
            
            if len(companies) >= limit:
                break
    return companies

def search_github(query: str) -> str:
    if not GITHUB_TOKEN:
        return "N/A - Missing GITHUB_TOKEN"
    
    url = "https://api.github.com/search/repositories"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}", 
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Antigravity-Agent/1.0"
    }
    params = {"q": query, "per_page": 3}
    try:
        resp = requests.get(url, headers=headers, params=params)
        resp.raise_for_status()
        results = resp.json().get("items", [])
        descriptions = [item.get("description", "") for item in results if item.get("description")]
        return " ".join(descriptions)
    except Exception as e:
        print(f"GitHub Search Error: {e}")
        return "N/A"

def search_tavily(query: str) -> str:
    if not TAVILY_API_KEY:
        return "N/A - Missing TAVILY_API_KEY"
    
    url = "https://api.tavily.com/search"
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Antigravity-Agent/1.0"
    }
    payload = {"api_key": TAVILY_API_KEY, "query": query, "search_depth": "basic", "max_results": 3}
    try:
        resp = requests.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        results = resp.json().get("results", [])
        content = [item.get("content", "") for item in results]
        return " ".join(content)
    except Exception as e:
        print(f"Tavily Search Error: {e}")
        return "N/A"

def extract_batch_with_llm(company: str, batch_params: dict, batch_snippets: dict, max_retries=3) -> dict:
    if not GROQ_API_KEY:
        print("Missing GROQ_API_KEY. Skipping LLM extraction.")
        return {k: "N/A" for k in batch_params.keys()}

    schema_lines = []
    id_to_key = {}
    for key in batch_params.keys():
        row = MAPPED_SCHEMA[key]
        id_to_key[str(row["id"])] = key
        schema_lines.append(f"{row['id']} | {row['category']} | {row['description']} | {row['parameter']} | {row['content_type']} | {row['min']} | {row['max']} | {row['ac']}")
    
    schema_rows = "\n".join(schema_lines)

    snippets_text = ""
    for param_name, snippet in batch_snippets.items():
        if snippet.strip():
            snippet = snippet[:300]
            snippets_text += f"--- Snippet for {param_name} ---\n{snippet}\n\n"

    if not snippets_text.strip():
        snippets_text = "No web search data available."

    prompt = SYSTEM_PROMPT_TEMPLATE.format(
        company=company,
        snippets=snippets_text,
        schema_rows=schema_rows
    )

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}", 
        "Content-Type": "application/json",
        "User-Agent": "Antigravity-Agent/1.0"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile", 
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1
    }

    result_dict = {k: "N/A" for k in batch_params.keys()}

    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                print(f"LLM Error Body: {resp.text}")
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"].strip()
            
            # Parse the Markdown table from content
            lines = content.split('\n')
            parsed = False
            for line in lines:
                if '|' in line:
                    parts = [p.strip() for p in line.split('|')]
                    # Filter out empty strings from the ends if there are leading/trailing pipes
                    if not parts[0]:
                        parts = parts[1:]
                    if parts and not parts[-1]:
                        parts = parts[:-1]
                    
                    if len(parts) >= 5:
                        row_id = parts[0]
                        # Assume the last column or near last column is the data
                        # 'ID', 'Category', 'A/C', 'Parameter', 'Research Output / Data'
                        # Index 0: ID, Index 3: Parameter, Index 4: Research Output / Data
                        if row_id in id_to_key:
                            val = parts[4]
                            if val.lower() != "not found" and val != "":
                                result_dict[id_to_key[row_id]] = val
                                parsed = True
            
            if parsed:
                return result_dict
            else:
                print(f"Failed to parse markdown table on attempt {attempt+1}")
        except Exception as e:
            print(f"LLM Batch Extraction Error: {e}")
            time.sleep(2)

    return result_dict

def synthesize_golden_record(company: str, batches_data: list) -> dict:
    if not GROQ_API_KEY:
        print("Missing GROQ_API_KEY. Cannot perform LLM synthesis.")
        merged = {}
        for b in batches_data:
            merged.update(b)
        return merged
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}", 
        "Content-Type": "application/json",
        "User-Agent": "Antigravity-Agent/1.0"
    }
    
    prompt = f"""You are the Golden Record Architect. Synthesize the following 6 batches of data for {company} into a single valid JSON object.
Rules:
1. Ensure all 163 keys (or as many provided) are present.
2. Resolve conflicts prioritizing GitHub for Tech parameters and Tavily for Culture/Strategy.
3. Standardize all currency to USD, dates to YYYY-MM-DD, and percentages to decimal format (e.g. 0.04).
4. Infer missing logical parameters like cac_ltv_ratio if possible.
5. Output ONLY a valid JSON object. No markdown formatting, no conversational text.

Raw Batches:
{json.dumps(batches_data)}
"""
    payload = {
        "model": "llama-3.3-70b-versatile", 
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1
    }
    try:
        resp = requests.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"].strip()
        # Clean up potential markdown formatting from LLM
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        return json.loads(content)
    except Exception as e:
        print(f"LLM Synthesis Error: {e}")
        return {}

def main():
    companies = get_companies_to_process(1)
    if not companies:
        print("No companies left to process or CSV missing.")
        return

    print(f"Starting extraction for: {companies}")

    for company in companies:
        print(f"\nProcessing {company}...")
        batches_data = []

        # Phase 1: Extraction in 6 Batches
        for batch_num in range(1, 7):
            print(f"  Executing Batch {batch_num}...")
            
            # Find parameters for this batch
            batch_params = {k: v for k, v in PARAMETER_MAPPING.items() if v.get("batch") == batch_num}
            batch_snippets = {}
            
            for param, config in batch_params.items():
                tool = config.get("tool")
                
                # Fetch snippet
                query = f"{company} {param.replace('_', ' ')}"
                snippet = ""
                if tool == "Google" or tool == "Tavily":
                    snippet = search_tavily(query)
                elif tool == "GitHub":
                    snippet = search_github(query)
                
                param_name = MAPPED_SCHEMA[param]["parameter"]
                batch_snippets[param_name] = snippet
                
                # Small delay to avoid aggressive rate limiting
                time.sleep(0.5)

            print(f"  -> Extracted snippets for {len(batch_params)} parameters. Running LLM Batch Extraction...")
            batch_results = extract_batch_with_llm(company, batch_params, batch_snippets)
            
            # Persist batch immediately
            batch_file = f"data/temp/{company}_batch_{batch_num}.json"
            with open(batch_file, "w") as f:
                json.dump(batch_results, f, indent=2)
            
            batches_data.append(batch_results)
            print(f"  -> Saved {batch_file}")
            
            # Sleep to prevent hitting the 12000 Tokens Per Minute limit
            print("  Sleeping for 15 seconds to respect TPM limits...")
            time.sleep(15)

        # Phase 4: Consolidation (Synthesis)
        print(f"  Synthesizing Golden Record for {company}...")
        final_record = synthesize_golden_record(company, batches_data)
        
        if final_record:
            final_file = f"data/output/{company}_final.json"
            with open(final_file, "w") as f:
                json.dump(final_record, f, indent=2)
            print(f"  -> Successfully generated {final_file}")
            
            # Phase 5: Validation
            print(f"  Running Validation Suite for {company}...")
            env = os.environ.copy()
            env["PIPELINE_VALIDATION_JSON"] = os.path.abspath(final_file)
            
            try:
                # We use the python executable from the virtualenv to run pytest
                result = subprocess.run(
                    ["python", "-m", "pytest", "validation suit 2/tests/"],
                    env=env,
                    capture_output=True,
                    text=True
                )
                
                if result.returncode == 0:
                    print("  -> Validation PASSED completely.")
                else:
                    print(f"  -> Validation finished with issues (return code {result.returncode}).")
                    print("  -> Note: The pipeline gracefully handles test failures.")
                    
                # Extract and print a short summary from pytest output
                lines = result.stdout.split('\n')
                summary = [line for line in lines if "==" in line or "failed" in line.lower() or "passed" in line.lower()]
                if summary:
                    print(f"  -> Validation Summary: {summary[-1]}")
            except Exception as e:
                print(f"  -> Validation Exception: {e}")
                
        else:
            print(f"  -> Failed to generate final JSON for {company}")

if __name__ == "__main__":
    main()

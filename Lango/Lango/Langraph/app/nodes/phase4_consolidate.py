"""
Phase 4 — Consolidation Node
==============================

Acts as the Consolidation Agent: intelligently merges 
validated outputs from multiple sources into a single **golden record**.
Primary LLM: NVIDIA NIM
Primary Backup: Mistral (Codestral)
Secondary Backup: Parameter-level Confidence Scores Fallback.
"""

import os
import sys
import json
from langchain_openai import ChatOpenAI

# ---------------------------------------------------------------------------
# Resolve project root so imports work regardless of cwd
# ---------------------------------------------------------------------------
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from app.models.state import AgentState
from app.models.prompt_schema import MAPPED_SCHEMA

# Ensure output directory exists
OUTPUT_DIR = os.path.join(_PROJECT_ROOT, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def _build_nvidia_nim():
    return ChatOpenAI(
        api_key=os.environ.get("NVIDIA_API_KEY", ""),
        base_url="https://integrate.api.nvidia.com/v1",
        model="meta/llama-3.3-70b-instruct",
        temperature=0.0
    )

def _build_codestral():
    return ChatOpenAI(
        api_key=os.environ.get("CODESTRAL_API_KEY", ""),
        base_url="https://api.mistral.ai/v1",
        model="codestral-latest",
        temperature=0.0
    )

def load_confidence_scores():
    scores_path = os.path.join(_PROJECT_ROOT, "confidence_scores.txt")
    scores = {}
    if not os.path.exists(scores_path):
        return scores
        
    current_param = None
    with open(scores_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith("[") and line.endswith("]"):
                current_param = line[1:-1].strip()
                scores[current_param] = {}
            elif "=" in line and current_param:
                key, val = line.split("=", 1)
                model_prefix = key.split("_")[0].lower() # e.g., MISTRAL
                try:
                    scores[current_param][model_prefix] = float(val)
                except ValueError:
                    pass
    return scores

def confidence_fallback_consolidation(validated: list[dict]) -> dict:
    print("  [Phase 4] LLMs failed. Running secondary fallback (Confidence Scores).")
    scores_by_param = load_confidence_scores()
    
    golden_record = {}
    
    for json_key, schema_info in MAPPED_SCHEMA.items():
        param_name = schema_info["parameter"]
        
        best_val = None
        best_score = -1
        
        # Check each validated record
        for record in validated:
            val = record.get(json_key)
            # Skip empty values so we prefer an LLM that actually generated data
            if val is None or val == "" or val == [] or str(val).lower() == "not found":
                continue
                
            model = record.get("_source_model", "")
            # Get score for this model on this parameter
            model_score = 0
            if param_name in scores_by_param:
                model_score = scores_by_param[param_name].get(model, 0)
                
            if model_score > best_score:
                best_score = model_score
                best_val = val
                
        golden_record[json_key] = best_val
        
    return golden_record

def consolidation_node(state: AgentState) -> dict:
    """Phase 4 node: build a golden record using LLM synthesis or confidence fallback."""
    validated: list[dict] = state.get("validated_outputs", [])
    company_name = state.get("company_name", "Unknown_Company")
    
    print(f"\n  [Phase 4] Consolidation starting for {company_name}...")

    if not validated:
        print(f"  [MISS] No validated outputs to consolidate.")
        return {"golden_record": {}, "failed_fields": []}

    required_keys = list(MAPPED_SCHEMA.keys())

    prompt = f"""
You are the Golden Record Architect.
Your task is to synthesize the provided validated data for "{company_name}" into a single valid JSON object.

Rules:
1. Merge the data from all provided outputs.
2. Resolve conflicts logically (e.g., if employee sizes differ, pick the most recent or precise).
3. If a field is a list or composite, combine and deduplicate the items separated by semicolons.
4. Output ONLY a valid JSON object. Do not include markdown formatting like ```json.
5. You MUST include exactly these keys in your JSON object (if no data, use null):
{json.dumps(required_keys)}

Validated Outputs:
{json.dumps(validated, indent=2)}
"""

    golden_record = None

    # 1. Primary: NVIDIA NIM
    try:
        print("  [Phase 4] Attempting Primary LLM (NVIDIA NIM)...")
        llm = _build_nvidia_nim()
        response = llm.invoke(prompt)
        content = str(response.content).strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        golden_record = json.loads(content)
        print("  [Phase 4] NVIDIA NIM consolidation successful.")
    except Exception as e:
        print(f"  [Phase 4] NVIDIA NIM failed: {e}")
        
        # 2. Primary Backup: Codestral
        try:
            print("  [Phase 4] Attempting Primary Backup (Codestral)...")
            llm = _build_codestral()
            response = llm.invoke(prompt)
            content = str(response.content).strip()
            
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
                
            golden_record = json.loads(content)
            print("  [Phase 4] Codestral consolidation successful.")
        except Exception as e2:
            print(f"  [Phase 4] Codestral failed: {e2}")
            
            # 3. Secondary Backup: Confidence Fallback
            try:
                golden_record = confidence_fallback_consolidation(validated)
            except Exception as e3:
                print(f"  [Phase 4] Confidence fallback failed: {e3}")
                golden_record = {}

    # Finalize Record
    if not golden_record:
        golden_record = {}
        failed_fields = required_keys
    else:
        # Determine failed fields
        failed_fields = [k for k, v in golden_record.items() if v is None or v == "" or v == [] or str(v).lower() == "not found"]

    print(f"  [Phase 4] Successfully consolidated data into {len([k for k, v in golden_record.items() if v and str(v).lower() != 'not found'])} fields.")
    
    # Persist to local JSON file
    safe_name = company_name.replace(" ", "_").replace("/", "_")
    output_path = os.path.join(OUTPUT_DIR, f"{safe_name}_consolidated.json")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(golden_record, f, indent=2)
        
    print(f"  [Phase 4] Persisted Golden Record to {output_path}")

    return {"golden_record": golden_record, "failed_fields": failed_fields}

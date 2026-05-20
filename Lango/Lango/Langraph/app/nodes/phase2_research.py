"""
Phase 2 — Parallel Research Node (Multi-Provider)
===================================================

Runs three independent free-tier LLMs concurrently to extract structured
company data from provided context text:

  1. **Mistral** — via ``langchain-openai`` compatible endpoint
  2. **Cerebras** — via ``langchain-openai`` compatible endpoint
  3. **Google** — via ``langchain-google-genai``
  (Backup: **Groq** — via ``langchain-groq``)

Outputs Markdown tables based on `prompt_schema.py`.
"""

import asyncio
import os
import sys

from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

# ---------------------------------------------------------------------------
# Resolve project root so imports work regardless of cwd
# ---------------------------------------------------------------------------
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from app.models.state import AgentState
from app.models.prompt_schema import SYSTEM_PROMPT_TEMPLATE, MAPPED_SCHEMA

load_dotenv()

# ---------------------------------------------------------------------------
# Model factory functions
# ---------------------------------------------------------------------------
def _build_mistral() -> ChatOpenAI:
    return ChatOpenAI(
        api_key=os.environ.get("MISTRAL_API_KEY", ""),
        base_url="https://api.mistral.ai/v1",
        model="mistral-large-latest",
        temperature=0.0
    )

def _build_cerebras() -> ChatOpenAI:
    return ChatOpenAI(
        api_key=os.environ.get("CEREBRAS_API_KEY", ""),
        base_url="https://api.cerebras.ai/v1",
        model="llama3.1-8b",
        temperature=0.0
    )

def _build_google() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.1,
        max_retries=5,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
    )

def _build_groq_backup() -> ChatGroq:
    return ChatGroq(
        api_key=os.environ.get("GROQ_API_KEY", ""),
        model_name="llama-3.3-70b-versatile",
        temperature=0.0
    )

# ---------------------------------------------------------------------------
# Async Research Runner
# ---------------------------------------------------------------------------
async def _run_model_for_batch(model_name: str, model_instance, prompt_text: str) -> str:
    from langchain_core.messages import HumanMessage
    msg = HumanMessage(content=prompt_text)
    try:
        response = await model_instance.ainvoke([msg])
        return response.content
    except Exception as e:
        print(f"[{model_name}] Error during batch extraction: {e}")
        return f"Error: {e}"

# ---------------------------------------------------------------------------
# Main Node Function
# ---------------------------------------------------------------------------
async def parallel_research_node(state: AgentState) -> AgentState:
    """
    Splits the 163 fields into batches and prompts the models to generate Markdown tables.
    """
    company_name = state["company_name"]
    snippets = state.get("search_snippets", state.get("company_context", ""))
    temp_dir = state.get("temp_directory")
    
    if not temp_dir:
        temp_dir = os.path.join("data", "temp", company_name.replace(" ", "_"))
        state["temp_directory"] = temp_dir
        
    os.makedirs(temp_dir, exist_ok=True)
    
    # Batch the schema
    schema_items = list(MAPPED_SCHEMA.values())
    batch_size = 20
    batches = [schema_items[i:i + batch_size] for i in range(0, len(schema_items), batch_size)]
    
    models = {
        "mistral": _build_mistral(),
        "cerebras": _build_cerebras(),
        "google": _build_google(),
    }
    
    # Truncate snippets to save tokens
    snippets = snippets[:8000]

    async def process_all_batches():
        for batch_index, batch in enumerate(batches):
            print(f"  --- Processing Batch {batch_index+1}/{len(batches)} ---")
            schema_rows_str = ""
            for item in batch:
                row = f'{item.get("id", "")} | {item.get("category", "")} | {item.get("description", "")} | {item.get("parameter", "")} | {item.get("content_type", "")} | {item.get("min", "")} | {item.get("max", "")} | {item.get("ac", "")}'
                schema_rows_str += row + "\n"
                
            prompt_text = SYSTEM_PROMPT_TEMPLATE.format(
                company=company_name,
                snippets=snippets,
                schema_rows=schema_rows_str
            )
            
            # Process models concurrently for this batch
            tasks = []
            for m_name, m_inst in models.items():
                tasks.append(_process_batch(m_name, m_inst, prompt_text, batch_index, temp_dir))
                
            await asyncio.gather(*tasks)
            
            # Rate limiting: wait between batches to avoid exceeding Free Tier TPM limits
            if batch_index < len(batches) - 1:
                print(f"  Waiting 30 seconds to respect model rate limits (TPM)...")
                await asyncio.sleep(30)

    async def _process_batch(m_name, m_inst, prompt_text, batch_index, out_dir):
        content = await _run_model_for_batch(m_name, m_inst, prompt_text)
        
        # Check if primary model failed
        if content.startswith("Error:"):
            print(f"[{m_name}] Batch {batch_index+1} failed. Triggering Groq backup...")
            try:
                backup_inst = _build_groq_backup()
                content = await _run_model_for_batch(f"{m_name}_backup", backup_inst, prompt_text)
                if content.startswith("Error:"):
                    raise Exception(content)
                print(f"[{m_name} (via Groq Backup)] Batch {batch_index+1} extraction complete.")
            except Exception as backup_e:
                print(f"[{m_name}] Groq Backup also failed for Batch {batch_index+1}: {backup_e}")
                content = "Failed to extract data."
        else:
            print(f"[{m_name}] Batch {batch_index+1} extraction complete.")
            
        out_file = os.path.join(out_dir, f"{m_name}_batch_{batch_index}.md")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(content)
            
    # Run async sequentially with internal concurrency
    await process_all_batches()
        
    print(f"Finished generating research batches into {temp_dir}")
    
    # We leave raw_outputs empty for now, or just indicate completion,
    # as the consolidation node will read from temp_dir
    state["raw_outputs"] = [{"status": "batching_complete", "temp_dir": temp_dir}]
    return state

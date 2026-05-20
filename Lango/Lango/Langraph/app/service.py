import asyncio
import uuid
import traceback
from typing import Dict
import json

from app.models.api import RunResponse, RunStatus
from app.graph import app as graph_app
from app.models.state import AgentState
import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase client: {e}")
class WorkflowService:
    def __init__(self):
        # In-memory store for active and completed runs
        self.active_runs: Dict[str, RunResponse] = {}

    def get_all_runs(self) -> list[RunResponse]:
        return list(self.active_runs.values())

    def get_run(self, run_id: str) -> RunResponse | None:
        return self.active_runs.get(run_id)

    async def start_run(self, company_name: str, company_context: dict) -> str:
        run_id = str(uuid.uuid4())
        
        # Initialize run status
        self.active_runs[run_id] = RunResponse(
            run_id=run_id,
            status=RunStatus.QUEUED,
            progress_percentage=0,
            progress_stage="queued"
        )
        
        # We increase the string truncation limit to fit fields just like the CLI did
        context_str = json.dumps(company_context, default=str)[:30000]

        initial_state: AgentState = {
            "company_name": company_name,
            "company_context": context_str,
            "search_snippets": "",
            "temp_directory": "",
            "raw_outputs": [],
            "validated_outputs": [],
            "golden_record": {},
            "golden_validation_passed": False,
            "failed_fields": [],
            "retry_count": 0,
        }

        # Spawn background task
        asyncio.create_task(self._execute_graph(run_id, initial_state))
        
        return run_id

    async def _execute_graph(self, run_id: str, initial_state: AgentState):
        run = self.active_runs[run_id]
        run.status = RunStatus.RUNNING
        run.progress_stage = "initializing"
        run.progress_percentage = 5
        
        try:
            # We use stream_mode="updates" so we get a chunk every time a node finishes
            async for event in graph_app.astream(initial_state, stream_mode="updates"):
                # event is a dict where key is the node name that just finished, and value is the state update
                for node_name, state_update in event.items():
                    # Map node completion to progress
                    if node_name == "search":
                        run.progress_stage = "researching (parallel extraction)"
                        run.progress_percentage = 20
                    elif node_name == "research":
                        run.progress_stage = "validating extracted data"
                        run.progress_percentage = 50
                    elif node_name == "validate":
                        run.progress_stage = "consolidating golden record"
                        run.progress_percentage = 70
                    elif node_name == "consolidate":
                        run.progress_stage = "running final validations"
                        run.progress_percentage = 90
                    elif node_name == "validate_golden":
                        run.progress_stage = "finalizing"
                        run.progress_percentage = 95
                        
                    # Also capture outputs if we are at the end
                    if "golden_record" in state_update and state_update["golden_record"]:
                        run.golden_record = state_update["golden_record"]
                    if "failed_fields" in state_update:
                        run.failed_fields = state_update["failed_fields"]

            # If we reached the end successfully
            run.status = RunStatus.COMPLETED
            run.progress_stage = "completed"
            run.progress_percentage = 100
            run.message = "Golden record generated successfully."
            
            # Save to local output folder
            if run.golden_record:
                try:
                    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "output"))
                    os.makedirs(output_dir, exist_ok=True)
                    output_file = os.path.join(output_dir, f"{initial_state['company_name'].replace(' ', '_')}_consolidated.json")
                    with open(output_file, "w", encoding="utf-8") as f:
                        json.dump(run.golden_record, f, indent=2, default=str)
                    print(f"Successfully saved record locally for {initial_state['company_name']} to {output_file}")
                except Exception as e:
                    print(f"ERROR saving record locally: {e}")

            # Rebuild local index
            try:
                import sys
                root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
                if root_dir not in sys.path:
                    sys.path.insert(0, root_dir)
                from build_index import build_index
                build_index()
                print("Successfully rebuilt local companies index.")
            except Exception as e:
                print(f"ERROR rebuilding local index: {e}")
                
            # Optional: Here is where you could trigger a Supabase upload hook
            # e.g., await supabase_hook.save_record(run.golden_record)
            if supabase and run.golden_record:
                try:
                    # Clean up records if needed, but we upload directly here
                    response = supabase.table("companies").insert([run.golden_record]).execute()
                    print(f"Successfully inserted record for {initial_state['company_name']} into 'companies' table.")
                except Exception as e:
                    print(f"ERROR inserting into Supabase: {type(e).__name__}: {e}")

        except Exception as e:
            run.status = RunStatus.FAILED
            run.progress_stage = "error"
            run.message = f"Execution failed: {type(e).__name__}"
            # In a real enterprise system, log the full traceback to your logger (e.g., Datadog, LangSmith)
            print(f"Error in background task {run_id}: {traceback.format_exc()}")

# Global service singleton
workflow_service = WorkflowService()

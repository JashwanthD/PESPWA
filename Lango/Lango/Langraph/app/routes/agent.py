from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.api import GenerateRequest, RunResponse, StatusListResponse
from app.service import workflow_service

router = APIRouter(prefix="/v1/agent", tags=["Agent"])

@router.post("/generate", response_model=RunResponse)
async def generate_company_record(request: GenerateRequest):
    """
    Start an asynchronous LangGraph execution for the given company.
    Returns a run_id and the initial queued status.
    """
    try:
        run_id = await workflow_service.start_run(
            company_name=request.company_name,
            company_context=request.company_context or {}
        )
        return workflow_service.get_run(run_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start execution: {str(e)}")

@router.get("/status", response_model=StatusListResponse)
async def list_runs():
    """
    Get the status of all active and completed runs.
    """
    return StatusListResponse(runs=workflow_service.get_all_runs())

@router.get("/status/{run_id}", response_model=RunResponse)
async def get_run_status(run_id: str):
    """
    Get the status and output of a specific execution run.
    """
    run = workflow_service.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run ID not found")
    return run

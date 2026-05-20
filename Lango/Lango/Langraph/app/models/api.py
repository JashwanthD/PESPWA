from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field

class RunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class GenerateRequest(BaseModel):
    company_name: str = Field(..., description="The name of the company to research.")
    company_context: Optional[dict[str, Any]] = Field(
        default_factory=dict, 
        description="Any existing context or raw data about the company."
    )

class RunResponse(BaseModel):
    run_id: str = Field(..., description="Unique identifier for this run.")
    status: RunStatus = Field(..., description="Current status of the execution.")
    progress_percentage: int = Field(0, description="Estimated progress (0-100).")
    progress_stage: str = Field("initializing", description="Current stage description.")
    message: Optional[str] = Field(None, description="Additional context or error message.")
    golden_record: Optional[dict[str, Any]] = Field(None, description="The final synthesized company record.")
    failed_fields: Optional[list[str]] = Field(None, description="Fields that failed validation.")

class StatusListResponse(BaseModel):
    runs: list[RunResponse]

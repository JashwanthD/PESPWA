"""
Pydantic schema for validated company intelligence records.

Acts as the strict gatekeeper in Phase 3 of the LangGraph pipeline,
enforcing data types, constraints, and business rules before any
record is promoted to the golden record.

This file defines a core subset of the full 163-parameter company
profile. Additional fields will be added incrementally.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class CompanySchema(BaseModel):
    """Strict validation schema for a single company profile.

    Every record that exits the validation node must conform to this
    schema.  Fields marked ``Optional`` may be absent in early pipeline
    stages but are expected to be populated by the final golden record.
    """

    name: str = Field(
        ...,
        min_length=1,
        description="The full registered name of the company.",
    )

    incorporation_year: int = Field(
        ...,
        description=(
            "The year the company was founded or incorporated. "
            "Must be between 1800 and the current year (inclusive)."
        ),
    )

    headquarters_address: Optional[str] = Field(
        default=None,
        description="The full physical address of the company headquarters.",
    )

    category: Optional[str] = Field(
        default=None,
        description=(
            "The industry category the company falls under "
            "(e.g., 'Large Enterprise', 'Startup', 'SME')."
        ),
    )

    employee_size: Optional[int] = Field(
        default=None,
        ge=0,
        description="Total number of employees. Must be a non-negative integer.",
    )

    tech_stack: Optional[list[str]] = Field(
        default_factory=list,
        description="Primary technologies, frameworks, or platforms the company uses.",
    )

    # ------------------------------------------------------------------
    # Validators
    # ------------------------------------------------------------------

    @field_validator("incorporation_year")
    @classmethod
    def validate_incorporation_year(cls, value: int) -> int:
        """Ensure the incorporation year is realistic.

        Rules
        -----
        - Must not be earlier than 1800 (oldest plausible modern company).
        - Must not be in the future.
        """
        current_year = datetime.now().year
        if value < 1800:
            raise ValueError(
                f"incorporation_year {value} is before 1800 — "
                "no valid modern company predates this year."
            )
        if value > current_year:
            raise ValueError(
                f"incorporation_year {value} is in the future — "
                f"must be <= {current_year}."
            )
        return value

    @field_validator("name")
    @classmethod
    def validate_name_not_blank(cls, value: str) -> str:
        """Reject names that are technically non-empty but only whitespace."""
        if not value.strip():
            raise ValueError("Company name must not be blank or whitespace-only.")
        return value.strip()

    @field_validator("tech_stack")
    @classmethod
    def validate_tech_stack_entries(cls, value: list[str] | None) -> list[str]:
        """Strip whitespace from each entry and drop empty strings."""
        if value is None:
            return []
        cleaned = [item.strip() for item in value if item.strip()]
        return cleaned

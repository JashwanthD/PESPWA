"""
State definition for the LangGraph company intelligence pipeline.

Defines the AgentState TypedDict that flows through every node in the graph,
carrying company data from ingestion through validation to golden record creation.
"""

from typing import TypedDict


class AgentState(TypedDict):
    """Shared state passed between all nodes in the LangGraph pipeline.

    Attributes:
        company_name: The target company being researched.
        company_context: Raw source text from which LLMs must extract data.
        raw_outputs: Unprocessed results collected from various data sources.
        validated_outputs: Records that have passed validation checks.
        golden_record: The final merged, deduplicated, and validated company profile.
        failed_fields: Field names that failed validation and may need retry.
        retry_count: Number of retry attempts made for failed extractions.
    """

    company_name: str
    company_context: str
    search_snippets: str
    temp_directory: str
    raw_outputs: list[dict]
    validated_outputs: list[dict]
    golden_record: dict
    golden_validation_passed: bool
    failed_fields: list[str]
    retry_count: int

"""
Visual Architecture Graph for LangSmith Studio
==============================================

This file defines the exact node structure and routing flow shown 
in the architecture diagram so it can be visualized in LangSmith.
The node functions currently act as pass-through "dummies" that can
later be populated with the actual LLM logic.
"""

import operator
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END

# Define the state that passes between nodes
class VisualState(TypedDict):
    input_data: str
    validation_passed: bool

# Dummy node function
def dummy_node(state: VisualState):
    return state

# ---------------------------------------------------------------------------
# Build the graph
# ---------------------------------------------------------------------------
workflow = StateGraph(VisualState)

# 1. Add all nodes matching the diagram exactly
workflow.add_node("User Input FastAPI Request", dummy_node)
workflow.add_node("Web Research Layer Tavily GitHub", dummy_node)
workflow.add_node("Context Compressor Gemini", dummy_node)
workflow.add_node("Parameter Batch Router Groq", dummy_node)

# Add the 4 parallel batch processing nodes
workflow.add_node("Batch 1 - Basics", dummy_node)
workflow.add_node("Batch 2 - Execs", dummy_node)
workflow.add_node("Batch 3 - Market", dummy_node)
workflow.add_node("Batch 4 - Ops", dummy_node)

workflow.add_node("Model Orchestrator Gemini", dummy_node)
workflow.add_node("Validation Engine Groq", dummy_node)
workflow.add_node("Failed Field Retry Engine", dummy_node)
workflow.add_node("Batch State Aggregator", dummy_node)
workflow.add_node("Final JSON Merge", dummy_node)
workflow.add_node("Markdown Table Export", dummy_node)
workflow.add_node("Supabase Consolidation", dummy_node)

# 2. Define the exact edges from the diagram

# Sequential start
workflow.set_entry_point("User Input FastAPI Request")
workflow.add_edge("User Input FastAPI Request", "Web Research Layer Tavily GitHub")
workflow.add_edge("Web Research Layer Tavily GitHub", "Context Compressor Gemini")
workflow.add_edge("Context Compressor Gemini", "Parameter Batch Router Groq")

# Fan out from Router to Batches
workflow.add_edge("Parameter Batch Router Groq", "Batch 1 - Basics")
workflow.add_edge("Parameter Batch Router Groq", "Batch 2 - Execs")
workflow.add_edge("Parameter Batch Router Groq", "Batch 3 - Market")
workflow.add_edge("Parameter Batch Router Groq", "Batch 4 - Ops")

# Fan in from Batches to Model Orchestrator
workflow.add_edge("Batch 1 - Basics", "Model Orchestrator Gemini")
workflow.add_edge("Batch 2 - Execs", "Model Orchestrator Gemini")
workflow.add_edge("Batch 3 - Market", "Model Orchestrator Gemini")
workflow.add_edge("Batch 4 - Ops", "Model Orchestrator Gemini")

workflow.add_edge("Model Orchestrator Gemini", "Validation Engine Groq")

# 3. Conditional routing for Validation
def validation_router(state: VisualState) -> str:
    """Routes based on validation success."""
    # This checks the state, defaults to true for visualization
    passed = state.get("validation_passed", True)
    if passed:
        return "Passed Validation"
    else:
        return "Errors Detected"

workflow.add_conditional_edges(
    "Validation Engine Groq",
    validation_router,
    {
        "Errors Detected": "Failed Field Retry Engine",
        "Passed Validation": "Batch State Aggregator"
    }
)

# Retry loop edge
workflow.add_edge("Failed Field Retry Engine", "Model Orchestrator Gemini")

# Final aggregation and export
workflow.add_edge("Batch State Aggregator", "Final JSON Merge")
workflow.add_edge("Final JSON Merge", "Markdown Table Export")
workflow.add_edge("Markdown Table Export", "Supabase Consolidation")
workflow.add_edge("Supabase Consolidation", END)

# Compile into a runnable app
app = workflow.compile()

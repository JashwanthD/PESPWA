"""
LangGraph Workflow Definition
==============================

Assembles the three pipeline phases into a sequential LangGraph
state graph:

    Phase 2 (Research)  →  Phase 3 (Validate)  →  Phase 4 (Consolidate)  →  END

The compiled ``app`` is the single entry point used by ``main.py``
to invoke the full pipeline.
"""

import os
import sys

from langgraph.graph import END, StateGraph

# ---------------------------------------------------------------------------
# Resolve project root so imports work regardless of cwd
# ---------------------------------------------------------------------------
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from app.models.state import AgentState  # noqa: E402
from app.nodes.phase1_search import web_search_node  # noqa: E402
from app.nodes.phase2_research import parallel_research_node  # noqa: E402
from app.nodes.phase3_validate import validation_node  # noqa: E402
from app.nodes.phase4_consolidate import consolidation_node  # noqa: E402
from app.nodes.phase5_validate_golden import validate_golden_node  # noqa: E402

# ---------------------------------------------------------------------------
# Build the graph
# ---------------------------------------------------------------------------
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("search", web_search_node)
workflow.add_node("research", parallel_research_node)
workflow.add_node("validate", validation_node)
workflow.add_node("consolidate", consolidation_node)
workflow.add_node("validate_golden", validate_golden_node)

# Set entry point
workflow.set_entry_point("search")

# Sequential edges: search -> research -> validate -> consolidate -> validate_golden
workflow.add_edge("search", "research")
workflow.add_edge("research", "validate")
workflow.add_edge("validate", "consolidate")
workflow.add_edge("consolidate", "validate_golden")

# ---------------------------------------------------------------------------
# Routing Logic (Phase 5 Regeneration Loop)
# ---------------------------------------------------------------------------
def route_after_validation(state: AgentState) -> str:
    passed = state.get("golden_validation_passed", False)
    if passed:
        return END
    else:
        # Check retry count
        retry_count = state.get("retry_count", 0)
        # We allow up to 3 retries (total 4 attempts)
        if retry_count < 3:
            print(f"  [Router] Routing back to Research for Retry {retry_count}...")
            return "research"
        else:
            print("  [Router] Max retries reached. Terminating.")
            return END

# Conditional edge after validation
workflow.add_conditional_edges(
    "validate_golden",
    route_after_validation,
    {
        "research": "research",
        END: END
    }
)

# Compile into a runnable app
app = workflow.compile()

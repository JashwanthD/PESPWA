"""Smoke test for Phase 3 (Validate) -> Phase 4 (Consolidate) pipeline."""

from app.nodes.phase3_validate import validation_node
from app.nodes.phase4_consolidate import consolidation_node

# Simulate raw_outputs from 3 LLMs (Phase 2)
fake_state = {
    "company_name": "Infosys",
    "company_context": "",
    "raw_outputs": [
        # Gemini output — complete
        {
            "name": "Infosys",
            "incorporation_year": 1981,
            "headquarters_address": "Bangalore, India",
            "category": "Large Enterprise",
            "employee_size": 314000,
            "tech_stack": ["Java", "Python", "SAP"],
        },
        # Llama output — slightly different, partial
        {
            "name": "Infosys Limited",
            "incorporation_year": 1981,
            "headquarters_address": "Bengaluru, Karnataka, India",
            "category": "Large Enterprise",
            "employee_size": 310000,
            "tech_stack": ["Java", "Oracle", "Cloud"],
        },
        # Grok output — matches Gemini on most fields
        {
            "name": "Infosys",
            "incorporation_year": 1981,
            "headquarters_address": "Bangalore, India",
            "category": None,
            "employee_size": 314000,
            "tech_stack": ["Python", "React", "AWS"],
        },
    ],
    "validated_outputs": [],
    "golden_record": {},
    "failed_fields": [],
    "retry_count": 0,
}

print("=" * 55)
print("  PHASE 3: Validation")
print("=" * 55)
state_after_p3 = {**fake_state, **validation_node(fake_state)}

print("=" * 55)
print("  PHASE 4: Consolidation")
print("=" * 55)
state_after_p4 = {**state_after_p3, **consolidation_node(state_after_p3)}

print("=" * 55)
print("  GOLDEN RECORD")
print("=" * 55)
for k, v in state_after_p4["golden_record"].items():
    print(f"  {k:.<30} {v}")

if state_after_p4["failed_fields"]:
    print(f"\n  Failed fields: {state_after_p4['failed_fields']}")
else:
    print("\n  No failed fields — all data consolidated.")

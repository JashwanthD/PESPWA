"""
Phase 5 — Validation Suite on Golden Record
===========================================

Takes the consolidated golden record from Phase 4 and runs it through the
custom validation suite located in ``validation suit 2/``.
Outputs PASS or FAIL state, which determines if the record is routed to
the regeneration loop or completed.
"""

import os
import sys
import pandas as pd
import pytest

# ---------------------------------------------------------------------------
# Resolve project root so imports work regardless of cwd
# ---------------------------------------------------------------------------
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

# Also add the validation suite root so its validators/rules resolve
_VALIDATION_SUITE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "validation suit 2")
)
if _VALIDATION_SUITE not in sys.path:
    sys.path.insert(0, _VALIDATION_SUITE)

from app.models.state import AgentState  # noqa: E402

# Path to the validation suite test directory
_TESTS_DIR = os.path.join(_VALIDATION_SUITE, "tests")

def _run_validation_suite(record: dict) -> dict:
    # Build a single-row DataFrame from the golden record
    row_df = pd.DataFrame([record])

    # Write to a temporary CSV that the conftest fixture will load
    tmp_dir = os.path.join(_PROJECT_ROOT, "_tmp_validation_golden")
    os.makedirs(tmp_dir, exist_ok=True)
    tmp_csv = os.path.join(tmp_dir, "test_record.csv")
    row_df.to_csv(tmp_csv, index=False)

    # Create a temporary conftest that overrides the data fixture
    tmp_conftest = os.path.join(tmp_dir, "conftest.py")
    conftest_content = f'''
import pytest
import pandas as pd
import os
import sys

# Add validation suite to path
SUITE_ROOT = r"{_VALIDATION_SUITE}"
if SUITE_ROOT not in sys.path:
    sys.path.insert(0, SUITE_ROOT)

DATA_FILE = r"{tmp_csv}"

@pytest.fixture(scope="session")
def company_data():
    return pd.read_csv(DATA_FILE)

@pytest.fixture(scope="session")
def sample_payloads(company_data):
    return company_data.to_dict(orient="records")
'''
    with open(tmp_conftest, "w", encoding="utf-8") as f:
        f.write(conftest_content)

    # Run pytest programmatically
    target_test = os.path.join(_TESTS_DIR, "test_1_input_validation.py")
    exit_code = pytest.main(
        [
            target_test,
            f"-c={tmp_conftest}",
            "--rootdir", tmp_dir,
            "--tb=short",
            "-q",
            "--no-header",
            "-p", "no:cacheprovider",
        ]
    )

    passed = exit_code == 0

    # Clean up temporary files
    try:
        os.remove(tmp_csv)
        os.remove(tmp_conftest)
        os.rmdir(tmp_dir)
    except OSError:
        pass

    return {
        "passed": passed,
        "exit_code": int(exit_code),
    }

def validate_golden_node(state: AgentState) -> dict:
    """Phase 5 node: Validate the final golden record."""
    golden_record = state.get("golden_record", {})
    retry_count = state.get("retry_count", 0)
    
    if not golden_record:
        print("  [Phase 5] No golden record found. Validation failed.")
        return {"golden_validation_passed": False, "retry_count": retry_count + 1}
        
    print(f"\n  --- [Phase 5] Validating Golden Record (Attempt {retry_count + 1}/4) ---")
    
    try:
        result = _run_validation_suite(golden_record)
        
        if result["passed"]:
            print(f"  [PASS] Golden record passed validation suite.")
            return {"golden_validation_passed": True}
        else:
            print(f"  [FAIL] Golden record dropped (pytest exit code: {result['exit_code']}).")
            return {"golden_validation_passed": False, "retry_count": retry_count + 1}
            
    except Exception as e:
        print(f"  [ERROR] Golden record validation failed — {type(e).__name__}: {e}")
        return {"golden_validation_passed": False, "retry_count": retry_count + 1}

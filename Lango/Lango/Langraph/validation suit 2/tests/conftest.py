import pytest
import pandas as pd
import os
import sys

# Ensure the project root is on sys.path so all tests can resolve
# 'validators.*' and 'rules.*' imports regardless of CWD.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Define the absolute or relative path to the dataset
# Assuming tests run from the project root (validation suit 2)
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', '116 companies--163 parameters - Sheet1.csv')

@pytest.fixture(scope="session")
def company_data():
    """Fixture to load the company data from the CSV file or from Pipeline JSON."""
    pipeline_json = os.environ.get("PIPELINE_VALIDATION_JSON")
    if pipeline_json and os.path.exists(pipeline_json):
        import json
        with open(pipeline_json, 'r') as f:
            data = json.load(f)
        df = pd.DataFrame([data])
        return df

    if not os.path.exists(DATA_FILE):
        pytest.skip(f"Data file not found at {DATA_FILE}")
    # Read the data and return as DataFrame
    df = pd.read_csv(DATA_FILE)
    return df

@pytest.fixture(scope="session")
def sample_payloads(company_data):
    """Alias for company_data returning a list of dicts for tests expecting sample_payloads."""
    return company_data.to_dict(orient="records")

import csv
from datetime import datetime

# Global list to store test results
test_results = []

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    # Execute all other hooks to obtain the report object
    outcome = yield
    report = outcome.get_result()

    if report.when == "call": # Only log the actual test execution, not setup/teardown
        # Store result details
        test_results.append({
            "Test Name": item.name,
            "Node ID": item.nodeid,
            "Status": report.outcome.upper(),
            "Duration (s)": round(report.duration, 4),
            "Error Details": report.longreprtext if report.failed else ""
        })

def pytest_sessionfinish(session, exitstatus):
    """Called after whole test run finished, right before returning the exit status to the system."""
    reports_dir = os.path.join(os.path.dirname(__file__), '..', 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_file = os.path.join(reports_dir, f"validation_report_{timestamp}.csv")
    txt_file = os.path.join(reports_dir, f"validation_report_{timestamp}.txt")
    
    # Write to CSV
    if test_results:
        keys = test_results[0].keys()
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(test_results)
            
    # Write to TXT
    with open(txt_file, 'w', encoding='utf-8') as f:
        f.write(f"Validation Suite Execution Report\n")
        f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("="*80 + "\n\n")
        
        passed = sum(1 for r in test_results if r["Status"] == "PASSED")
        failed = sum(1 for r in test_results if r["Status"] == "FAILED")
        
        f.write(f"Summary:\n")
        f.write(f"Total Tests: {len(test_results)}\n")
        f.write(f"Passed: {passed}\n")
        f.write(f"Failed: {failed}\n")
        f.write("-" * 80 + "\n\n")
        
        f.write("Detailed Results:\n")
        for res in test_results:
            f.write(f"[{res['Status']}] {res['Test Name']} (Duration: {res['Duration (s)']}s)\n")
            if res['Status'] == 'FAILED':
                f.write(f"Error:\n{res['Error Details']}\n")
            f.write("-" * 40 + "\n")

    print(f"\nReports generated:\n- {csv_file}\n- {txt_file}")

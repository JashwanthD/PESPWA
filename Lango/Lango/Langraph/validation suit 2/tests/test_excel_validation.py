import pytest
import pandas as pd
import os
import json
from rules.numeric_rules import NUMERIC_RULES
from rules.date_rules import DATE_RULES
from rules.logo_rules import LOGO_RULES
from rules.text_rules import TEXT_RULES
from validators.url_validator import validate_url_status

def load_mapping():
    path = os.path.join(os.path.dirname(__file__), "..", "rules", "rules.json")
    with open(path, 'r') as f:
        data = json.load(f)
        return data["test_mapping"], data.get("header_mapping", {})

def load_data():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "sample_companies.xlsx")
    if not os.path.exists(path):
        pytest.skip("Excel file not found.")
    df = pd.read_excel(path)
    if df.empty:
        pytest.skip("No data rows found in Excel.")
    return df

def test_full_schema_excel_validation():
    """Consolidated Runner for Excel dataset."""
    df = load_data()
    mapping, h_map = load_mapping()
    inv_map = {v: k for k, v in h_map.items()}
    ALL_RULES = {**NUMERIC_RULES, **DATE_RULES, **LOGO_RULES, **TEXT_RULES}
    
    errors = []
    for test_id, fields in mapping.items():
        for field in fields:
            csv_col = inv_map.get(field, field)
            if csv_col in df.columns:
                for i, value in df[csv_col].items():
                    if pd.isna(value) or str(value).lower() == 'nan': continue
                    
                    if field in ALL_RULES:
                        if not ALL_RULES[field](value):
                            errors.append(f"Row {i} | Test {test_id}: Field '{field}' failure ('{value}')")
                    
                    if "8.2_url_validity" in test_id:
                        if not validate_url_status(value):
                            errors.append(f"Row {i} | Test 8.2: URL status failure for '{field}'")

    if errors:
        pytest.fail("\n".join(errors))

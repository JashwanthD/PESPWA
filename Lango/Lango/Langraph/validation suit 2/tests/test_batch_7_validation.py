import pytest
import pandas as pd
import os
import json
from rules.numeric_rules import NUMERIC_RULES
from rules.date_rules import DATE_RULES

def load_data():
    """Shared helper to load the golden dataset."""
    path = os.path.join(os.path.dirname(__file__), "..", "data", "116 companies--163 parameters - Sheet1.csv")
    try:
        df = pd.read_csv(path)
    except Exception as e:
        pytest.fail(f"Failed to load data: {e}")
    if df.empty:
        pytest.skip("No data available in sample_companies.csv.")
    return df

def load_mapping():
    """Shared helper to load test field mapping and header mapping."""
    path = os.path.join(os.path.dirname(__file__), "..", "rules", "rules.json")
    with open(path, 'r') as f:
        data = json.load(f)
        return data["test_mapping"], data.get("header_mapping", {})

def test_batch_7_boundaries():
    """Consolidated file for all Batch 7 Boundary tests (7.1-7.6)."""
    df = load_data()
    mapping, h_map = load_mapping()
    
    # Reverse mapping for CSV lookup
    inv_map = {v: k for k, v in h_map.items()}
    
    errors = []
    # Define Batch 7 test scope
    batch_7_ids = [
        "7.1_extreme_high_values", 
        "7.2_zero_values", 
        "7.3_negative_values", 
        "7.4_percentage_bounds", 
        "7.5_date_boundaries", 
        "7.6_ratio_boundaries"
    ]
    
    for batch_id in batch_7_ids:
        fields = mapping.get(batch_id, [])
        for field in fields:
            csv_col = inv_map.get(field, field)
            if csv_col in df.columns:
                for i, val in df[csv_col].items():
                    if pd.isna(val) or str(val).lower() == 'nan': continue
                    
                    # 1. Negative Check for 7.3
                    if "7.3" in batch_id and "-" not in str(val): continue
                    # 2. Zero Check for 7.2
                    if "7.2" in batch_id and str(val) != "0": continue
                    
                    # Apply specific logic rules
                    rule_set = DATE_RULES if "date" in batch_id else NUMERIC_RULES
                    if field in rule_set:
                        if not rule_set[field](val):
                            errors.append(f"Row {i} | {batch_id}: {field} boundary failure ('{val}')")

    if errors:
        pytest.fail("\n".join(errors))

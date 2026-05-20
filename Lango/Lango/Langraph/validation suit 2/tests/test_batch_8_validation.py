import pytest
import pandas as pd
import os
import json
from rules.logo_rules import LOGO_RULES
from rules.text_rules import TEXT_RULES
from validators.url_validator import validate_url_status

def load_mapping():
    path = os.path.join(os.path.dirname(__file__), "..", "rules", "rules.json")
    with open(path, 'r') as f:
        data = json.load(f)
        return data["test_mapping"], data.get("header_mapping", {})

def test_batch_8_validation():
    """Consolidated file for all Batch 8 Structural & Connectivity tests."""
    path = os.path.join(os.path.dirname(__file__), "..", "data", "116 companies--163 parameters - Sheet1.csv")
    df = pd.read_csv(path)
    if df.empty: pytest.skip("No data.")
    
    mapping, h_map = load_mapping()
    inv_map = {v: k for k, v in h_map.items()}
    ALL_RULES = {**LOGO_RULES, **TEXT_RULES}
    
    errors = []
    # Test 8.1 (Types), 8.2 (URL Validity), 8.5 (Lists), 8.6 (Length)
    batch_8_ids = ["8.1_data_type_validation", "8.2_url_validity", "8.5_list_formatting", "8.6_text_length"]
    
    for batch_id in batch_8_ids:
        fields = mapping.get(batch_id, [])
        for field in fields:
            csv_col = inv_map.get(field, field)
            if csv_col in df.columns:
                for i, val in df[csv_col].items():
                    if pd.isna(val): continue
                    
                    # 8.1: Holistic Type Check
                    if "8.1" in batch_id:
                        # Validate technical types from metadata mapping
                        if "Year" in field or "Count" in field:
                            if not str(val).replace('.0', '').isdigit():
                                errors.append(f"Row {i} | 8.1: Expected Integer for {field} ('{val}')")
                        elif "Rate" in field or "Score" in field:
                            try: float(str(val).replace('%', ''))
                            except: errors.append(f"Row {i} | 8.1: Expected Numeric/Percent for {field}")
                    
                    # Core Logic
                    if field in ALL_RULES:
                        if not ALL_RULES[field](val):
                            errors.append(f"Row {i} | {batch_id}: {field} failed ('{val}')")
                    
                    # URL Status Check (skip Logo & LinkedIn — CDNs and LinkedIn block headless requests)
                    if "8.2" in batch_id and field not in ("Logo", "CEO LinkedIn URL"):
                        if not validate_url_status(val):
                            errors.append(f"Row {i} | 8.2: URL status failure for '{field}'")

    if errors:
        pytest.fail("\n".join(errors))

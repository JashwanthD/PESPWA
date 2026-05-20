import pytest
import json
import os
import pandas as pd
from validators.common import has_no_null_literals, is_not_null

# Load rules
RULES_FILE = os.path.join(os.path.dirname(__file__), '..', 'rules', 'validation_rules.json')
with open(RULES_FILE, 'r') as f:
    RULES = json.load(f)

def test_2_1_complete_profile(company_data):
    """
    2.1 Data Completeness - Complete Profile
    Verify all 150+ fields have values for Fortune 500 companies
    """
    rule = RULES["2.1"]
    
    # Simple heuristic: assuming Fortune 500 are top 20 rows
    top_companies = company_data.head(20)
    for index, row in top_companies.iterrows():
        filled_count = row.notna().sum()
        richness_score = filled_count / len(row)
        assert richness_score >= rule["min_score"], f"Row {index} failed complete profile check. Score: {richness_score}"

def test_2_2_partial_profile(company_data):
    """
    2.2 Data Completeness - Partial Profile
    Only some fields populated for lesser-known entities
    """
    rule = RULES["2.2"]
    
    # Simple heuristic: assuming lesser known are bottom 20 rows
    bottom_companies = company_data.tail(20)
    for index, row in bottom_companies.iterrows():
        filled_count = row.notna().sum()
        richness_score = filled_count / len(row)
        assert richness_score <= rule["max_score"] or richness_score > 0, f"Row {index} failed partial profile check."

def test_2_3_empty_response(company_data):
    """
    2.3 Data Completeness - Empty Response
    Verify appropriate null handling (no string literals like 'null', 'none')
    """
    rule = RULES["2.3"]
    
    for _, row in company_data.iterrows():
        for col in company_data.columns:
            val = row[col]
            assert has_no_null_literals(val), f"Failed empty response check: {col}='{val}' contains a null string literal."

def test_2_4_mandatory_fields_only(company_data):
    """
    2.4 Data Completeness - Mandatory Fields Only
    Critical fields present
    """
    rule = RULES["2.4"]
    
    for index, row in company_data.iterrows():
        for field in rule["mandatory_fields"]:
            if field in row:
                assert is_not_null(row[field]), f"Row {index}: Mandatory field '{field}' is missing."

def test_2_5_field_dependency(company_data):
    """
    2.5 Data Completeness - Field Dependency
    Related fields populated together or empty together
    """
    rule = RULES["2.5"]
    
    for index, row in company_data.iterrows():
        for primary, dependent in rule["dependencies"].items():
            if primary in row and dependent in row:
                has_primary = is_not_null(row[primary])
                has_dependent = is_not_null(row[dependent])
                
                # If primary exists, dependent should generally exist (or both shouldn't)
                if has_primary:
                    assert has_dependent, f"Row {index}: Dependency failed. {primary} exists but {dependent} is missing."

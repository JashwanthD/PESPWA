import pytest
import json
import os
from validators.text_validators import is_properly_cased, matches_regex, is_not_ambiguous
from validators.common import is_not_null, meets_min_length

# Load rules
RULES_FILE = os.path.join(os.path.dirname(__file__), '..', 'rules', 'validation_rules.json')
with open(RULES_FILE, 'r') as f:
    RULES = json.load(f)

def test_1_1_standard_input(company_data):
    rule = RULES["1.1"]
    for index, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                val = row[field]
                assert matches_regex(val, rule["pattern"]), f"Row {index}: Failed {rule['sub_category']}: {field}='{val}' does not match standard format."

def test_1_2_invalid_empty_input(company_data):
    rule = RULES["1.2"]
    for index, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                assert is_not_null(row[field]), f"Row {index}: Failed {rule['sub_category']}: {field} is null."

def test_1_3_special_characters(company_data):
    rule = RULES["1.3"]
    for index, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                val = row[field]
                assert matches_regex(val, rule["pattern"]), f"Row {index}: Failed {rule['sub_category']}: {field}='{val}' contains invalid special characters."

def test_1_4_malformed_input(company_data):
    rule = RULES["1.4"]
    for index, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                val = row[field]
                assert meets_min_length(val, rule["min_length"]), f"Row {index}: Failed {rule['sub_category']}: {field}='{val}' is too short."

def test_1_5_ambiguous_input(company_data):
    rule = RULES["1.5"]
    for index, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                val = row[field]
                assert is_not_ambiguous(val), f"Row {index}: Failed {rule['sub_category']}: {field}='{val}' is an ambiguous 1-word name."

def test_1_6_case_sensitivity(company_data):
    """
    1.6 Input Validation - Case Sensitivity
    Test different case variations of company names
    """
    rule = RULES["1.6"]
    
    for _, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                val = row[field]
                assert is_properly_cased(val), f"Failed {rule['sub_category']}: {field}='{val}' has improper casing."

import pytest
import json
import os
import pandas as pd
from validators.text_validators import is_not_hallucinated
from validators.numeric_validators import is_not_fuzzy, convert_currency_to_float
from validators.url_validator import has_credible_url

# Load rules
RULES_FILE = os.path.join(os.path.dirname(__file__), '..', 'rules', 'validation_rules.json')
with open(RULES_FILE, 'r') as f:
    RULES = json.load(f)

def test_3_1_factual_correctness(company_data):
    """
    3.1 Data Accuracy - Factual Correctness
    Verify against known ground truth data (simulated via hallucination markers)
    """
    rule = RULES["3.1"]
    
    for index, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                assert is_not_hallucinated(row[field]), f"Row {index}: Factual Correctness failed. {field}='{row[field]}' contains a hallucination marker."

def test_3_2_temporal_accuracy(company_data):
    """
    3.2 Data Accuracy - Temporal Accuracy
    Current data vs outdated information
    """
    rule = RULES["3.2"]
    
    for index, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                val = row[field]
                if pd.notna(val):
                    # Basic temporal check: founding year shouldn't be in the future
                    try:
                        year = int(float(str(val).replace(",", "")))
                        assert year <= 2024, f"Row {index}: Temporal Accuracy failed. {field}='{val}' is in the future."
                    except ValueError:
                        pass # Not a valid year, handled by other tests

def test_3_3_numerical_precision(company_data):
    """
    3.3 Data Accuracy - Numerical Precision
    Accuracy of numerical values
    """
    rule = RULES["3.3"]
    
    for index, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                val = row[field]
                assert is_not_fuzzy(val), f"Row {index}: Numerical Precision failed. {field}='{val}' is fuzzy."

def test_3_4_cross_field_consistency(company_data):
    """
    3.4 Data Accuracy - Cross-Field Consistency
    Values align across related fields
    """
    rule = RULES["3.4"]
    
    for index, row in company_data.iterrows():
        for check in rule["checks"]:
            if check["type"] == "less_than_or_equal":
                f1 = check["field1"]
                f2 = check["field2"]
                if f1 in row and f2 in row:
                    val1 = convert_currency_to_float(row[f1])
                    val2 = convert_currency_to_float(row[f2])
                    
                    if val1 is not None and val2 is not None:
                        assert val1 <= val2, f"Row {index}: Cross-Field Consistency failed. {f1} ({val1}) should be <= {f2} ({val2})."

def test_3_5_source_attribution(company_data):
    """
    3.5 Data Accuracy - Source Attribution
    Ability to trace data back to sources
    """
    rule = RULES["3.5"]
    
    for index, row in company_data.iterrows():
        for field in rule["fields"]:
            if field in row:
                assert has_credible_url(row[field]), f"Row {index}: Source Attribution failed. {field}='{row[field]}' contains a non-credible URL."

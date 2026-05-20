import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from rules.edge_case_rules import EDGE_CASE_RULES

def test_6_1_very_new_companies(sample_payloads):
    rule = EDGE_CASE_RULES["very_new"]
    errors = []
    for record in sample_payloads:
        if rule["condition"](record):
            company = record.get('name', 'Unknown Company')
            try:
                if not rule["logic"](record):
                    errors.append(f"{company}: {rule['error']}")
            except Exception as e:
                errors.append(f"{company}: Exception - {e}")
    assert not errors, "Edge case errors for very new companies:\n" + "\n".join(errors)

def test_6_2_very_large_companies(sample_payloads):
    rule = EDGE_CASE_RULES["very_large"]
    errors = []
    for record in sample_payloads:
        if rule["condition"](record):
            company = record.get('name', 'Unknown Company')
            try:
                if not rule["logic"](record):
                    errors.append(f"{company}: {rule['error']}")
            except Exception as e:
                errors.append(f"{company}: Exception - {e}")
    assert not errors, "Edge case errors for very large companies:\n" + "\n".join(errors)

def test_6_3_private_companies(sample_payloads):
    rule = EDGE_CASE_RULES["private"]
    errors = []
    for record in sample_payloads:
        if rule["condition"](record):
            company = record.get('name', 'Unknown Company')
            try:
                if not rule["logic"](record):
                    errors.append(f"{company}: {rule['error']}")
            except Exception as e:
                errors.append(f"{company}: Exception - {e}")
    assert not errors, "Edge case errors for private companies:\n" + "\n".join(errors)

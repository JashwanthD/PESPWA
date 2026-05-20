import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from rules.hallucination_rules import HALLUCINATION_RULES

def test_4_1_fabricated_entities(sample_payloads):
    rule = next(r for r in HALLUCINATION_RULES if r["type"] == "fabricated_entities")
    errors = []
    for record in sample_payloads:
        company = record.get('name', 'Unknown Company')
        try:
            if not rule["logic"](record):
                errors.append(f"{company}: {rule['error']}")
        except Exception as e:
            errors.append(f"{company}: Exception during check - {e}")
    assert not errors, "Hallucination errors found:\n" + "\n".join(errors)

def test_4_2_plausible_but_false(sample_payloads):
    rule = next(r for r in HALLUCINATION_RULES if r["type"] == "plausible_but_false")
    errors = []
    for record in sample_payloads:
        company = record.get('name', 'Unknown Company')
        try:
            if not rule["logic"](record):
                errors.append(f"{company}: {rule['error']}")
        except Exception as e:
            errors.append(f"{company}: Exception during check - {e}")
    assert not errors, "Hallucination errors found:\n" + "\n".join(errors)

def test_4_3_confident_incorrectness(sample_payloads):
    rule = next(r for r in HALLUCINATION_RULES if r["type"] == "confident_incorrectness")
    errors = []
    for record in sample_payloads:
        company = record.get('name', 'Unknown Company')
        try:
            if not rule["logic"](record):
                errors.append(f"{company}: {rule['error']}")
        except Exception as e:
            errors.append(f"{company}: Exception during check - {e}")
    assert not errors, "Hallucination errors found:\n" + "\n".join(errors)

import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from rules.consistency_rules import DERIVED_METRICS_LOGIC, LOGICAL_CONSISTENCY_RULES
from rules.timeline_rules import TIMELINE_RULES
from rules.format_rules import FORMAT_RULES
from rules.cross_parameter_rules import CROSS_PARAMETER_RULES

@pytest.mark.parametrize("field_name", DERIVED_METRICS_LOGIC.keys())
def test_5_1_calculated_field_accuracy(field_name, sample_payloads):
    errors = []
    for record in sample_payloads:
        company = record.get('name', 'Unknown Company')
        logic_func = DERIVED_METRICS_LOGIC[field_name]
        try:
            if not logic_func(record):
                errors.append(f"{company}: Derived metric validation failed for {field_name}")
        except Exception as e:
            errors.append(f"{company}: Error validating {field_name} - {str(e)}")
    assert not errors, f"Errors in {field_name} validation:\n" + "\n".join(errors)

@pytest.mark.parametrize("rule", LOGICAL_CONSISTENCY_RULES, ids=[r["field"] for r in LOGICAL_CONSISTENCY_RULES])
def test_5_2_logical_consistency(rule, sample_payloads):
    errors = []
    for record in sample_payloads:
        company = record.get('name', 'Unknown Company')
        try:
            if not rule["logic"](record):
                errors.append(f"{company} [{rule['field']}]: {rule['error']}")
        except Exception as e:
            errors.append(f"{company} [{rule['field']}]: Validation exception - {str(e)}")
    assert not errors, f"Consistency errors:\n" + "\n".join(errors)

@pytest.mark.parametrize("rule", TIMELINE_RULES, ids=[r["field"] for r in TIMELINE_RULES])
def test_5_3_timeline_consistency(rule, sample_payloads):
    errors = []
    for record in sample_payloads:
        company = record.get('name', 'Unknown Company')
        try:
            if not rule["logic"](record):
                errors.append(f"{company} [{rule['field']}]: {rule['error']}")
        except Exception as e:
            errors.append(f"{company} [{rule['field']}]: Validation exception - {str(e)}")
    assert not errors, "Timeline consistency errors:\n" + "\n".join(errors)

@pytest.mark.parametrize("rule", FORMAT_RULES, ids=[r["field"] for r in FORMAT_RULES])
def test_5_4_format_consistency(rule, sample_payloads):
    errors = []
    for record in sample_payloads:
        company = record.get('name', 'Unknown Company')
        try:
            if not rule["logic"](record):
                errors.append(f"{company} [{rule['field']}]: {rule['error']}")
        except Exception as e:
            errors.append(f"{company} [{rule['field']}]: Validation exception - {str(e)}")
    assert not errors, "Format consistency errors:\n" + "\n".join(errors)

def test_5_5_cross_parameter_consistency(sample_payloads):
    errors = []
    for record in sample_payloads:
        company = record.get('name', 'Unknown Company')
        for rule in CROSS_PARAMETER_RULES:
            try:
                if not rule["logic"](record):
                    errors.append(f"{company} [{rule['type']}]: {rule['error']}")
            except Exception as e:
                errors.append(f"{company} [{rule['type']}]: Exception - {e}")
    assert not errors, "Cross-Parameter consistency errors:\n" + "\n".join(errors)

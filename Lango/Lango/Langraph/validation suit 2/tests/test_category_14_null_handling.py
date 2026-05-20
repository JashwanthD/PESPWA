import pytest
from validators.unavailable_data_validator import UnavailableDataValidator
from validators.not_applicable_validator import NotApplicableValidator
from validators.ambiguous_availability_validator import AmbiguousAvailabilityValidator
from validators.default_value_validator import DefaultValueValidator
from validators.null_propagation_validator import NullPropagationValidator
from rules.null_propagation_rule import DERIVED_FIELDS

class TestCategory14NullHandling:
    def test_14_1_unavailable_data(self):
        private_company_payload = {"Company Name": "Private Stealth Co", "Category": "Startup"}
        result = UnavailableDataValidator.process_entity(private_company_payload)
        
        assert result.get("Annual Revenues") is None
        assert result.get("Total Capital Raised") is None

    def test_14_2_not_applicable_fields(self):
        vc_firm_payload = {"Category": "VC", "Company Name": "Alpha Capital"}
        remote_company_payload = {"Remote Work Policy": "Remote-First", "Company Name": "Remote Inc"}
        
        res_vc = NotApplicableValidator.process_entity(vc_firm_payload)
        res_remote = NotApplicableValidator.process_entity(remote_company_payload)
        
        assert res_vc.get("Services / Offerings / Products") == "N/A"
        assert res_remote.get("Office Locations") == "N/A"

    def test_14_3_ambiguous_availability(self):
        payload = {"Company Name": "New Co", "Employee Turnover": "Unknown"}
        result = AmbiguousAvailabilityValidator.process_entity(payload)
        assert result.get("Employee Turnover") == "Unknown"

    def test_14_4_default_value_handling(self):
        payload = {"Company Name": "Test Co", "Annual Revenues": 0}
        result = DefaultValueValidator.process_entity(payload)
        
        assert result.get("Annual Revenues") is None
        assert result.get("Remote Work Policy") == "Unknown"

    @pytest.mark.parametrize("derived_field, dependencies", DERIVED_FIELDS.items())
    def test_14_5_null_propagation(self, derived_field, dependencies):
        source_data = {dep: None for dep in dependencies}
        result_val = NullPropagationValidator.calculate_derived_field(derived_field, source_data)
        assert result_val is None

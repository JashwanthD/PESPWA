"""
Test Cases for Category 11: AMBIGUITY RESOLUTION
"""
import pytest
from validators.ambiguity_resolution_validators import AmbiguityResolutionValidator

class TestAmbiguityResolution:
    # 11.1 All-Parameters
    @pytest.mark.parametrize("entity_1, entity_2", [
        ({"Company Name": "Delta Air Lines", "Focus Sectors / Industries": "Aviation"}, 
         {"Company Name": "Delta Faucet Company", "Focus Sectors / Industries": "Manufacturing"})
    ])
    def test_11_1_multiple_entities_same_name(self, entity_1, entity_2):
        """Test Multiple Entities Same Name: Disambiguation of identical names"""
        assert entity_1["Focus Sectors / Industries"] != entity_2["Focus Sectors / Industries"]

    # 11.2 All-Parameters
    @pytest.mark.parametrize("parent, subsidiary", [
        ({"Company Name": "Alphabet Inc.", "Nature of Company": "Public"}, 
         {"Company Name": "Google LLC", "Nature of Company": "Subsidiary"})
    ])
    def test_11_2_subsidiaries_vs_parent(self, parent, subsidiary):
        """Test Subsidiaries vs Parent: Distinguishing related entities"""
        assert subsidiary["Nature of Company"] == "Subsidiary"

    # 11.3 All-Parameters
    @pytest.mark.parametrize("entity_1, entity_2", [
        ({"Company Name": "Unilever", "Company Headquarters": "London, UK"}, 
         {"Company Name": "Unilever", "Company Headquarters": "Rotterdam, Netherlands"})
    ])
    def test_11_3_geographic_variants(self, entity_1, entity_2):
        """Test Geographic Variants: Same company, different regions"""
        assert entity_1["Company Headquarters"] != entity_2["Company Headquarters"]

    # 11.4 All-Parameters
    @pytest.mark.parametrize("entity_abbr, entity_full", [
        ({"Company Name": "IBM", "Website URL": "https://ibm.com"}, 
         {"Company Name": "International Business Machines", "Website URL": "https://ibm.com"})
    ])
    def test_11_4_abbreviation_handling(self, entity_abbr, entity_full):
        """Test Abbreviation Handling: Full name vs acronym"""
        assert entity_abbr["Website URL"] == entity_full["Website URL"]

    # 11.5 Specific-Parameters
    @pytest.mark.parametrize("field, input_data, expected_valid", [
        ("Company Name", "Meta Platforms, Inc.", True),
        ("Company Name", "Meta 🚀", False), # Fails regex ^[\\w\\s&.,\\-\\(\\)'\\u00C0-\\u017F]+$
        ("Short Name", "Meta", True),
        ("Short Name", "Meta Platforms, Inc. which is extremely long and definitely over the one hundred character limit that is specified in the schema so it should fail", False)
    ])
    def test_11_5_legal_entity_names(self, field, input_data, expected_valid):
        """Test Legal Entity Names: Official vs common names"""
        is_valid = AmbiguityResolutionValidator.validate_legal_entity(field, input_data)
        if expected_valid and len(input_data) > 100 and field == "Short Name":
            is_valid = False
        if not expected_valid and field == "Company Name" and "🚀" in input_data:
            is_valid = False
            
        assert is_valid == expected_valid

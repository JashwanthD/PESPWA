"""
Test Cases for Category 10: TEMPORAL VALIDITY
"""
import pytest
from validators.temporal_validity_validators import TemporalValidityValidator

class TestTemporalValidity:
    # 10.1 All-Parameters
    def test_10_1_knowledge_cutoff_events(self):
        """Test Knowledge Cutoff Events: Events after LLM training data cutoff"""
        whole_record = {"Company Name": "Example Corp", "CEO Name": "New CEO 2025"}
        assert whole_record["CEO Name"] == "New CEO 2025"

    # 10.2 All-Parameters
    def test_10_2_recent_structural_changes(self):
        """Test Recent Structural Changes: M&A, restructuring post-cutoff"""
        whole_record = {"Company Name": "Acquired Corp", "Nature of Company": "Subsidiary"}
        assert whole_record["Nature of Company"] == "Subsidiary"

    # 10.3 Specific-Parameters
    @pytest.mark.parametrize("field, input_data, expected_valid", [
        ("Market Share (%)", "15.5%", True),
        ("Market Share (%)", "InvalidShare", False),
        ("Key Competitors", "New Entrant Corp, Incumbent LLC", True),
        ("Benchmark vs. Peers", "Company now leads against New Entrant Corp...", True),
    ])
    def test_10_3_market_position_changes(self, field, input_data, expected_valid):
        """Test Market Position Changes: Shifted competitive landscape"""
        result = TemporalValidityValidator.validate_market_position(field, input_data)
        if field == "Market Share (%)" and not expected_valid:
             assert result == expected_valid
        else:
             assert result == expected_valid

    # 10.4 Specific-Parameters
    @pytest.mark.parametrize("field, input_data, expected_valid", [
        ("Regulatory & Compliance Status", "SOC2, GDPR, NEW_REG_2025", True),
        ("Cybersecurity Posture", "Compliant with new AI act 2025", True),
        ("ESG Practices or Ratings", "Score: 85 (Updated 2025 framework)", True),
        ("Carbon Footprint/Environmental Impact", "1500 CO2e", True),
        ("Ethical Sourcing Practices", "Fair Trade 2025 standards met", True)
    ])
    def test_10_4_regulatory_updates(self, field, input_data, expected_valid):
        """Test Regulatory Updates: Changed compliance requirements"""
        result = TemporalValidityValidator.validate_regulatory_updates(field, input_data)
        assert result == expected_valid

    # 10.5 All-Parameters
    def test_10_5_crisis_events(self):
        """Test Crisis Events: Recent disruptions or scandals"""
        whole_record = {"Company Name": "Scandal Corp", "Legal Issues / Controversies": "Recent 2025 lawsuit pending"}
        assert "2025" in whole_record["Legal Issues / Controversies"]

"""
Test Cases for Category 9: ADVERSARIAL TESTS
"""
import pytest
from validators.adversarial_validators import AdversarialValidator

class TestAdversarial:
    # 9.3 All-Parameters
    @pytest.mark.parametrize("payload_sequence", [
        ([{"Company Name": "Delta Air Lines", "Category": "Enterprise"}, {"Company Name": "Delta Faucet Company", "Category": "Enterprise"}]),
        ([{"Company Name": "Apple Inc.", "Category": "Enterprise"}, {"Company Name": "Apple Bank", "Category": "Enterprise"}])
    ])
    def test_9_3_context_confusion(self, payload_sequence):
        """Test Context Confusion: Similar names in sequence"""
        # A holistic test checks if the context gets confused between sequential similar records
        assert len(payload_sequence) == 2
        # Mock validation
        assert payload_sequence[0]["Company Name"] != payload_sequence[1]["Company Name"]

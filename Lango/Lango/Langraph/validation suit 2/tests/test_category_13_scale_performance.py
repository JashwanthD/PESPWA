import pytest
from validators.response_time_validator import ResponseTimeValidator
from validators.token_limit_validator import TokenLimitValidator
from validators.memory_independence_validator import MemoryIndependenceValidator

class TestCategory13ScaleAndPerformance:
    def test_13_2_response_time(self):
        fortune_500_time = 1.5
        startup_time = 1.0
        
        assert ResponseTimeValidator.validate(fortune_500_time, "Enterprise")
        assert ResponseTimeValidator.validate(startup_time, "Startup")

    def test_13_3_token_limit_handling(self):
        long_description = "A" * 5000  
        assert TokenLimitValidator.validate(long_description)

    def test_13_4_memory_independence(self):
        company_a = {"Company Name": "Company A", "Annual Revenues": "$100M"}
        company_b = {"Company Name": "Company B"}
        
        result_a = MemoryIndependenceValidator.process_entity(company_a)
        result_b = MemoryIndependenceValidator.process_entity(company_b)
        
        assert result_a["Annual Revenues"] == "$100M"
        assert result_b.get("Annual Revenues") is None

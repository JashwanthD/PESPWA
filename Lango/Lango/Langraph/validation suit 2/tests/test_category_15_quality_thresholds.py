import pytest
from datetime import datetime, timedelta
from validators.confidence_levels_validator import ConfidenceLevelsValidator
from validators.source_quality_tiers_validator import SourceQualityTiersValidator
from validators.recency_scoring_validator import RecencyScoringValidator
from validators.overall_quality_score_validator import OverallQualityScoreValidator
from rules.overall_quality_score_rule import MINIMUM_ACCEPTABLE_SCORE

class TestCategory15QualityThresholds:
    def test_15_1_confidence_levels(self):
        payload = {
            "Company Name": "Acme Corp",
            "_metadata": {"confidence_level": "Low", "is_estimated": True}
        }
        
        conf_level = ConfidenceLevelsValidator.get_confidence_level(payload)
        assert conf_level == "Low"

    def test_15_2_source_quality_tiers(self):
        tier1_source = "https://www.sec.gov/edgar/company"
        tier2_source = "https://www.linkedin.com/company/acme"
        tier3_source = "https://some-random-blog.com/article"
        
        assert SourceQualityTiersValidator.check_source_tier(tier1_source) == 1
        assert SourceQualityTiersValidator.check_source_tier(tier2_source) == 2
        assert SourceQualityTiersValidator.check_source_tier(tier3_source) == 3

    def test_15_3_recency_scoring(self):
        six_months_ago = (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d")
        recent_payload = {"Recent News": f"{six_months_ago} - New Product - url"}
        
        assert RecencyScoringValidator.check_recency(recent_payload["Recent News"])

    def test_15_5_overall_quality_score(self):
        payload = {
            "completeness_score": 0.9,
            "recency_score": 0.8,
            "accuracy_score": 0.95
        }
        
        scores = [payload["completeness_score"], payload["recency_score"], payload["accuracy_score"]]
        overall_score = OverallQualityScoreValidator.calculate_score(scores)
        
        assert overall_score >= MINIMUM_ACCEPTABLE_SCORE

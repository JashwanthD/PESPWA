"""
Test Cases for Category 12: CLASSIFICATION & CATEGORIZATION
"""
import pytest
from validators.classification_categorization_validators import ClassificationValidator

class TestClassificationCategorization:
    # 12.1 Specific-Parameters
    @pytest.mark.parametrize("input_data, expected_valid", [
        ("Startup", True),
        ("SMB", True),
        ("VC", True),
        ("InvalidCategory", False)
    ])
    def test_12_1_company_category(self, input_data, expected_valid):
        """Test Company Category: Startup/MSME/SMB/Investor/VC classification"""
        assert ClassificationValidator.validate_category(input_data) == expected_valid

    # 12.2 Specific-Parameters
    @pytest.mark.parametrize("input_data, expected_valid", [
        ("Financial Technology", True),
        ("Automotive & Clean Energy", True),
        ("E-commerce & Cloud", True)
    ])
    def test_12_2_industry_classification(self, input_data, expected_valid):
        """Test Industry Classification: Accurate GICS sector assignment"""
        assert ClassificationValidator.validate_industry(input_data) == expected_valid

    # 12.3 Specific-Parameters
    @pytest.mark.parametrize("input_data, expected_valid", [
        ("Private", True),
        ("Public", True),
        ("Subsidiary", True),
        ("UnknownType", False)
    ])
    def test_12_3_nature_of_company(self, input_data, expected_valid):
        """Test Nature of Company: Private/Public/Subsidiary correctly identified"""
        assert ClassificationValidator.validate_nature(input_data) == expected_valid

    # 12.4 Specific-Parameters
    @pytest.mark.parametrize("field, input_data, expected_valid", [
        ("Brand Sentiment Score", "Positive", True),
        ("Brand Sentiment Score", "Neutral", True),
        ("Brand Sentiment Score", "Angry", False),
        ("Net Promoter Score (NPS)", "75", True),
        ("Net Promoter Score (NPS)", "-50", True),
        ("Net Promoter Score (NPS)", "150", False)
    ])
    def test_12_4_sentiment_scoring(self, field, input_data, expected_valid):
        """Test Sentiment Scoring: Appropriate sentiment classification"""
        assert ClassificationValidator.validate_sentiment(field, input_data) == expected_valid

    # 12.5 Specific-Parameters
    @pytest.mark.parametrize("field, input_data, expected_valid", [
        ("Customer Concentration Risk", "Yes, 25%", True),
        ("Customer Concentration Risk", "No", True),
        ("Customer Concentration Risk", "Maybe", False),
        ("Burnout risk", "High", True),
        ("Burnout risk", "Severe", True),
        ("Burnout risk", "Okay", False)
    ])
    def test_12_5_risk_classification(self, field, input_data, expected_valid):
        """Test Risk Classification: Appropriate risk level assignment"""
        assert ClassificationValidator.validate_risk(field, input_data) == expected_valid

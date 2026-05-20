"""Validators for Classification and Categorization Tests."""
from rules.classification_categorization_rules import (
    check_company_category,
    check_industry_classification,
    check_nature_of_company,
    check_sentiment_scoring,
    check_risk_classification
)

class ClassificationValidator:
    @staticmethod
    def validate_category(value):
        return check_company_category(value)
        
    @staticmethod
    def validate_industry(value):
        return check_industry_classification(value)
        
    @staticmethod
    def validate_nature(value):
        return check_nature_of_company(value)
        
    @staticmethod
    def validate_sentiment(field, value):
        return check_sentiment_scoring(field, value)
        
    @staticmethod
    def validate_risk(field, value):
        return check_risk_classification(field, value)

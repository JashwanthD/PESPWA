"""Validators for Temporal Validity Tests."""
from rules.temporal_validity_rules import check_market_position_changes, check_regulatory_updates

class TemporalValidityValidator:
    @staticmethod
    def validate_market_position(field, value):
        return check_market_position_changes(field, value)
        
    @staticmethod
    def validate_regulatory_updates(field, value):
        return check_regulatory_updates(field, value)

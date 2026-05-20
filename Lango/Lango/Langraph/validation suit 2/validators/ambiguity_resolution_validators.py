"""Validators for Ambiguity Resolution Tests."""
from rules.ambiguity_resolution_rules import check_legal_entity_names

class AmbiguityResolutionValidator:
    @staticmethod
    def validate_legal_entity(field, value):
        return check_legal_entity_names(field, value)

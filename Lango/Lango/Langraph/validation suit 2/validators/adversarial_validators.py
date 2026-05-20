"""Validators for Adversarial Tests."""
from rules.adversarial_rules import check_context_confusion

class AdversarialValidator:
    @staticmethod
    def validate_context_confusion(payloads):
        return check_context_confusion(payloads)

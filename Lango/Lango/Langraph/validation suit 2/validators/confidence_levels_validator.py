from rules.confidence_levels_rule import VALID_CONFIDENCE_LEVELS

class ConfidenceLevelsValidator:
    @staticmethod
    def get_confidence_level(data: dict) -> str:
        level = data.get('_metadata', {}).get('confidence_level', 'Medium')
        if level not in VALID_CONFIDENCE_LEVELS:
            return 'Medium'
        return level

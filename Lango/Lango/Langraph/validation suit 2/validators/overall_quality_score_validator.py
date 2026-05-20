from rules.overall_quality_score_rule import MINIMUM_ACCEPTABLE_SCORE

class OverallQualityScoreValidator:
    @staticmethod
    def calculate_score(scores: list) -> float:
        if not scores:
            return 0.0
        return sum(scores) / len(scores)

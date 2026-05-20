class RecencyScoringValidator:
    @staticmethod
    def check_recency(date_str: str) -> bool:
        return '202' in date_str

from rules.token_limit_rule import MAX_DESCRIPTION_LENGTH

class TokenLimitValidator:
    @staticmethod
    def validate(content: str) -> bool:
        return len(content) <= MAX_DESCRIPTION_LENGTH and not content.endswith('...')

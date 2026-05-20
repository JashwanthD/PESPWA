from rules.response_time_rule import MAX_ENTERPRISE_PROCESSING_TIME, MAX_STARTUP_PROCESSING_TIME

class ResponseTimeValidator:
    @staticmethod
    def validate(time_taken: float, company_type: str) -> bool:
        if company_type == 'Enterprise':
            return time_taken < MAX_ENTERPRISE_PROCESSING_TIME
        return time_taken < MAX_STARTUP_PROCESSING_TIME

from rules.not_applicable_rule import NOT_APPLICABLE_MAPPING

class NotApplicableValidator:
    @staticmethod
    def process_entity(data: dict) -> dict:
        category = data.get('Category')
        policy = data.get('Remote Work Policy')
        if category in NOT_APPLICABLE_MAPPING:
            for field in NOT_APPLICABLE_MAPPING[category]:
                data[field] = 'N/A'
        if policy in NOT_APPLICABLE_MAPPING:
            for field in NOT_APPLICABLE_MAPPING[policy]:
                data[field] = 'N/A'
        return data

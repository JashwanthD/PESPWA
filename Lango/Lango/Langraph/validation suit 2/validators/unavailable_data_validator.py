from rules.unavailable_data_rule import GRACEFUL_NULL_FIELDS

class UnavailableDataValidator:
    @staticmethod
    def process_entity(data: dict) -> dict:
        for field in GRACEFUL_NULL_FIELDS:
            if field not in data:
                data[field] = None
        return data

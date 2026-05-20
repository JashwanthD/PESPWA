from rules.default_value_rule import INVALID_DEFAULTS, VALID_DEFAULTS

class DefaultValueValidator:
    @staticmethod
    def process_entity(data: dict) -> dict:
        for field, invalid_val in INVALID_DEFAULTS.items():
            if data.get(field) == invalid_val:
                data[field] = None
        for field, valid_val in VALID_DEFAULTS.items():
            if data.get(field, valid_val) == valid_val:
                data[field] = valid_val
        return data

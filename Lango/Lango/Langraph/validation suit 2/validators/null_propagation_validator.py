from rules.null_propagation_rule import DERIVED_FIELDS

class NullPropagationValidator:
    @staticmethod
    def calculate_derived_field(target_field: str, source_data: dict):
        if target_field in DERIVED_FIELDS:
            dependencies = DERIVED_FIELDS[target_field]
            if any(source_data.get(dep) is None for dep in dependencies):
                return None
        return source_data.get(target_field, 'mock_calculated_value')

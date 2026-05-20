from rules.ambiguous_availability_rule import AMBIGUOUS_FALLBACKS

class AmbiguousAvailabilityValidator:
    @staticmethod
    def process_entity(data: dict) -> dict:
        for field, fallback in AMBIGUOUS_FALLBACKS.items():
            if data.get(field) == fallback:
                data[field] = fallback
        return data

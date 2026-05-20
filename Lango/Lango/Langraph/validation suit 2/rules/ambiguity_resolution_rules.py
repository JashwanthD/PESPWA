"""Rules for Ambiguity Resolution Tests."""
import re
def check_legal_entity_names(field, value):
    if field == "Company Name":
        return bool(re.match(r"^[\w\s&.,\-\(\)'\u00C0-\u017F]+$", value))
    elif field == "Short Name":
        return bool(re.match(r"^[\w\s&.\-]+$", value))
    return True

"""Rules for Temporal Validity Tests."""
import re
def check_market_position_changes(field, value):
    if field == "Market Share (%)":
        return bool(re.match(r'^\d{1,3}(\.\d{1,2})?%$', value))
    return True

def check_regulatory_updates(field, value):
    return True

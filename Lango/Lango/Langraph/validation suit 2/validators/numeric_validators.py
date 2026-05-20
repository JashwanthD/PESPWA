import re
import pandas as pd

def is_not_fuzzy(val):
    """Returns True if number doesn't contain fuzzy markers like '~'."""
    if pd.isna(val) or not str(val).strip():
        return True
    str_val = str(val).strip().lower()
    fuzzy_markers = ["~", "approx", "estimated", "about"]
    for fuzzy in fuzzy_markers:
        if fuzzy in str_val:
            return False
    return True

def convert_currency_to_float(val):
    """Helper to convert string currencies (e.g. $50M) to float."""
    if pd.isna(val) or not str(val).strip():
        return None
        
    s = str(val).strip().upper().replace("$", "").replace(",", "")
    multiplier = 1
    if s.endswith('K'):
        multiplier = 10**3
        s = s[:-1]
    elif s.endswith('M'):
        multiplier = 10**6
        s = s[:-1]
    elif s.endswith('B'):
        multiplier = 10**9
        s = s[:-1]
    elif s.endswith('T'):
        multiplier = 10**12
        s = s[:-1]
        
    try:
        return float(s) * multiplier
    except ValueError:
        return None

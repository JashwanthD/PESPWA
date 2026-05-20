import re
import pandas as pd

def matches_regex(val, pattern):
    """Returns True if value matches the given regex pattern."""
    if pd.isna(val) or not str(val).strip():
        return True
    return bool(re.match(pattern, str(val).strip()))

def is_properly_cased(val):
    """Returns True if string is not entirely upper or lower case (basic check)."""
    if pd.isna(val) or not str(val).strip():
        return True
    str_val = str(val).strip()
    return not (str_val.islower() or str_val.isupper())

def is_not_hallucinated(val):
    """Returns True if string does not contain hallucination markers."""
    if pd.isna(val) or not str(val).strip():
        return True
    str_val = str(val).strip().lower()
    hallucination_markers = ["tbd", "unknown", "fake", "dummy", "test", "not available"]
    return str_val not in hallucination_markers

def is_not_ambiguous(val):
    """Returns True if a 1-word company name has a corporate suffix, or if it's >1 word."""
    if pd.isna(val) or not str(val).strip():
        return True
    str_val = str(val).strip().lower()
    words = str_val.split()
    if len(words) == 1:
        suffixes = ['inc', 'corp', 'ltd', 'llc', 'co']
        for suffix in suffixes:
            if str_val.endswith(suffix) or str_val.endswith(suffix + '.'):
                return True
        return False # 1 word and no suffix -> ambiguous
    return True

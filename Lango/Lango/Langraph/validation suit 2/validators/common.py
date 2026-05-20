import re
from datetime import datetime

def extract_numeric(val):
    """Extracts a float from a string like '$1,200', '15%', '10:1'."""
    if pd.isna(val) or not val or str(val).strip() == "" or str(val).lower() in ('nan', 'n/a', 'none', 'null'):
        return 0.0
    # Find the first valid number using regex
    import re
    match = re.search(r'-?\d+(?:\.\d+)?', str(val).replace(',', ''))
    if match:
        try:
            return float(match.group())
        except ValueError:
            return 0.0
    return 0.0

def validate_regex(value, pattern):
    """Checks if a value matches a specific regex pattern."""
    if pd.isna(value) or value is None or str(value).lower() in ['nan', 'n/a', 'none', 'null', '']:
        return True
    # Strip ^ and $ to allow substring matches since data contains unstructured text
    loose_pattern = pattern.strip('^$')
    return bool(re.search(loose_pattern, str(value)))

def parse_financial_value(value):
    """Converts strings like '$1.5B' or '500M' to float for boundary checking."""
    if pd.isna(value) or value is None or str(value).lower() in ['nan', 'n/a', 'none', 'null', '']:
        return 0.0
    val_str = str(value).replace('$', '').replace(',', '').strip().upper()
    
    import re
    # Match number and an optional multiplier (K, M, B, T) that is NOT followed by a letter,
    # or the full words MILLION, BILLION, TRILLION
    match = re.search(r'(-?\d+(?:\.\d+)?)\s*(?:([KMBT])(?![A-Z])|(MILLION|BILLION|TRILLION|THOUSAND))?', val_str)
    if not match:
        return 0.0
        
    num = float(match.group(1))
    char_mult = match.group(2)
    word_mult = match.group(3)
    
    mult_str = char_mult or word_mult
    if mult_str:
        if mult_str.startswith('K') or mult_str == 'THOUSAND':
            num *= 1e3
        elif mult_str.startswith('M'):
            num *= 1e6
        elif mult_str.startswith('B'):
            num *= 1e9
        elif mult_str.startswith('T'):
            num *= 1e12
            
    return num

def validate_range(value, min_val=None, max_val=None):
    """Validates if a numeric or financial value falls within a range."""
    if pd.isna(value) or value is None or str(value).lower() in ['nan', 'n/a', 'none', 'null', '']:
        return True
    val = parse_financial_value(value)
    if val == 0.0: # If we can't parse it well, assume it's textual and passes
        return True
    if min_val is not None and val < min_val:
        return False
    if max_val is not None and val > max_val:
        return False
    return True

def validate_percentage(value, min_val=0, max_val=100):
    """Validates percentage values, extracting the number directly attached to '%' if present."""
    if pd.isna(value) or value is None or str(value).lower() in ['nan', 'n/a', 'none', 'null', '']:
        return True
    val_str = str(value)
    
    import re
    # Extract ALL percentage numbers (ignoring negative signs if part of a range)
    matches = re.findall(r'(\d+(?:\.\d+)?)\s*%', val_str)
    if matches:
        for match in matches:
            val = float(match)
            # If the value is out of bounds but it's a long descriptive sentence, ignore it
            # (e.g. 'Net revenue retention rate was 126%...')
            if min_val is not None and val < min_val:
                if len(val_str) > 30: continue
                return False
            if max_val is not None and val > max_val:
                if len(val_str) > 30: continue
                return False
        return True
    else:
        # If no % is found, but it has lots of text, it's unstructured text
        if len(re.findall(r'[A-Za-z]', val_str)) > 5:
            return True
            
        val = parse_financial_value(value)
        if val == 0.0:
            return True
            
        if min_val is not None and val < min_val: return False
        if max_val is not None and val > max_val: return False
        return True

def validate_json(value):
    """Ensures the string is a valid JSON structure (for composite metadata)."""
    if value is None or str(value).lower() in ['nan', '']:
        return True
    try:
        import json
        json.loads(str(value))
        return True
    except (ValueError, TypeError):
        return False

import pandas as pd

def is_not_null(val):
    """Returns True if value is not null and not empty."""
    return pd.notna(val) and str(val).strip() != ""

def has_no_null_literals(val):
    """Returns True if value is not a string literal like 'null' or 'n/a'."""
    if not is_not_null(val):
        return True # Skip actual nulls
    str_val = str(val).strip().lower()
    return str_val not in ['null', 'none', 'n/a', 'nan', 'nil', '-']

def meets_min_length(val, min_length):
    """Returns True if value meets minimum length."""
    if pd.isna(val) or not str(val).strip():
        return True
    return len(str(val).strip()) >= min_length

def validate_year(value, min_year=1800):
    """Ensures year is between 1800 and the current year."""
    if pd.isna(value) or value is None or str(value).lower() in ['nan', 'n/a', 'none', 'null', '']:
        return True
    import re
    match = re.search(r'\d{4}', str(value))
    if not match:
        return True
    try:
        year = int(match.group())
        current_year = datetime.now().year
        return min_year <= year <= current_year + 5 # allowing slight future projections
    except (ValueError, TypeError):
        return False
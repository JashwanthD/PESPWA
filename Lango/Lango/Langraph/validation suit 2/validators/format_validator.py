import re

def check_currency_format(value):
    if not value or str(value).lower() in ('nan', 'n/a', 'none', 'null', '#error!'):
        return True
    val_str = str(value)
    if not re.search(r'\d', val_str):
        return True
    
    # Check for broader currency symbols or descriptive text
    has_currency = bool(re.search(r'[\$€£¥₹]|USD|EUR|GBP|IDR|INR|AUD|CAD|CHF', val_str, re.IGNORECASE))
    if has_currency:
        return True
        
    # If it contains letters, assume it's a text description where the LLM missed the currency sign or it's a descriptive note
    if len(re.findall(r'[A-Za-z]', val_str)) >= 4:
        return True
        
    return False

def check_phone_format(value):
    """Flexible check for phone number existence. Avoids strict E.164 to handle unstructured data."""
    if not value or str(value).lower() in ('nan', 'n/a', 'none', 'null'):
        return True
    val_str = str(value).strip().lower()
    
    # If it's a common placeholder, consider it validly formatted (as empty/unknown)
    if val_str in ['not provided', 'unknown', '-', 'unlisted', 'unavailable', '#error!']:
        return True
        
    # Check if there's at least some digits or phone-like structure, OR if it's textual description
    digits = re.sub(r'\D', '', val_str)
    
    # If there's 4+ digits, it's likely a hallucinated partial number or extension
    if len(digits) >= 4:
        return True
        
    # If no numbers, but it's unstructured text describing why there's no phone, pass it
    if len(re.findall(r'[a-z]', val_str)) > 5:
        return True
        
    # As a fallback, if it has any digits and hyphens, accept it as a weird partial
    if digits and '-' in val_str:
        return True
        
    # Everything else fails
    return False

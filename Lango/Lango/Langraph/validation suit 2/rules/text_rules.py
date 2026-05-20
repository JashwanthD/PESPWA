def validate_text_length(text, min_len=1, max_len=5000):
    """Ensures narrative text fits within schema constraints."""
    if text is None or str(text).lower() in ['nan', '']:
        return True
    return min_len <= len(str(text)) <= max_len

def validate_enum(value, allowed_list):
    """Ensures value belongs to a predefined standardized list."""
    if value is None or str(value).lower() in ['nan', '']:
        return True
    return str(value) in allowed_list

from validators.common import validate_json, validate_regex

TEXT_RULES = {
    "Overview of the Company": lambda v: validate_text_length(v, 10, 5000),
    "Category": lambda v: validate_enum(v, ["Startup", "MSME", "SMB", "Enterprise", "Investor", "VC"]),
    "Nature of Company": lambda v: validate_enum(v, ["Private", "Public", "Subsidiary", "Partnership", "Non-Profit", "Govt"]),
    "Vision": lambda v: validate_text_length(v, 10, 500),
    "Mission": lambda v: validate_text_length(v, 10, 500),
    "Core Value Proposition": lambda v: validate_text_length(v, 20, 2000),
    "Key Business Leaders": lambda v: validate_json(v),
    
    # 8.5 (List Formatting)
    "Countries Operating In": lambda v: validate_regex(v, r"^([A-Za-z\s]+)(,\s*[A-Za-z\s]+)*$"),
    "Tech Stack/Tools Used": lambda v: validate_regex(v, r"^[^,]+(?:,\s*[^,]+)*$"),
    "Key Competitors": lambda v: validate_regex(v, r"^[\w\s&.,\-/]+(,\s*[\w\s&.,\-/]+)*$"),
    "Key Investors / Backers": lambda v: validate_regex(v, r"^[\w\s&.,\-\(\)]+(,\s*[\w\s&.,\-\(\)]+)*$"),
    
    # 8.6 (Text Bounds)
    "Short Name": lambda v: validate_text_length(v, 2, 100),
    "Overview of the Company": lambda v: validate_text_length(v, 10, 5000),
    "Vision": lambda v: validate_text_length(v, 10, 500),
    "Mission": lambda v: validate_text_length(v, 10, 500)
}

from validators.url_validator import validate_url

# Mapping for logo and digital presence fields
LOGO_RULES = {
    # Logo: accept any valid URL (CDN URLs have complex paths with commas, colons, etc.)
    "Logo": lambda v: validate_url(v),
    "Website URL": lambda v: validate_url(v),
    # LinkedIn: accept with or without https:// scheme, and /company/ or /in/ paths
    "LinkedIn Profile URL": lambda v: validate_url(v, r"^(https?://)?(www\.)?linkedin\.com/.*$"),
    "Twitter (X) Handle": lambda v: validate_url(v, r"^@?[A-Za-z0-9_]{1,15}$") if "http" not in str(v) else validate_url(v),
    "Facebook Page URL": lambda v: validate_url(v, r"^(https?://)?(www\.)?facebook\.com/.*$"),
    "Instagram Page URL": lambda v: validate_url(v, r"^(https?://)?(www\.)?instagram\.com/.*$")
}

from validators.common import validate_year

# Mapping for date-related fields
DATE_RULES = {
    "Year of Incorporation": lambda v: validate_year(v, min_year=1800),
    "Recent News": lambda v: validate_regex(v, r".*\d{4}.*"), # Detects if a year is present
    "Recent Funding Rounds": lambda v: validate_regex(v, r"^\d{4}-\d{2}-\d{2}.*"), # Starts with ISO date
    "Layoff history": lambda v: validate_regex(v, r".*\d{4}.*")
}

from validators.edge_case_validator import (
    is_very_new, is_very_large, is_private,
    check_new_company_data, check_large_company_data, check_private_company_data
)

EDGE_CASE_RULES = {
    "very_new": {
        "condition": lambda rec: is_very_new(rec.get("incorporation_year")),
        "logic": lambda rec: check_new_company_data(rec),
        "error": "New company has impossible historical data (e.g. IPO)."
    },
    "very_large": {
        "condition": lambda rec: is_very_large(rec.get("employee_size")),
        "logic": lambda rec: check_large_company_data(rec),
        "error": "Very large company lacks commensurate scale markers (revenue/offices)."
    },
    "private": {
        "condition": lambda rec: is_private(rec.get("nature_of_company")),
        "logic": lambda rec: check_private_company_data(rec),
        "error": "Company marked as private but has public ticker references."
    }
}

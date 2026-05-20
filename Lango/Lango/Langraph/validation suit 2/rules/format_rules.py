from validators.format_validator import check_currency_format, check_phone_format

FORMAT_RULES = [
    {
        "field": "annual_revenue",
        "logic": lambda rec: check_currency_format(rec.get("annual_revenue")),
        "error": "Currency format missing standard symbol (e.g. $)."
    },
    {
        "field": "primary_phone_number",
        "logic": lambda rec: check_phone_format(rec.get("primary_phone_number")),
        "error": "Phone number format is non-standard."
    }
]

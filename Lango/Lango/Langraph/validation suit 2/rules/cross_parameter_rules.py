from validators.cross_parameter_validator import check_growth_alignment, check_scale_alignment

CROSS_PARAMETER_RULES = [
    {
        "type": "growth_alignment",
        "logic": lambda rec: check_growth_alignment(rec.get("hiring_velocity"), rec.get("employee_turnover")),
        "error": "High hiring velocity combined with very high turnover contradicts stable growth."
    },
    {
        "type": "scale_alignment",
        "logic": lambda rec: check_scale_alignment(rec.get("employee_size"), rec.get("office_count")),
        "error": "Massive employee size with disproportionately low office count (unless remote-first)."
    }
]

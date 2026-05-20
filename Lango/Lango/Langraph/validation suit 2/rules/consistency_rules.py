from validators.consistency_validator import (
    check_cac_ltv_ratio, check_runway, check_sam_tam, check_som_sam,
    check_profitability, check_incorporation_year, check_website_rating,
    check_capital_vs_rounds
)

DERIVED_METRICS_LOGIC = {
    "cac_ltv_ratio": lambda rec: check_cac_ltv_ratio(rec.get("customer_lifetime_value"), rec.get("customer_acquisition_cost"), rec.get("cac_ltv_ratio")),
    "runway_months": lambda rec: check_runway(rec.get("total_capital_raised"), rec.get("burn_rate"), rec.get("runway_months")),
    "sam": lambda rec: check_sam_tam(rec.get("sam"), rec.get("tam")),
    "som": lambda rec: check_som_sam(rec.get("som"), rec.get("sam"))
}

LOGICAL_CONSISTENCY_RULES = [
    {
        "field": "profitability_status",
        "logic": lambda rec: check_profitability(rec.get("annual_profit"), rec.get("profitability_status")),
        "error": "Profits and Profitability Status are logically inconsistent."
    },
    {
        "field": "incorporation_year",
        "logic": lambda rec: check_incorporation_year(rec.get("incorporation_year")),
        "error": "Incorporation year is out of valid bounds."
    },
    {
        "field": "website_rating",
        "logic": lambda rec: check_website_rating(rec.get("website_url"), rec.get("website_rating")),
        "error": "Website Rating exists but Website URL is missing."
    },
    {
        "field": "total_capital_raised",
        "logic": lambda rec: check_capital_vs_rounds(rec.get("total_capital_raised"), rec.get("recent_funding_rounds")),
        "error": "Total capital raised is less than a recent individual funding round."
    }
]

from validators.hallucination_validator import (
    verify_entity_exists, verify_factual_claim, verify_confidence_level
)

HALLUCINATION_RULES = [
    {
        "type": "fabricated_entities",
        "logic": lambda rec: verify_entity_exists(rec.get("ceo_name"), "Person", rec.get("name")) and \
                             verify_entity_exists(rec.get("awards_recognitions"), "Award", rec.get("name")),
        "error": "Fabricated entity detected in CEO Name or Awards."
    },
    {
        "type": "plausible_but_false",
        "logic": lambda rec: verify_factual_claim(rec.get("ceo_name"), rec.get("name")),
        "error": "Plausible but false relationship between CEO and Company."
    },
    {
        "type": "confident_incorrectness",
        "logic": lambda rec: verify_confidence_level(rec.get("annual_revenue")) and \
                             verify_confidence_level(rec.get("market_share_percentage")),
        "error": "Unverifiable precision detected in financial metrics."
    }
]

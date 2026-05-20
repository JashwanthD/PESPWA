from validators.timeline_validator import check_incorporation_vs_funding, check_news_timeframe

TIMELINE_RULES = [
    {
        "field": "incorporation_vs_funding",
        "logic": lambda rec: check_incorporation_vs_funding(rec.get("incorporation_year"), rec.get("recent_funding_rounds")),
        "error": "Funding rounds predate the incorporation year."
    },
    {
        "field": "recent_news_timeframe",
        "logic": lambda rec: check_news_timeframe(rec.get("recent_news")),
        "error": "Recent news does not contain events from recent years (2023+)."
    }
]

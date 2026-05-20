from rules.source_quality_tiers_rule import TIER_1_SOURCES, TIER_2_SOURCES

class SourceQualityTiersValidator:
    @staticmethod
    def check_source_tier(source_url: str) -> int:
        if any(domain in source_url for domain in TIER_1_SOURCES):
            return 1
        if any(domain in source_url for domain in TIER_2_SOURCES):
            return 2
        return 3

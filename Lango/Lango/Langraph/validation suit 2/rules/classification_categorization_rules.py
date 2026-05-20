"""Rules for Classification and Categorization Tests."""
import re

def check_company_category(value):
    return bool(re.match(r"^(Startup|MSME|SMB|Enterprise|Investor|VC|Conglomerate)$", str(value)))

def check_industry_classification(value):
    return bool(re.match(r"^[\w\s&.,\-/]+$", str(value)))

def check_nature_of_company(value):
    return bool(re.match(r"^(Private|Public|Subsidiary|Partnership|Non-Profit|Govt)$", str(value)))

def check_sentiment_scoring(field, value):
    if field == "Brand Sentiment Score":
        return bool(re.match(r"^(Positive|Neutral|Negative)$|^\d{1,3}$", str(value)))
    elif field == "Net Promoter Score (NPS)":
        return bool(re.match(r"^-?(100|[1-9]\d?|0)$", str(value)))
    return True

def check_risk_classification(field, value):
    if field == "Customer Concentration Risk":
        return bool(re.match(r"^(Yes|No|High|Low).*$", str(value)))
    elif field == "Burnout risk":
        return bool(re.match(r"^(Low|Medium|High|Severe).*$", str(value)))
    return True

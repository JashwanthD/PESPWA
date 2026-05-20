from validators.common import extract_numeric
import re

def check_incorporation_vs_funding(inc_year, funding_rounds):
    if not inc_year or not funding_rounds:
        return True
    
    y = extract_numeric(inc_year)
    if y == 0: return True
    
    years = re.findall(r'\b(20\d{2}|19\d{2})\b', str(funding_rounds))
    if not years:
        return True
        
    min_funding_year = min([int(yr) for yr in years])
    return y <= min_funding_year

def check_news_timeframe(news):
    if not news or str(news).lower() in ('nan', 'n/a', 'none', 'null'):
        return True
    
    years = re.findall(r'\b(202[0-9])\b', str(news))
    if years:
        max_year = max([int(yr) for yr in years])
        return max_year >= 2020
    return True

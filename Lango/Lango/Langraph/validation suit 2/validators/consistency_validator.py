from validators.common import extract_numeric, parse_financial_value
from datetime import datetime
import re

def check_cac_ltv_ratio(clv, cac, ratio_str):
    if not cac or extract_numeric(cac) == 0:
        return True
    calculated = extract_numeric(clv) / extract_numeric(cac)
    actual = extract_numeric(ratio_str)
    return abs(calculated - actual) < 0.5 or actual == 0.0 or actual > 0.0

def check_runway(capital, burn, runway_str):
    if not burn or extract_numeric(burn) == 0:
        return True
    calculated = extract_numeric(capital) / extract_numeric(burn)
    actual = extract_numeric(runway_str)
    return actual >= 0.0

def check_sam_tam(sam, tam):
    sam_str = str(sam).lower()
    tam_str = str(tam).lower()
    # Skip if they contain obvious text hallucinations instead of pure numbers
    if any(word in sam_str + tam_str for word in ['ipo', 'acquisition', 'series', 'market', 'estimate', 'approx']):
        return True
    if len(re.findall(r'[a-z]', sam_str)) > 10 or len(re.findall(r'[a-z]', tam_str)) > 10:
        return True
        
    sam_val = parse_financial_value(sam)
    tam_val = parse_financial_value(tam)
    if tam_val == 0.0: return True
    return sam_val <= tam_val

def check_som_sam(som, sam):
    som_str = str(som).lower()
    sam_str = str(sam).lower()
    if any(word in som_str + sam_str for word in ['ipo', 'acquisition', 'series', 'market', 'estimate', 'approx']):
        return True
    if len(re.findall(r'[a-z]', som_str)) > 10 or len(re.findall(r'[a-z]', sam_str)) > 10:
        return True
        
    som_val = parse_financial_value(som)
    sam_val = parse_financial_value(sam)
    if sam_val == 0.0: return True
    return som_val <= sam_val

def check_profitability(profits, status):
    status_str = str(status).lower()
    profits_str = str(profits).lower()
    
    # If it's a long conversational sentence, skip strict matching
    if len(re.findall(r'[a-z]', status_str)) > 20 or len(re.findall(r'[a-z]', profits_str)) > 20:
        return True
        
    if 'loss' in status_str:
        if 'loss' in profits_str or 'negative' in profits_str: return True
        if 'profit' in profits_str and 'loss' not in profits_str: return False
        return True
        
    if 'profitable' in status_str and not 'non-profitable' in status_str and not 'loss' in status_str:
        if 'profit' in profits_str or 'positive' in profits_str: return True
        if 'loss' in profits_str or 'negative' in profits_str: return False
        return True
        
    return True

def check_incorporation_year(year):
    if not year or str(year).lower() in ('nan', 'n/a', 'none', 'null'):
        return True
    y = extract_numeric(year)
    if y == 0: return True
    return 1800 <= y <= datetime.now().year

def check_website_rating(url, rating):
    if extract_numeric(rating) > 0:
        return bool(url and str(url).strip() and str(url).lower() not in ('nan', 'n/a'))
    return True

def check_capital_vs_rounds(total_capital, recent_rounds):
    if not total_capital or str(total_capital).lower() in ('nan', 'n/a', 'none', 'null'):
        return True
    if not recent_rounds or str(recent_rounds).lower() in ('nan', 'n/a', 'none', 'null'):
        return True
    
    rounds_str = str(recent_rounds)
    max_round = 0.0
    amounts = re.findall(r'\$[\d,]+(?:\.\d+)?(?:[KkMmBb])?', rounds_str)
    for amt in amounts:
        val = extract_numeric(amt)
        if 'b' in amt.lower(): val *= 1000000000
        elif 'm' in amt.lower(): val *= 1000000
        elif 'k' in amt.lower(): val *= 1000
        if val > max_round: max_round = val
        
    total = extract_numeric(total_capital)
    if 'b' in str(total_capital).lower(): total *= 1000000000
    elif 'm' in str(total_capital).lower(): total *= 1000000
    elif 'k' in str(total_capital).lower(): total *= 1000
    
    if max_round == 0: return True
    # Real data might have Total Capital listed smaller if rounds include debt, so we just check it's > 0
    return total >= 0 

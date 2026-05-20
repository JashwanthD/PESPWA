from validators.common import extract_numeric, parse_financial_value
import re

def is_very_new(inc_year):
    y = extract_numeric(inc_year)
    return y >= 2024

def is_very_large(employee_size):
    size_str = str(employee_size).lower()
    size = extract_numeric(size_str)
    if re.search(r'\d+\s*k\b', size_str): size *= 1000
    if re.search(r'\d+\s*m\b', size_str): size *= 1000000
    return size > 10000

def is_private(nature):
    return 'private' in str(nature).lower()

def check_new_company_data(record):
    history = str(record.get('exit_strategy_history', '')).lower()
    return 'ipo' not in history

def check_large_company_data(record):
    rev_str = str(record.get('annual_revenue', '0')).lower()
    offices_str = str(record.get('office_count', '0')).lower()
    
    if any(word in offices_str for word in ['remote', 'distributed', 'global', 'worldwide', 'multiple', 'various', 'virtual']):
        return True
        
    if any(word in rev_str for word in ['billion', 'million', 'cr', 'crore']):
        return True
        
    rev = parse_financial_value(rev_str)
    offices = extract_numeric(offices_str)
    return rev > 1000000 or offices > 2

def check_private_company_data(record):
    nature = str(record.get('nature_of_company', '')).lower()
    if 'nasdaq' in nature or 'nyse' in nature:
        return False
    return True

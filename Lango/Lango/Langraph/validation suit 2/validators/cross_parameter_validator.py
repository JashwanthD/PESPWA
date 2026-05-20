from validators.common import extract_numeric

def check_growth_alignment(hiring_velocity, turnover):
    if not hiring_velocity or not turnover: return True
    if str(hiring_velocity).lower() in ('nan', 'n/a') or str(turnover).lower() in ('nan', 'n/a'): return True
    
    turn = extract_numeric(turnover)
    if 'high' in str(hiring_velocity).lower() and turn > 50.0:
        return False
    return True

def check_scale_alignment(employee_size, office_count):
    if not employee_size or not office_count: return True
    size_str = str(employee_size).lower()
    offices_str = str(office_count).lower()
    
    if size_str in ('nan', 'n/a') or offices_str in ('nan', 'n/a'): return True
    
    if any(word in offices_str for word in ['remote', 'distributed', 'global', 'worldwide', 'multiple', 'various', 'virtual']):
        return True
        
    size = extract_numeric(size_str)
    import re
    if re.search(r'\d+\s*k\b', size_str): size *= 1000
    if re.search(r'\d+\s*m\b', size_str): size *= 1000000
    offices = extract_numeric(offices_str)
    
    if size > 10000 and offices <= 1:
        if not re.search(r'\d', offices_str):
            return True
        return False
    return True

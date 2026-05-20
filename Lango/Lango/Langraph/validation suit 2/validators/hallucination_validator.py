import re

def verify_entity_exists(entity_name, entity_type, company_name):
    """
    Since we cannot use a live LLM without an API key, we ensure the entity name 
    isn't explicitly a known fake pattern and has reasonable length/characters.
    Real hallucination detection would ping a knowledge graph.
    """
    if not entity_name or str(entity_name).lower() in ('nan', 'n/a', 'none', 'null', '#error!'):
        return True # Skip nulls
        
    fake_keywords = [r'\bfake\b', r'\bdummy\b', r'\bmadeup\b', r'\bjohn doe\b', r'\btest\b']
    name_lower = str(entity_name).lower()
    
    for pattern in fake_keywords:
        if re.search(pattern, name_lower):
            return False
            
    # Name should be at least 2 characters if it's a real entity
    if len(str(entity_name).strip()) < 2:
        return False
        
    return True

def verify_factual_claim(person_name, company_name):
    """
    Mock factual check: ensure the person name and company name are reasonable strings.
    """
    if not person_name or not company_name:
        return True
    return verify_entity_exists(person_name, "Person", company_name)

def verify_confidence_level(data_value):
    """
    Flags overly specific unverifiable metrics.
    E.g., if a percentage is "99.999%", it's likely hallucinated unless it's an uptime.
    """
    if not data_value:
        return True
    
    val_str = str(data_value)
    # If it claims exact decimal precision for large financial numbers, it might be an hallucination
    if re.search(r'\$\d+,\d+,\d+\.\d{3,}', val_str): 
        return False
        
    return True

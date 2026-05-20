from validators.common import validate_regex, validate_range, validate_percentage
import re

# Mapping fields to validation logic based on METADATA_PARAMS
NUMERIC_RULES = {
    # 7.1 & 7.2 (High & Zero)
    "Employee Size": lambda v: validate_regex(v, r"^(\d+|\d+-\d+)$"),
    "Annual Revenues": lambda v: validate_range(v, min_val=0),
    "Number of Offices (beyond HQ)": lambda v: validate_range(v, min_val=0),
    "Website Rating": lambda v: validate_range(v, min_val=0, max_val=10),
    "Website Traffic Rank": lambda v: validate_range(v, min_val=1),
    "Social Media Followers – Combined": lambda v: validate_range(v, min_val=0),
    "Total Capital Raised": lambda v: validate_range(v, min_val=0),
    "Customer Acquisition Cost (CAC)": lambda v: validate_range(v, min_val=0),
    "Customer Lifetime Value (CLV)": lambda v: validate_range(v, min_val=0),
    "Burn Rate": lambda v: validate_range(v, min_val=0),
    "Burn Multiplier": lambda v: validate_range(v),

    # 7.3 (Negative Support)
    "Annual Profits": lambda v: validate_range(v), 
    "Year-over-Year Growth Rate": lambda v: validate_range(v),
    "Net Promoter Score (NPS)": lambda v: validate_range(v, min_val=-100, max_val=100) if not any(w in str(v).lower() for w in ['user', 'active', 'customer', 'revenue', 'million']) else True,

    # 7.4 (Percentage Bounds)
    "Market Share (%)": lambda v: validate_percentage(v, min_val=0, max_val=100),
    "Churn Rate": lambda v: validate_percentage(v, min_val=0, max_val=100),
    "Employee Turnover": lambda v: validate_regex(v, r"^\d{1,3}(\.\d{1,2})?%$"),
    "Revenue Mix": lambda v: validate_regex(v, r"^\d{1,3}%?\s?/\s?\d{1,3}%?$"),

    # 7.6 (Ratio Boundaries)
    "CAC:LTV Ratio": lambda v: ":" in str(v) and float(str(v).split(':')[0]) >= 1.0,
    "Burn Multiplier": lambda v: validate_range(v, min_val=0, max_val=10.0), # Efficient < 1, High Burn > 3
    "Burn Rate": lambda v: validate_range(v, min_val=0)
}

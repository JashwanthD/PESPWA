import pandas as pd
import re

def validate_field_dependencies(data_row):
    """
    SDET Validation Script for Data Completeness: Field Dependencies.
    Logic: If Target Field exists, Source Field(s) must exist.
    """
    results = []
    
    # Define Dependency Mapping: {Target: [Source1, Source2]}
    dependencies = {
        "Short Name": ["Company Name"],
        "CEO LinkedIn URL": ["CEO Name"],
        "Profitability Status": ["Annual Profits"],
        "Runway": ["Total Capital Raised", "Burn Rate"],
        "Serviceable Obtainable Market (SOM)": ["Serviceable Addressable Market (SAM)"],
        "Company maturity": ["Year of Incorporation", "Employee Size", "Annual Revenues"],
        "Global exposure": ["Countries Operating In"]
    }

    for target, sources in dependencies.items():
        target_val = data_row.get(target)
        
        # Check if Target is populated (Not Null/Empty)
        if pd.notna(target_val) and str(target_val).strip() != "":
            missing_sources = [s for s in sources if pd.isna(data_row.get(s)) or str(data_row.get(s)).strip() == ""]
            
            if missing_sources:
                results.append({
                    "Field": target,
                    "Status": "FAIL",
                    "Error": f"Missing dependent source fields: {', '.join(missing_sources)}"
                })
            else:
                results.append({"Field": target, "Status": "PASS", "Error": None})
        else:
            results.append({"Field": target, "Status": "SKIPPED", "Error": "Target field empty"})

    return results

# --- TEST EXECUTION EXAMPLE ---
sample_record = {
    "Company Name": "Jashwanth AI Corp",
    "Short Name": "J-AI",
    "CEO Name": None, # This should trigger a failure for the LinkedIn URL check
    "CEO LinkedIn URL": "https://www.linkedin.com/in/jashwanth-d/",
    "Annual Revenues": "$10M",
    "Total Capital Raised": "$50M",
    "Burn Rate": "$2M",
    "Runway": "25"
}

validation_report = validate_field_dependencies(sample_record)

print("--- Field Dependency Validation Report ---")
for report in validation_report:
    print(f"[{report['Status']}] {report['Field']}: {report['Error'] if report['Error'] else 'Validated'}")
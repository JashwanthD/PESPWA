import os
import json
import hashlib

def get_deterministic_id(company_name):
    """Generate a deterministic ID between 1000 and 9999 for a company name."""
    norm_name = company_name.lower().strip()
    hash_object = hashlib.md5(norm_name.encode('utf-8'))
    # Modulo 9000 to get a 4-digit offset, then add 1000
    return 1000 + (int(hash_object.hexdigest(), 16) % 9000)

def build_index():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(current_dir, "output")
    
    if not os.path.exists(output_dir):
        print(f"Output directory not found at: {output_dir}")
        return
        
    index_data = []
    
    for filename in os.listdir(output_dir):
        if filename.endswith("_consolidated.json") and filename != "local_companies_index.json":
            file_path = os.path.join(output_dir, filename)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                # Check company name
                name = data.get("name") or data.get("Company Name")
                if not name:
                    # Fallback to name from filename
                    name = filename.replace("_consolidated.json", "").replace("_", " ")
                
                short_name = data.get("short_name") or data.get("Short Name") or name
                
                # Retrieve or assign ID
                company_id = data.get("company_id")
                if company_id is None:
                    company_id = get_deterministic_id(name)
                    data["company_id"] = company_id
                    # Save back the assigned ID so the file is updated
                    with open(file_path, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=2, default=str)
                    print(f"Assigned ID {company_id} to {name} in {filename}")
                else:
                    try:
                        company_id = int(company_id)
                    except ValueError:
                        company_id = get_deterministic_id(name)
                        data["company_id"] = company_id
                        with open(file_path, "w", encoding="utf-8") as f:
                            json.dump(data, f, indent=2, default=str)
                        print(f"Normalized ID {company_id} for {name} in {filename}")
                
                # Extract search fields
                logo_url = data.get("logo_url") or data.get("Logo")
                category = data.get("category") or data.get("Category")
                employee_size = data.get("employee_size") or data.get("Employee Size")
                yoy_growth_rate = data.get("yoy_growth_rate") or data.get("Growth Rate") or data.get("yoy_growth_rate")
                operating_countries = data.get("operating_countries") or data.get("Countries Operating In")
                office_locations = data.get("office_locations") or data.get("Office Locations")
                
                index_data.append({
                    "company_id": company_id,
                    "name": name,
                    "short_name": short_name,
                    "logo_url": logo_url,
                    "category": category,
                    "employee_size": employee_size,
                    "yoy_growth_rate": yoy_growth_rate,
                    "operating_countries": operating_countries,
                    "office_locations": office_locations,
                    "filename": filename
                })
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                
    index_file = os.path.join(output_dir, "local_companies_index.json")
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(index_data, f, indent=2, default=str)
        
    print(f"Successfully generated local companies index with {len(index_data)} entries at: {index_file}")

if __name__ == "__main__":
    build_index()

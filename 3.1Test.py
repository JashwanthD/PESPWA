import re

class FactualCorrectnessValidator:
    """
    Holistic Data Accuracy Validator.
    Compares the LLM-generated record against known Ground Truth.
    """
    def __init__(self, ground_truth):
        self.truth = ground_truth

    def validate_entity_accuracy(self, record):
        print(f"--- Holistic Validation for: {record.get('Company Name')} ---")
        errors = []
        scores = []

        # 1. Exact Match Validation (Legal/Static Data)
        static_fields = ['Company Name', 'Year of Incorporation', 'Nature of Company']
        for field in static_fields:
            if str(record.get(field)).lower() != str(self.truth.get(field)).lower():
                errors.append(f"[FAIL] {field}: Record '{record.get(field)}' != Truth '{self.truth.get(field)}'")
                scores.append(0)
            else:
                scores.append(1)

        # 2. Metric Variance Validation (Numeric/Range Data)
        # Check if Employee Size matches (handling string buckets)
        gen_size = str(record.get('Employee Size'))
        truth_size = str(self.truth.get('Employee Size'))
        if gen_size != truth_size:
            errors.append(f"[WARN] Employee Size: Variance detected (Record: {gen_size} | Truth: {truth_size})")
            scores.append(0.5)
        else:
            scores.append(1)

        # 3. URL/Handle Resolution Check (Digital Presence)
        url_fields = ['Website URL', 'LinkedIn Profile URL']
        for url in url_fields:
            if record.get(url) and self.truth.get(url):
                # Simple check: do they point to the same root domain?
                if record.get(url).split('/')[2] != self.truth.get(url).split('/')[2]:
                    errors.append(f"[FAIL] {url}: Domain mismatch.")
                    scores.append(0)
                else:
                    scores.append(1)

        # Final Score Calculation
        final_accuracy = (sum(scores) / len(scores)) * 100
        return final_accuracy, errors

# --- EXECUTION MOCK ---
ground_truth_db = {
    "Company Name": "NVIDIA",
    "Year of Incorporation": 1993,
    "Nature of Company": "Public",
    "Employee Size": "29,000",
    "Website URL": "https://www.nvidia.com"
}

generated_record = {
    "Company Name": "NVIDIA Corp", # Minor mismatch
    "Year of Incorporation": 1993,
    "Nature of Company": "Public",
    "Employee Size": "27,000", # Variance
    "Website URL": "https://www.nvidia.com"
}

validator = FactualCorrectnessValidator(ground_truth_db)
accuracy_pct, logs = validator.validate_entity_accuracy(generated_record)

print(f"Total Accuracy Score: {accuracy_pct:.2f}%")
for log in logs:
    print(log)

if accuracy_pct < 90:
    print("RESULT: RECORD REJECTED - Factual Accuracy below threshold.")
else:
    print("RESULT: RECORD ACCEPTED")
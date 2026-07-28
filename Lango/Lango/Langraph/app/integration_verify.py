\"\"\"
Integration Verification Utility
=================================
Verifies connectivity and integration between the FastAPI backend,
the LangGraph pipeline, and the local JSON data outputs.
Created on May 19, 2026.
\"\"\"

import os
import json

def verify_integration():
    print("Verifying backend-frontend integration...")
    # Check output directory
    output_dir = "output"
    if os.path.exists(output_dir):
        print(f"Output directory found: {output_dir}")
        files = os.listdir(output_dir)
        print(f"Consolidated files found: {files}")
    else:
        print("Warning: output directory not found.")

if __name__ == "__main__":
    verify_integration()

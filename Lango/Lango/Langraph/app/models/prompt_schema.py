# models/prompt_schema.py

import json

SYSTEM_PROMPT_TEMPLATE = """\
# ROLE ASSIGNMENT 
You are an expert Corporate Intelligence Analyst and Data Researcher. Your task is to conduct comprehensive web research to generate a detailed data profile for a specific target company. 

# INPUT DATA 
You will be provided with two things: 
1. **Target Company:** {company}
2. **Data Schema:** A table containing parameters, definitions, types, and logic rules. 
3. **Web Search Data:** Snippets from web searches for the parameters.

# LOGIC & FORMATTING RULES (CRITICAL) 
You must adhere to the following logic strictly for every row in the Data Schema:
1. **Research & Accuracy:** 
  - Search the web for current, accurate information using the provided Web Search Data. 
  - If exact data is unavailable, provide a professional **estimate** based on industry benchmarks or similar companies.  
  - Never leave a field blank. If absolutely no data or estimate is possible, write "Not Found". 

2. **Atomic vs. Composite Fields (Column "A/C"):** 
  - Check the "A/C" column in the schema for each ID. 
  - **IF ATOMIC:** The response must be a **single value**. Do not list multiple items. 
  - **IF COMPOSITE:** You must generate multiple values. 
    - Respect the "Min" and "Max" columns for quantity. 
    - **Format:** All values must be separated ONLY by a semicolon (e.g., `Value 1; Value 2; Value 3`).  
    - Do not use bullet points, numbering, or new lines within a cell. 

3. **Output Format:** 
  - Return the result as a **Markdown Table**. 
  - Columns required: `ID`, `Category`, `A/C`, `Parameter`, `Research Output / Data`. 
  - Ensure the table structure is maintained so it can be easily copied into Excel. 

# TARGET COMPANY
{company}

# WEB SEARCH DATA
{snippets}

# DATA SCHEMA 
(Processing Instructions: Read the table below line-by-line and generate the output for each ID) 
ID | Category | Description | Parameter | Content Type to Generate | Composite elements - Minimum | Composite elements - Maximum | A/C
---|---|---|---|---|---|---|---
{schema_rows}

# TASK EXECUTION 
Perform the research for the Target Company using the Data Schema and Web Search Data above. Generate the final output Markdown table now.
"""

MAPPED_SCHEMA = {
    "name": {
        "id": "1",
        "category": "Company Basics",
        "description": "Full legal/official name of the entity",
        "parameter": "Company Name",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "short_name": {
        "id": "2",
        "category": "Company Basics",
        "description": "Commonly used short/abbreviated name",
        "parameter": "Short Name",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "logo_url": {
        "id": "3",
        "category": "Company Basics",
        "description": "Representative logo URL or image link",
        "parameter": "Logo",
        "content_type": "URL",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "category": {
        "id": "4",
        "category": "Company Basics",
        "description": "Business classification (Startup, MSME, SMB, Investor, VC)",
        "parameter": "Category",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "incorporation_year": {
        "id": "5",
        "category": "Company Basics",
        "description": "Year the company was legally incorporated/founded",
        "parameter": "Year of Incorporation",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "overview_text": {
        "id": "6",
        "category": "Company Narrative",
        "description": "A high-level summary of what the company does and its market position.",
        "parameter": "Overview of the Company",
        "content_type": "Text",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "nature_of_company": {
        "id": "7",
        "category": "Company Basics",
        "description": "Ownership structure (Private, Public, Subsidiary, etc.)",
        "parameter": "Nature of Company",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "headquarters_address": {
        "id": "8",
        "category": "Company Basics",
        "description": "Primary headquarters address and location",
        "parameter": "Company Headquarters",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "operating_countries": {
        "id": "9",
        "category": "Geographic Presence",
        "description": "List of countries where the company actively operates",
        "parameter": "Countries Operating In",
        "content_type": "Text",
        "min": "1",
        "max": "10",
        "ac": "Composite"
    },
    "office_count": {
        "id": "10",
        "category": "Geographic Presence",
        "description": "Number of additional offices excluding headquarters",
        "parameter": "Number of Offices (beyond HQ)",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "office_locations": {
        "id": "11",
        "category": "Geographic Presence",
        "description": "Specific addresses/locations of all offices",
        "parameter": "Office Locations",
        "content_type": "Text",
        "min": "1",
        "max": "10",
        "ac": "Composite"
    },
    "vision_statement": {
        "id": "12",
        "category": "People & Talent",
        "description": "Total headcount/employee size (full-time equivalents)",
        "parameter": "Employee Size",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "mission_statement": {
        "id": "13",
        "category": "People & Talent",
        "description": "Current open job roles count and breakdown by department",
        "parameter": "Hiring Velocity",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "core_values": {
        "id": "14",
        "category": "People & Talent",
        "description": "The annual percentage of employees leaving the organization.",
        "parameter": "Employee Turnover",
        "content_type": "Text",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "history_timeline": {
        "id": "15",
        "category": "People & Talent",
        "description": "The average length of time an employee stays with the company.",
        "parameter": "Average Retention Tenure",
        "content_type": "Text",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "recent_news": {
        "id": "16",
        "category": "Business Model",
        "description": "Primary customer problems/pain points the company solves",
        "parameter": "Pain Points Being Addressed",
        "content_type": "Text",
        "min": "2",
        "max": "8",
        "ac": "Composite"
    },
    "website_url": {
        "id": "17",
        "category": "Business Model",
        "description": "Target industries/sectors using GICS classification",
        "parameter": "Focus Sectors / Industries",
        "content_type": "Text",
        "min": "1",
        "max": "10",
        "ac": "Composite"
    },
    "linkedin_url": {
        "id": "18",
        "category": "Business Model",
        "description": "Core products, services, or offerings provided",
        "parameter": "Services / Offerings / Products",
        "content_type": "Text",
        "min": "2",
        "max": "10",
        "ac": "Composite"
    },
    "twitter_handle": {
        "id": "19",
        "category": "Business Model",
        "description": "Top 10-50 customers grouped by segments",
        "parameter": "Top Customers by Client Segments",
        "content_type": "Text",
        "min": "3",
        "max": "20",
        "ac": "Composite"
    },
    "facebook_url": {
        "id": "20",
        "category": "Business Model",
        "description": "Detailed breakdown of specific benefits and unique selling points for customers.",
        "parameter": "Core Value Proposition",
        "content_type": "Text",
        "min": "2",
        "max": "5",
        "ac": "Composite"
    },
    "instagram_url": {
        "id": "21",
        "category": "Strategy & Culture",
        "description": "Long-term aspirational goal of the company",
        "parameter": "Vision",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "primary_contact_email": {
        "id": "22",
        "category": "Strategy & Culture",
        "description": "Short-term actionable purpose and objectives",
        "parameter": "Mission",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "primary_phone_number": {
        "id": "23",
        "category": "Strategy & Culture",
        "description": "Core principles guiding decisions and behavior",
        "parameter": "Values",
        "content_type": "Text",
        "min": "3",
        "max": "7",
        "ac": "Composite"
    },
    "marketing_video_url": {
        "id": "24",
        "category": "Strategy & Culture",
        "description": "Unique features setting the company apart",
        "parameter": "Unique Differentiators",
        "content_type": "Text",
        "min": "2",
        "max": "6",
        "ac": "Composite"
    },
    "customer_testimonials": {
        "id": "25",
        "category": "Strategy & Culture",
        "description": "Sustainable edges like proprietary tech or network effects",
        "parameter": "Competitive Advantages",
        "content_type": "Text",
        "min": "2",
        "max": "6",
        "ac": "Composite"
    },
    "website_quality": {
        "id": "26",
        "category": "Strategy & Culture",
        "description": "Notable gaps, limitations, or weaknesses in products/services",
        "parameter": "Weaknesses / Gaps in Offering",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "website_rating": {
        "id": "27",
        "category": "Strategy & Culture",
        "description": "Major strategic, operational, or tech challenges faced",
        "parameter": "Key Challenges and Unmet Needs",
        "content_type": "Text",
        "min": "2",
        "max": "6",
        "ac": "Composite"
    },
    "website_traffic_rank": {
        "id": "28",
        "category": "Competitive Landscape",
        "description": "Direct and indirect competitors in the market",
        "parameter": "Key Competitors",
        "content_type": "Text",
        "min": "5",
        "max": "20",
        "ac": "Composite"
    },
    "social_media_followers": {
        "id": "29",
        "category": "Competitive Landscape",
        "description": "Strategic tech/alliance partners",
        "parameter": "Technology Partners",
        "content_type": "Text",
        "min": "2",
        "max": "8",
        "ac": "Composite"
    },
    "pain_points_addressed": {
        "id": "30",
        "category": "Company Narrative",
        "description": "2-3 unique/interesting facts or stories about the company",
        "parameter": "Interesting Facts",
        "content_type": "Text",
        "min": "2",
        "max": "3",
        "ac": "Composite"
    },
    "focus_sectors": {
        "id": "31",
        "category": "Company Narrative",
        "description": "Key news/events from the last 12-24 months with dates",
        "parameter": "Recent News",
        "content_type": "Text",
        "min": "2",
        "max": "8",
        "ac": "Composite"
    },
    "offerings_description": {
        "id": "32",
        "category": "Digital Presence",
        "description": "Primary official website URL",
        "parameter": "Website URL",
        "content_type": "URL",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "top_customers": {
        "id": "33",
        "category": "Digital Presence",
        "description": "Assessment of site UX, clarity, messaging, professionalism",
        "parameter": "Quality of Website",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "core_value_proposition": {
        "id": "34",
        "category": "Digital Presence",
        "description": "Overall website quality score out of 10",
        "parameter": "Website Rating",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "unique_differentiators": {
        "id": "35",
        "category": "Digital Presence",
        "description": "Global and US traffic rank",
        "parameter": "Website Traffic Rank",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Composite"
    },
    "competitive_advantages": {
        "id": "36",
        "category": "Digital Presence",
        "description": "Total followers across all social platforms",
        "parameter": "Social Media Followers \u2013 Combined",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "weaknesses_gaps": {
        "id": "37",
        "category": "Digital Presence",
        "description": "Employee/review rating on Glassdoor",
        "parameter": "Glassdoor Rating",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "key_challenges_needs": {
        "id": "38",
        "category": "Digital Presence",
        "description": "Employee/review rating on Indeed",
        "parameter": "Indeed Rating",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "key_competitors": {
        "id": "39",
        "category": "Digital Presence",
        "description": "Customer rating on Google Reviews",
        "parameter": "Google Reviews Rating",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "market_share_percentage": {
        "id": "40",
        "category": "Digital Presence",
        "description": "Official LinkedIn company profile URL",
        "parameter": "LinkedIn Profile URL",
        "content_type": "URL",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "sales_motion": {
        "id": "41",
        "category": "Digital Presence",
        "description": "Official Twitter/X handle",
        "parameter": "Twitter (X) Handle",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "customer_concentration_risk": {
        "id": "42",
        "category": "Digital Presence",
        "description": "Official Facebook page URL",
        "parameter": "Facebook Page URL",
        "content_type": "URL",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "exit_strategy_history": {
        "id": "43",
        "category": "Digital Presence",
        "description": "Official Instagram page URL",
        "parameter": "Instagram Page URL",
        "content_type": "URL",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "benchmark_vs_peers": {
        "id": "44",
        "category": "Leadership",
        "description": "Name of the CEO/equivalent top executive",
        "parameter": "CEO Name",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "future_projections": {
        "id": "45",
        "category": "Leadership",
        "description": "CEO's LinkedIn profile URL",
        "parameter": "CEO LinkedIn URL",
        "content_type": "URL",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "strategic_priorities": {
        "id": "46",
        "category": "Leadership",
        "description": "2-3 key executives: Name, Title, LinkedIn, Email, Phone",
        "parameter": "Key Business Leaders",
        "content_type": "Text",
        "min": "2",
        "max": "5",
        "ac": "Composite"
    },
    "industry_associations": {
        "id": "47",
        "category": "Leadership",
        "description": "Paths for warm intros (shared investors/board/alumni)",
        "parameter": "Warm Introduction Pathways",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "case_studies": {
        "id": "48",
        "category": "Leadership",
        "description": "Ease of reaching decision makers (High/Med/Low + reasons)",
        "parameter": "Decision Maker Accessibility",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "go_to_market_strategy": {
        "id": "49",
        "category": "Contact Info",
        "description": "General company inquiry email",
        "parameter": "Company Contact Email",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "innovation_roadmap": {
        "id": "50",
        "category": "Contact Info",
        "description": "Primary company phone number",
        "parameter": "Company Phone Number",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "product_pipeline": {
        "id": "51",
        "category": "Contact Info",
        "description": "Name of main point of contact",
        "parameter": "Primary Contact Person's Name",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "tam": {
        "id": "52",
        "category": "Contact Info",
        "description": "Title/role of primary contact",
        "parameter": "Primary Contact Person's Title",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "sam": {
        "id": "53",
        "category": "Contact Info",
        "description": "Email of primary contact",
        "parameter": "Primary Contact Person's Email",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "som": {
        "id": "54",
        "category": "Contact Info",
        "description": "Phone of primary contact",
        "parameter": "Primary Contact Person's Phone Number",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "brand_sentiment_score": {
        "id": "55",
        "category": "Reputation",
        "description": "Recent awards, certifications, or recognitions",
        "parameter": "Awards & Recognitions",
        "content_type": "Text",
        "min": "1",
        "max": "8",
        "ac": "Composite"
    },
    "brand_value": {
        "id": "56",
        "category": "Reputation",
        "description": "Overall brand sentiment (qualitative score + data sources)",
        "parameter": "Brand Sentiment Score",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "client_quality": {
        "id": "57",
        "category": "Reputation",
        "description": "Recent conferences/events participated in",
        "parameter": "Event Participation",
        "content_type": "Text",
        "min": "2",
        "max": "6",
        "ac": "Composite"
    },
    "external_recognition": {
        "id": "58",
        "category": "Risk & Compliance",
        "description": "Key certifications (SOC2, HIPAA, GDPR, etc.)",
        "parameter": "Regulatory & Compliance Status",
        "content_type": "Text",
        "min": "1",
        "max": "6",
        "ac": "Composite"
    },
    "technology_partners": {
        "id": "59",
        "category": "Risk & Compliance",
        "description": "Any ongoing/resolved legal issues or controversies",
        "parameter": "Legal Issues / Controversies",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "intellectual_property": {
        "id": "60",
        "category": "Financials",
        "description": "Latest annual revenue figure (exact or estimated)",
        "parameter": "Annual Revenues",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "r_and_d_investment": {
        "id": "61",
        "category": "Financials",
        "description": "Latest annual profit/loss",
        "parameter": "Annual Profits",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "ai_ml_adoption_level": {
        "id": "62",
        "category": "Financials",
        "description": "Breakdown of revenue (% recurring vs. one-time/service)",
        "parameter": "Revenue Mix",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Composite"
    },
    "tech_stack": {
        "id": "63",
        "category": "Financials",
        "description": "Most recent valuation or estimated value",
        "parameter": "Company Valuation",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "cybersecurity_posture": {
        "id": "64",
        "category": "Financials",
        "description": "YoY revenue growth percentage",
        "parameter": "Year-over-Year Growth Rate",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "partnership_ecosystem": {
        "id": "65",
        "category": "Financials",
        "description": "Current profitability (profitable/break-even/loss-making)",
        "parameter": "Profitability Status",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "tech_adoption_rating": {
        "id": "66",
        "category": "Financials",
        "description": "Estimated market share in primary segment",
        "parameter": "Market Share (%)",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "automation_level": {
        "id": "67",
        "category": "Funding",
        "description": "Major investors or backers",
        "parameter": "Key Investors / Backers",
        "content_type": "Text",
        "min": "2",
        "max": "6",
        "ac": "Composite"
    },
    "tools_access": {
        "id": "68",
        "category": "Funding",
        "description": "Details of recent funding: amount, date, stage",
        "parameter": "Recent Funding Rounds",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "skill_relevance": {
        "id": "69",
        "category": "Funding",
        "description": "Cumulative capital raised to date",
        "parameter": "Total Capital Raised",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "employee_size": {
        "id": "70",
        "category": "Sustainability",
        "description": "ESG practices, scores, or initiatives",
        "parameter": "ESG Practices or Ratings",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "glassdoor_rating": {
        "id": "71",
        "category": "Sales & Growth",
        "description": "Primary sales approach (PLG, Inside, Field Sales)",
        "parameter": "Sales Motion",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "indeed_rating": {
        "id": "72",
        "category": "Sales & Growth",
        "description": "Average cost to acquire a customer",
        "parameter": "Customer Acquisition Cost (CAC)",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "google_rating": {
        "id": "73",
        "category": "Sales & Growth",
        "description": "Average revenue per customer over lifetime",
        "parameter": "Customer Lifetime Value (CLV)",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "leave_policy": {
        "id": "74",
        "category": "Sales & Growth",
        "description": "Ratio of CAC to CLV (ideal >3:1)",
        "parameter": "CAC:LTV Ratio",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "health_support": {
        "id": "75",
        "category": "Sales & Growth",
        "description": "Annual customer churn percentage",
        "parameter": "Churn Rate",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "fixed_vs_variable_pay": {
        "id": "76",
        "category": "Sales & Growth",
        "description": "Customer satisfaction score (NPS)",
        "parameter": "Net Promoter Score (NPS)",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "bonus_predictability": {
        "id": "77",
        "category": "Sales & Growth",
        "description": "Risk if top client >20% of revenue (yes/no + %)",
        "parameter": "Customer Concentration Risk",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "esops_incentives": {
        "id": "78",
        "category": "Sales & Growth",
        "description": "The amount of venture capital or cash the company spends monthly.",
        "parameter": "Burn Rate",
        "content_type": "Text",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "family_health_insurance": {
        "id": "79",
        "category": "Sales & Growth",
        "description": "The number of months the company can operate before running out of cash.",
        "parameter": "Runway",
        "content_type": "Text",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "relocation_support": {
        "id": "80",
        "category": "Sales & Growth",
        "description": "Efficiency metric (e.g., net burn / net new ARR)",
        "parameter": "Burn Multiplier",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "lifestyle_benefits": {
        "id": "81",
        "category": "Innovation",
        "description": "Patents, trademarks, or key IP owned",
        "parameter": "Intellectual Property",
        "content_type": "Text",
        "min": "1",
        "max": "6",
        "ac": "Composite"
    },
    "hiring_velocity": {
        "id": "82",
        "category": "Innovation",
        "description": "R&D spend as % of revenue or absolute amount",
        "parameter": "R&D Investment",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "employee_turnover": {
        "id": "83",
        "category": "Innovation",
        "description": "Level of AI/ML use with specific examples",
        "parameter": "AI/ML Adoption Level",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "avg_retention_tenure": {
        "id": "84",
        "category": "Operations",
        "description": "Key software/tools/tech stack used",
        "parameter": "Tech Stack/Tools Used",
        "content_type": "Text",
        "min": "3",
        "max": "10",
        "ac": "Composite"
    },
    "diversity_metrics": {
        "id": "85",
        "category": "Operations",
        "description": "Cybersecurity certifications or breach history",
        "parameter": "Cybersecurity Posture",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "work_culture_summary": {
        "id": "86",
        "category": "Operations",
        "description": "Critical suppliers and associated risks",
        "parameter": "Supply Chain Dependencies",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "manager_quality": {
        "id": "87",
        "category": "Operations",
        "description": "Geopolitical/macro risks (e.g., tariffs, regulations)",
        "parameter": "Geopolitical Risks",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "psychological_safety": {
        "id": "88",
        "category": "Operations",
        "description": "External large-scale factors (political, economic) that could impact the business.",
        "parameter": "Macro Risks",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "feedback_culture": {
        "id": "89",
        "category": "People & Talent",
        "description": "Workforce diversity breakdown and DEI efforts",
        "parameter": "Diversity Metrics",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Composite"
    },
    "diversity_inclusion_score": {
        "id": "90",
        "category": "People & Talent",
        "description": "Remote/hybrid policy (% remote + productivity impact)",
        "parameter": "Remote Work Policy",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "ethical_standards": {
        "id": "91",
        "category": "People & Talent",
        "description": "Annual spend on employee training/development",
        "parameter": "Training/Development Spend",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "burnout_risk": {
        "id": "92",
        "category": "Market",
        "description": "Key strategic partnerships or alliances",
        "parameter": "Partnership Ecosystem",
        "content_type": "Text",
        "min": "2",
        "max": "8",
        "ac": "Composite"
    },
    "layoff_history": {
        "id": "93",
        "category": "Market",
        "description": "Potential or past events like IPOs, acquisitions, or mergers.",
        "parameter": "Exit Strategy/History",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "training_spend": {
        "id": "94",
        "category": "Sustainability",
        "description": "Estimated carbon footprint or env. impact",
        "parameter": "Carbon Footprint/Environmental Impact",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "onboarding_quality": {
        "id": "95",
        "category": "Sustainability",
        "description": "Practices for ethical sourcing/supply chain",
        "parameter": "Ethical Sourcing Practices",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "learning_culture": {
        "id": "96",
        "category": "Benchmarking",
        "description": "Key metrics compared to 3-5 peers",
        "parameter": "Benchmark vs. Peers",
        "content_type": "Text",
        "min": "3",
        "max": "6",
        "ac": "Composite"
    },
    "exposure_quality": {
        "id": "97",
        "category": "Forecasting",
        "description": "Projected revenue/growth for next 1-3 years",
        "parameter": "Future Projections",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "mentorship_availability": {
        "id": "98",
        "category": "Forecasting",
        "description": "Top 3-5 year priorities, initiatives, resource allocation",
        "parameter": "Strategic Priorities",
        "content_type": "Text",
        "min": "3",
        "max": "5",
        "ac": "Composite"
    },
    "internal_mobility": {
        "id": "99",
        "category": "Network",
        "description": "Key industry associations, membership level/role, benefits",
        "parameter": "Industry Associations / Memberships",
        "content_type": "Text",
        "min": "2",
        "max": "6",
        "ac": "Composite"
    },
    "promotion_clarity": {
        "id": "100",
        "category": "Proof Points",
        "description": "2-5 public case studies with links and results",
        "parameter": "Case Studies / Public Success Stories",
        "content_type": "Text",
        "min": "2",
        "max": "5",
        "ac": "Composite"
    },
    "role_clarity": {
        "id": "101",
        "category": "Go-to-Market",
        "description": "Channels, pricing, buyer personas",
        "parameter": "Go-to-Market Strategy",
        "content_type": "Text",
        "min": "3",
        "max": "6",
        "ac": "Composite"
    },
    "early_ownership": {
        "id": "102",
        "category": "Innovation",
        "description": "Upcoming products/features, R&D pipeline status",
        "parameter": "Innovation Roadmap ",
        "content_type": "Text",
        "min": "2",
        "max": "6",
        "ac": "Composite"
    },
    "work_impact": {
        "id": "103",
        "category": "Innovation",
        "description": "Upcoming features, products, or services currently in development.",
        "parameter": "Product Pipeline",
        "content_type": "Text",
        "min": "2",
        "max": "6",
        "ac": "Composite"
    },
    "execution_thinking_balance": {
        "id": "104",
        "category": "Governance",
        "description": "Board/advisor composition, notable members, independence",
        "parameter": "Board of Directors / Advisors",
        "content_type": "Text",
        "min": "3",
        "max": "8",
        "ac": "Composite"
    },
    "cross_functional_exposure": {
        "id": "105",
        "category": "Digital Presence",
        "description": "Links to official video content or channel playlists.",
        "parameter": "Company Introduction / Marketing videos",
        "content_type": "URL",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "exit_opportunities": {
        "id": "106",
        "category": "Proof Points",
        "description": "Quotes or video links from verified customers regarding their experience.",
        "parameter": "Customer testimonial",
        "content_type": "Text",
        "min": "2",
        "max": "5",
        "ac": "Composite"
    },
    "network_strength": {
        "id": "107",
        "category": "Benchmarking",
        "description": "A comparison of the company's tech stack maturity against industry peers.",
        "parameter": "Industry Benchmark Technology Adoption Rating",
        "content_type": "Text",
        "min": "2",
        "max": "3",
        "ac": "Composite"
    },
    "global_exposure": {
        "id": "108",
        "category": "Market",
        "description": "The total global demand or revenue opportunity for a product/service if 100% market share is achieved.",
        "parameter": "Total Addressable Market (TAM)",
        "content_type": "Text",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "annual_revenue": {
        "id": "109",
        "category": "Market",
        "description": "The portion of TAM that is within the company\u2019s geographic and specialized reach.",
        "parameter": "Serviceable Addressable Market (SAM)",
        "content_type": "Text",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "annual_profit": {
        "id": "110",
        "category": "Market",
        "description": "The specific percentage of SAM that the company realistically targets to capture in the short term.",
        "parameter": "Serviceable Obtainable Market (SOM)",
        "content_type": "Text",
        "min": "1",
        "max": "1",
        "ac": "Atomic"
    },
    "revenue_mix": {
        "id": "111",
        "category": "Culture & People",
        "description": "Describes whether the workplace encourages collaboration and mutual support or promotes internal competition and sustained pressure.",
        "parameter": "Work culture",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "valuation": {
        "id": "112",
        "category": "Culture & People",
        "description": "Indicates whether managers focus on coaching, mentoring, and long-term growth versus only driving task completion and short-term outcomes.",
        "parameter": "Manager quality",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "yoy_growth_rate": {
        "id": "113",
        "category": "Culture & People",
        "description": "Reflects how safe employees feel to speak openly, ask questions, challenge ideas, and admit mistakes without fear of punishment.",
        "parameter": "Psychological safety",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "profitability_status": {
        "id": "114",
        "category": "Culture & People",
        "description": "Shows whether feedback is continuous and constructive or limited to infrequent, formal review cycles.",
        "parameter": "Feedback culture",
        "content_type": "Text",
        "min": "1",
        "max": "2",
        "ac": "Composite"
    },
    "key_investors": {
        "id": "115",
        "category": "Culture & People",
        "description": "Evaluates gender balance, inclusion practices, and whether diversity initiatives are meaningful or purely symbolic.",
        "parameter": "Diversity & inclusion",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "recent_funding_rounds": {
        "id": "116",
        "category": "Culture & People",
        "description": "Measures integrity, transparency, fairness, and how the organization handles ethical dilemmas and failures.",
        "parameter": "Ethical standards",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "total_capital_raised": {
        "id": "117",
        "category": "Work\u2013Life Balance & Work Patterns",
        "description": "Defines whether work hours are fixed, flexible, or unpredictable on a daily basis.",
        "parameter": "Typical working hours",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "customer_acquisition_cost": {
        "id": "118",
        "category": "Work\u2013Life Balance & Work Patterns",
        "description": "Assesses whether overtime is occasional and situational or routinely expected.",
        "parameter": "Overtime expectations",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "customer_lifetime_value": {
        "id": "119",
        "category": "Work\u2013Life Balance & Work Patterns",
        "description": "Indicates how often employees are required to work on weekends.",
        "parameter": "Weekend work",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "cac_ltv_ratio": {
        "id": "120",
        "category": "Work\u2013Life Balance & Work Patterns",
        "description": "Describes flexibility in choosing between remote, hybrid, or fully on-site work models.",
        "parameter": "Remote / hybrid / on-site flexibility",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "churn_rate": {
        "id": "121",
        "category": "Work\u2013Life Balance & Work Patterns",
        "description": "Evaluates how easy it is to take leaves, including sick leave and mental health days.",
        "parameter": "Leave policy",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "net_promoter_score": {
        "id": "122",
        "category": "Work\u2013Life Balance & Work Patterns",
        "description": "Measures whether the pace of work is intense but sustainable or leads to frequent burnout and firefighting.",
        "parameter": "Burnout risk",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "burn_rate": {
        "id": "123",
        "category": "Location, Commute & Accessibility",
        "description": "Identifies whether the office is located in a central business area or on the city outskirts.",
        "parameter": "Central vs peripheral location",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "runway_months": {
        "id": "124",
        "category": "Location, Commute & Accessibility",
        "description": "Assesses availability and convenience of public transport options near the office.",
        "parameter": "Public transport access",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "burn_multiplier": {
        "id": "125",
        "category": "Location, Commute & Accessibility",
        "description": "Evaluates availability of cabs and whether the company provides transport support.",
        "parameter": "Cab availability and company cab policy",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "company_maturity": {
        "id": "126",
        "category": "Location, Commute & Accessibility",
        "description": "Measures travel time to the nearest airport, relevant for client-facing or travel-heavy roles.",
        "parameter": "Commute time from airport",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "regulatory_status": {
        "id": "127",
        "category": "Location, Commute & Accessibility",
        "description": "Indicates whether the office is in a tech park, IT hub, or mixed-use commercial area.",
        "parameter": "Office zone type",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "legal_issues": {
        "id": "128",
        "category": "Safety & Well-being",
        "description": "Evaluates safety of the surrounding area during both daytime and late hours.",
        "parameter": "Area safety",
        "content_type": "Text",
        "min": "1",
        "max": "2",
        "ac": "Composite"
    },
    "esg_ratings": {
        "id": "129",
        "category": "Safety & Well-being",
        "description": "Assesses company policies related to employee safety, including late-night transport and women safety measures.",
        "parameter": "Company safety policies",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "supply_chain_dependencies": {
        "id": "130",
        "category": "Safety & Well-being",
        "description": "Reviews physical safety standards of office infrastructure and facilities.",
        "parameter": "Office infrastructure safety",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "geopolitical_risks": {
        "id": "131",
        "category": "Safety & Well-being",
        "description": "Measures preparedness for medical, fire, or other emergency situations.",
        "parameter": "Emergency response preparedness",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "macro_risks": {
        "id": "132",
        "category": "Safety & Well-being",
        "description": "Evaluates quality of health insurance, OPD benefits, and mental health support.",
        "parameter": "Health support",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "carbon_footprint": {
        "id": "133",
        "category": "Learning & Growth Opportunities",
        "description": "Assesses effectiveness of onboarding programs and initial training.",
        "parameter": "Onboarding and training quality",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "ethical_sourcing": {
        "id": "134",
        "category": "Learning & Growth Opportunities",
        "description": "Indicates availability of certifications, courses, and internal learning platforms.",
        "parameter": "Learning culture",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "awards_recognitions": {
        "id": "135",
        "category": "Learning & Growth Opportunities",
        "description": "Measures exposure to real-world problem solving versus repetitive or low-impact tasks.",
        "parameter": "Exposure quality",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "event_participation": {
        "id": "136",
        "category": "Learning & Growth Opportunities",
        "description": "Evaluates access to experienced mentors and guidance.",
        "parameter": "Mentorship availability",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "mission_clarity": {
        "id": "137",
        "category": "Learning & Growth Opportunities",
        "description": "Indicates ease of moving across roles or teams internally.",
        "parameter": "Internal mobility",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "sustainability_csr": {
        "id": "138",
        "category": "Learning & Growth Opportunities",
        "description": "Clarifies whether promotions are merit-based, time-based, and transparently defined.",
        "parameter": "Promotion clarity",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "crisis_behavior": {
        "id": "139",
        "category": "Learning & Growth Opportunities",
        "description": "Assesses access to modern tools, software, and technologies used in the industry.",
        "parameter": "Tools and technology access",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "remote_policy_details": {
        "id": "140",
        "category": "Role & Work Quality",
        "description": "Measures how clearly role responsibilities and expectations are defined.",
        "parameter": "Role clarity",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "typical_hours": {
        "id": "141",
        "category": "Role & Work Quality",
        "description": "Assesses level of ownership and responsibility given early in the role.",
        "parameter": "Early ownership",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "overtime_expectations": {
        "id": "142",
        "category": "Role & Work Quality",
        "description": "Evaluates whether work impacts internal processes, customers, or revenue directly.",
        "parameter": "Work impact",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "weekend_work": {
        "id": "143",
        "category": "Role & Work Quality",
        "description": "Indicates balance between execution-focused tasks and strategic or analytical thinking.",
        "parameter": "Execution vs thinking balance",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "flexibility_level": {
        "id": "144",
        "category": "Role & Work Quality",
        "description": "Measures reliance on automation versus manual or repetitive work.",
        "parameter": "Automation level",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "location_centrality": {
        "id": "145",
        "category": "Role & Work Quality",
        "description": "Assesses opportunities to collaborate with multiple teams or functions.",
        "parameter": "Cross-functional exposure",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "public_transport_access": {
        "id": "146",
        "category": "Company Stability & Reputation",
        "description": "Identifies whether the company is a startup, scale-up, or mature enterprise.",
        "parameter": "Company maturity",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "cab_policy": {
        "id": "147",
        "category": "Company Stability & Reputation",
        "description": "Evaluates brand recognition and perceived resume value.",
        "parameter": "Brand value",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "airport_commute_time": {
        "id": "148",
        "category": "Company Stability & Reputation",
        "description": "Assesses quality of clients and their standing in the industry.",
        "parameter": "Client quality",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "office_zone_type": {
        "id": "149",
        "category": "Company Stability & Reputation",
        "description": "Reviews past instances of layoffs, restructuring, or instability.",
        "parameter": "Layoff history",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "area_safety": {
        "id": "150",
        "category": "Compensation & Benefits",
        "description": "Indicates proportion of fixed salary versus variable or performance-linked pay.",
        "parameter": "Fixed vs variable pay",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "safety_policies": {
        "id": "151",
        "category": "Compensation & Benefits",
        "description": "Measures consistency and reliability of bonuses.",
        "parameter": "Bonus predictability",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "infrastructure_safety": {
        "id": "152",
        "category": "Compensation & Benefits",
        "description": "Evaluates ESOPs or long-term incentives and their actual realized value.",
        "parameter": "ESOPs and long-term incentives",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "emergency_preparedness": {
        "id": "153",
        "category": "Compensation & Benefits",
        "description": "Assesses health insurance coverage for employees and dependents.",
        "parameter": "Family health insurance",
        "content_type": "Text",
        "min": "1",
        "max": "4",
        "ac": "Composite"
    },
    "ceo_name": {
        "id": "154",
        "category": "Compensation & Benefits",
        "description": "Indicates support provided for relocation expenses.",
        "parameter": "Relocation support",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "ceo_linkedin_url": {
        "id": "155",
        "category": "Compensation & Benefits",
        "description": "Reviews additional benefits such as meals, transport, and wellness programs.",
        "parameter": "Lifestyle and wellness benefits",
        "content_type": "Text",
        "min": "1",
        "max": "6",
        "ac": "Composite"
    },
    "key_leaders": {
        "id": "156",
        "category": "Long-Term Career Signaling",
        "description": "Tracks typical career paths of former employees.",
        "parameter": "Exit opportunities",
        "content_type": "Text",
        "min": "1",
        "max": "5",
        "ac": "Composite"
    },
    "warm_intro_pathways": {
        "id": "157",
        "category": "Long-Term Career Signaling",
        "description": "Evaluates relevance of skills gained to the broader industry.",
        "parameter": "Skill relevance",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "decision_maker_access": {
        "id": "158",
        "category": "Long-Term Career Signaling",
        "description": "Measures recognition and credibility among top-tier employers.",
        "parameter": "External recognition",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "contact_person_name": {
        "id": "159",
        "category": "Long-Term Career Signaling",
        "description": "Assesses strength of alumni and leadership networks.",
        "parameter": "Network strength",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "contact_person_title": {
        "id": "160",
        "category": "Long-Term Career Signaling",
        "description": "Indicates exposure to global clients, teams, or markets.",
        "parameter": "Global exposure",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "contact_person_email": {
        "id": "161",
        "category": "Values Alignment",
        "description": "Evaluates clarity and consistency of the company\u2019s mission and purpose.",
        "parameter": "Mission clarity",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    },
    "contact_person_phone": {
        "id": "162",
        "category": "Values Alignment",
        "description": "Assesses commitment to sustainability and social responsibility.",
        "parameter": "Sustainability and CSR",
        "content_type": "Text",
        "min": "1",
        "max": "3",
        "ac": "Composite"
    },
    "board_members": {
        "id": "163",
        "category": "Values Alignment",
        "description": "Reviews company behavior and decision-making during crises.",
        "parameter": "Crisis behavior",
        "content_type": "Text",
        "min": "As needed",
        "max": "",
        "ac": "Atomic"
    }
}

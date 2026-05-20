import { Company, SkillSetMaster } from "@/types/schema";

export const mockSkillSets: SkillSetMaster[] = [
  {
    skill_id: 1,
    name: "Data Structures & Algorithms",
    category: "Core Computer Science",
    topics: [
      { topic_id: 101, skill_id: 1, name: "Arrays & Strings", bloom_taxonomy_level: 3 },
      { topic_id: 102, skill_id: 1, name: "Linked Lists", bloom_taxonomy_level: 3 },
      { topic_id: 103, skill_id: 1, name: "Trees & Graphs", bloom_taxonomy_level: 4 },
      { topic_id: 104, skill_id: 1, name: "Dynamic Programming", bloom_taxonomy_level: 5 },
    ]
  },
  {
    skill_id: 2,
    name: "System Design",
    category: "Architecture",
    topics: [
      { topic_id: 201, skill_id: 2, name: "Scalability & Load Balancing", bloom_taxonomy_level: 4 },
      { topic_id: 202, skill_id: 2, name: "Database Sharding", bloom_taxonomy_level: 5 },
      { topic_id: 203, skill_id: 2, name: "Microservices", bloom_taxonomy_level: 4 },
    ]
  }
];

export const mockNormalizedCompanies: Company[] = [
  {
    company_id: 1,
    name: "Infosys Limited",
    short_name: "Infosys",
    logo_url: "https://logo.clearbit.com/infosys.com",
    incorporation_year: 1981,
    hq_location: "Bengaluru, India",
    nature_of_company: "Service Ecosystem",
    employee_size: "300,000+",
    website_url: "https://www.infosys.com",
    
    brand: {
      sentiment_score: 85,
      glassdoor_rating: 3.9,
      awards: "Best Employer 2024",
      brand_value: "Global IT Giant"
    },
    business: {
      sectors: "BFSI, Retail, Healthcare",
      offerings: "Digital Transformation, AI, Cloud",
      customers: "Global Fortune 500",
      revenue_model: "Project-based, Managed Services"
    },
    compensation: {
      fixed_pay_avg: 450000,
      variable_pay_avg: 50000,
      bonus_structure: "Annual Performance Bonus",
      benefits: "Insurance, PF, Gratuity"
    },
    culture: {
      work_hours: "9 AM - 6 PM",
      flexibility_rating: 7,
      psychological_safety: 8,
      diversity_score: 82
    },
    skills: [
      { company_id: 1, skill_id: 1, rating: 7, bloom_code: "3-AP" },
      { company_id: 1, skill_id: 2, rating: 6, bloom_code: "4-AN" }
    ],
    hiring_roles: [
      {
        role_id: 1001,
        company_id: 1,
        role_name: "Systems Engineer (Fresher)",
        rounds: [
          {
            round_id: 2001,
            role_id: 1001,
            round_number: 1,
            name: "Online Aptitude & Coding",
            skills_tested: [
              { round_id: 2001, skill_id: 1, weightage: 70 }
            ],
            sample_questions: "Explain the difference between a Hashmap and a Treemap."
          },
          {
            round_id: 2002,
            role_id: 1001,
            round_number: 2,
            name: "Technical Interview",
            skills_tested: [
              { round_id: 2002, skill_id: 1, weightage: 50 },
              { round_id: 2002, skill_id: 2, weightage: 30 }
            ]
          }
        ]
      }
    ],
    innovix: {
      company_id: 1,
      trends: [
        { trend_name: "GenAI in Services", impact_level: "High" }
      ],
      roadmap: [
        { phase: "Phase 1", milestone: "AI-First Delivery Model" }
      ],
      competitors: [
        { name: "TCS", market_share: "20%" },
        { name: "Accenture", market_share: "15%" }
      ],
      pillars: [
        { name: "Automation", description: "Reducing manual toil in legacy systems" }
      ],
      projects: [
        { tier: "Foundational", name: "Internal AI Copilot", description: "Code generation tool for developers" }
      ]
    }
  },
  {
    company_id: 3,
    name: "Razorpay",
    short_name: "Razorpay",
    logo_url: "https://logo.clearbit.com/razorpay.com",
    incorporation_year: 2014,
    hq_location: "Bengaluru, India",
    nature_of_company: "Product Hub",
    employee_size: "3,500+",
    website_url: "https://razorpay.com",
    
    brand: {
      sentiment_score: 92,
      glassdoor_rating: 4.1,
      awards: "Unicorn of the Year",
      brand_value: "Fintech Leader"
    },
    business: {
      sectors: "Fintech, Payments, Banking",
      offerings: "Payment Gateway, Payroll, Neo-banking",
      customers: "SMEs, Large Enterprises",
      revenue_model: "Transaction-based, Subscription"
    },
    culture: {
      work_hours: "Flexible",
      flexibility_rating: 9,
      psychological_safety: 9,
      diversity_score: 75
    },
    skills: [
      { company_id: 3, skill_id: 1, rating: 9, bloom_code: "5-SY" },
      { company_id: 3, skill_id: 2, rating: 9, bloom_code: "5-SY" }
    ],
    innovix: {
      company_id: 3,
      projects: [
        { tier: "Breakthrough", name: "Real-time Fraud Detection", description: "ML-driven security layer" }
      ]
    }
  }
];

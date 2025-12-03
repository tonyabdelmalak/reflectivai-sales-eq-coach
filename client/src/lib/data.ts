import type { CoachingModule, EQFramework, Scenario, HeuristicTemplate, KnowledgeArticle } from "@shared/schema";

export const eqFrameworks: EQFramework[] = [
  {
    id: "disc",
    name: "DISC Behavioral Model",
    description: "Understand and adapt to different personality styles in healthcare decision-making",
    principles: [
      "Dominance (D): Direct, results-oriented, decisive",
      "Influence (I): Enthusiastic, collaborative, optimistic",
      "Steadiness (S): Patient, reliable, team-oriented",
      "Conscientiousness (C): Analytical, precise, systematic"
    ],
    techniques: [
      {
        name: "Style Identification",
        description: "Quickly identify a stakeholder's primary DISC style through verbal and non-verbal cues",
        example: "A physician who wants bottom-line efficacy data first is likely high-D"
      },
      {
        name: "Adaptive Communication",
        description: "Modify your presentation style to match the stakeholder's preferences",
        example: "For high-C stakeholders, lead with clinical data and methodology details"
      },
      {
        name: "Conflict Resolution",
        description: "Use DISC awareness to navigate disagreements productively",
        example: "With high-S stakeholders, take time to address concerns about change impact"
      }
    ],
    color: "chart-1"
  },
  {
    id: "active-listening",
    name: "Active Listening",
    description: "Develop deep listening skills to understand stakeholder needs and build trust",
    principles: [
      "Give full attention without planning your response",
      "Reflect back what you hear to confirm understanding",
      "Ask clarifying questions to go deeper",
      "Notice non-verbal cues and emotional undertones"
    ],
    techniques: [
      {
        name: "Paraphrasing",
        description: "Restate the stakeholder's message in your own words",
        example: "So what I'm hearing is that your primary concern is patient adherence..."
      },
      {
        name: "Emotional Validation",
        description: "Acknowledge the feelings behind the words",
        example: "I can understand why the formulary restrictions are frustrating for your practice"
      },
      {
        name: "Strategic Silence",
        description: "Use purposeful pauses to encourage deeper sharing",
        example: "After a stakeholder shares a concern, pause 3-5 seconds before responding"
      }
    ],
    color: "chart-2"
  },
  {
    id: "empathy-mapping",
    name: "Empathy Mapping",
    description: "Understand stakeholder perspectives by mapping what they think, feel, say, and do",
    principles: [
      "Map what stakeholders SAY in conversations",
      "Infer what they THINK based on their questions",
      "Identify what they FEEL through emotional cues",
      "Observe what they DO in their decision patterns"
    ],
    techniques: [
      {
        name: "Stakeholder Journey Mapping",
        description: "Chart the emotional journey of key decision-makers",
        example: "Map a KOL's journey from initial skepticism to advocacy for your therapy"
      },
      {
        name: "Pain Point Discovery",
        description: "Uncover the real challenges stakeholders face daily",
        example: "Ask about their biggest frustration in managing treatment-resistant patients"
      },
      {
        name: "Value Alignment",
        description: "Connect your solution to what stakeholders truly care about",
        example: "Link clinical outcomes to the physician's personal mission of improving lives"
      }
    ],
    color: "chart-3"
  },
  {
    id: "rapport-building",
    name: "Rapport Building",
    description: "Establish genuine connections that form the foundation of trusted partnerships",
    principles: [
      "Find authentic common ground beyond business",
      "Match communication style and energy levels",
      "Demonstrate consistent reliability over time",
      "Show genuine interest in their success"
    ],
    techniques: [
      {
        name: "Mirroring",
        description: "Subtly match body language, pace, and vocabulary",
        example: "If a stakeholder speaks methodically, slow your pace to match"
      },
      {
        name: "Value-First Approach",
        description: "Lead with insights and value before discussing products",
        example: "Share a relevant clinical insight before presenting your therapy data"
      },
      {
        name: "Follow-Through Excellence",
        description: "Build trust through consistent delivery on commitments",
        example: "Send the promised journal article within 24 hours of the meeting"
      }
    ],
    color: "chart-4"
  }
];

export const coachingModules: CoachingModule[] = [
  {
    id: "discovery",
    title: "Discovery Questions Mastery",
    description: "Learn to ask powerful questions that uncover stakeholder needs, challenges, and priorities",
    category: "discovery",
    icon: "Search",
    frameworks: ["active-listening", "empathy-mapping"],
    exercises: [
      {
        id: "d1",
        title: "Open-Ended Question Practice",
        description: "Practice converting closed questions to open-ended alternatives",
        type: "practice"
      },
      {
        id: "d2",
        title: "Needs Discovery Role-Play",
        description: "Simulate a first meeting with a new oncologist",
        type: "roleplay"
      }
    ],
    progress: 0
  },
  {
    id: "stakeholder",
    title: "Stakeholder Mapping",
    description: "Identify and understand all decision-makers in the healthcare ecosystem",
    category: "stakeholder",
    icon: "Users",
    frameworks: ["disc", "empathy-mapping"],
    exercises: [
      {
        id: "s1",
        title: "Influence Network Analysis",
        description: "Map the decision-making network for a hospital system",
        type: "practice"
      },
      {
        id: "s2",
        title: "P&T Committee Dynamics",
        description: "Understand pharmacy and therapeutics committee processes",
        type: "quiz"
      }
    ],
    progress: 0
  },
  {
    id: "clinical",
    title: "Clinical Evidence Communication",
    description: "Present clinical data effectively to different stakeholder types",
    category: "clinical",
    icon: "FileText",
    frameworks: ["disc", "active-listening"],
    exercises: [
      {
        id: "c1",
        title: "Data Storytelling",
        description: "Transform clinical trial results into compelling narratives",
        type: "practice"
      },
      {
        id: "c2",
        title: "KOL Presentation",
        description: "Present phase 3 data to a skeptical key opinion leader",
        type: "roleplay"
      }
    ],
    progress: 0
  },
  {
    id: "objection",
    title: "Objection Handling",
    description: "Address concerns and objections with empathy and evidence",
    category: "objection",
    icon: "Shield",
    frameworks: ["active-listening", "rapport-building"],
    exercises: [
      {
        id: "o1",
        title: "Cost Objection Response",
        description: "Practice responding to budget and pricing concerns",
        type: "roleplay"
      },
      {
        id: "o2",
        title: "Safety Concern Navigation",
        description: "Address adverse event questions effectively",
        type: "practice"
      }
    ],
    progress: 0
  },
  {
    id: "closing",
    title: "Closing Techniques",
    description: "Guide stakeholders toward commitment with confidence and integrity",
    category: "closing",
    icon: "CheckCircle",
    frameworks: ["rapport-building", "disc"],
    exercises: [
      {
        id: "cl1",
        title: "Commitment Ladder",
        description: "Practice gaining incremental commitments",
        type: "practice"
      },
      {
        id: "cl2",
        title: "Next Steps Confirmation",
        description: "Master the art of clear action planning",
        type: "roleplay"
      }
    ],
    progress: 0
  },
  {
    id: "eq-mastery",
    title: "EQ Mastery for Pharma",
    description: "Integrate all emotional intelligence frameworks for healthcare selling",
    category: "eq",
    icon: "Brain",
    frameworks: ["disc", "active-listening", "empathy-mapping", "rapport-building"],
    exercises: [
      {
        id: "eq1",
        title: "Multi-Stakeholder Meeting",
        description: "Navigate a meeting with diverse personality types",
        type: "roleplay"
      },
      {
        id: "eq2",
        title: "EQ Self-Assessment",
        description: "Evaluate your emotional intelligence strengths",
        type: "quiz"
      }
    ],
    progress: 0
  }
];

export const scenarios: Scenario[] = [
  {
    id: "onc-kol",
    title: "Oncology KOL Introduction",
    description: "First meeting with a key opinion leader in breast cancer treatment",
    category: "oncology",
    stakeholder: "Dr. Sarah Chen, MD - Medical Oncologist, Cancer Center Director",
    objective: "Establish credibility and schedule a follow-up meeting to discuss clinical data",
    context: "Dr. Chen is highly published in HER2+ breast cancer. She's skeptical of new therapies without robust long-term data. Her time is extremely limited.",
    challenges: [
      "Limited time window (15 minutes)",
      "High skepticism toward pharma reps",
      "Demands peer-reviewed evidence",
      "Already loyal to competitor product"
    ],
    keyMessages: [
      "Novel mechanism of action",
      "Phase 3 overall survival data",
      "Quality of life improvements",
      "Patient support program"
    ],
    difficulty: "advanced"
  },
  {
    id: "card-formulary",
    title: "Cardiology Formulary Review",
    description: "Present to the P&T committee for formulary inclusion",
    category: "cardiology",
    stakeholder: "Hospital P&T Committee - 8 members including pharmacists, physicians, and administrators",
    objective: "Gain preferred formulary status for your heart failure medication",
    context: "The hospital is cost-conscious but values clinical outcomes. Current standard of care is well-established. Your drug offers incremental benefit at higher cost.",
    challenges: [
      "Price premium over existing options",
      "Limited real-world evidence",
      "Need pharmacoeconomic justification",
      "Competing presentation from rival company"
    ],
    keyMessages: [
      "Reduction in hospitalizations",
      "Total cost of care savings",
      "Improved patient outcomes",
      "Physician feedback data"
    ],
    difficulty: "advanced"
  },
  {
    id: "neuro-access",
    title: "Neurology Market Access",
    description: "Navigate prior authorization challenges with a payer",
    category: "neurology",
    stakeholder: "Dr. James Miller - Medical Director, Regional Health Plan",
    objective: "Reduce prior authorization barriers for your multiple sclerosis therapy",
    context: "The payer has strict utilization management. Your therapy is second-line due to cost. Physicians are frustrated with approval delays.",
    challenges: [
      "Strict step-therapy requirements",
      "Focus on cost containment",
      "Limited meeting time",
      "Competing therapies on formulary"
    ],
    keyMessages: [
      "Clinical differentiation data",
      "Patient adherence benefits",
      "Long-term cost effectiveness",
      "Real-world outcomes"
    ],
    difficulty: "intermediate"
  },
  {
    id: "immuno-launch",
    title: "Immunology New Product Launch",
    description: "Introduce a newly approved biologic to a rheumatology practice",
    category: "immunology",
    stakeholder: "Dr. Maria Rodriguez - Rheumatologist, Private Practice",
    objective: "Secure commitment to trial the new therapy with appropriate patients",
    context: "The practice sees many rheumatoid arthritis patients. They're familiar with existing biologics. Your product offers a novel mechanism with good safety data.",
    challenges: [
      "Comfort with existing therapies",
      "Concern about switching stable patients",
      "Questions about insurance coverage",
      "Limited office visit time"
    ],
    keyMessages: [
      "Rapid onset of action",
      "Favorable safety profile",
      "Patient convenience features",
      "Access and affordability programs"
    ],
    difficulty: "beginner"
  },
  {
    id: "rare-diagnosis",
    title: "Rare Disease Diagnosis Journey",
    description: "Help a physician recognize and diagnose a rare metabolic disorder",
    category: "rare-disease",
    stakeholder: "Dr. Patricia Lee - Pediatric Geneticist, Academic Medical Center",
    objective: "Increase awareness of disease symptoms and diagnostic pathway",
    context: "The condition affects 1 in 50,000 patients. Average time to diagnosis is 5 years. Your company offers the only approved treatment.",
    challenges: [
      "Low disease awareness",
      "Complex diagnostic workup",
      "Limited patient population",
      "Academic skepticism"
    ],
    keyMessages: [
      "Red flag symptoms",
      "Diagnostic algorithm",
      "Early treatment benefits",
      "Patient identification support"
    ],
    difficulty: "intermediate"
  }
];

export const heuristicTemplates: HeuristicTemplate[] = [
  {
    id: "h1",
    category: "objection",
    name: "Feel-Felt-Found",
    template: "I understand how you feel. Other physicians have felt the same way. What they've found is that [benefit/outcome].",
    example: "I understand how you feel about the cost. Other oncologists felt the same concern initially. What they've found is that the reduction in hospitalizations more than offsets the therapy cost.",
    useCase: "When facing emotional or initial resistance objections",
    eqPrinciples: ["empathy-mapping", "active-listening"]
  },
  {
    id: "h2",
    category: "objection",
    name: "Acknowledge-Bridge-Close",
    template: "That's an important consideration. [Acknowledge]. What we've seen is [bridge to benefit]. How would [closing question]?",
    example: "That's an important consideration about long-term safety. We now have 5-year follow-up data showing consistent outcomes. How would access to that data help your prescribing confidence?",
    useCase: "When addressing specific clinical or data concerns",
    eqPrinciples: ["active-listening", "rapport-building"]
  },
  {
    id: "h3",
    category: "value-proposition",
    name: "Problem-Agitate-Solve",
    template: "Many physicians struggle with [problem]. This leads to [negative impact]. [Your solution] addresses this by [benefit].",
    example: "Many physicians struggle with patient adherence to injection therapies. This leads to suboptimal outcomes and increased office visits. Our auto-injector design addresses this with a 94% patient preference rating.",
    useCase: "When presenting your therapy's unique value",
    eqPrinciples: ["empathy-mapping"]
  },
  {
    id: "h4",
    category: "value-proposition",
    name: "Before-After-Bridge",
    template: "Before [your solution], patients experienced [challenge]. After, they [improved outcome]. The bridge is [your specific benefit].",
    example: "Before our therapy, patients with moderate-to-severe RA averaged 4 flares per year. After starting treatment, that dropped to 1.2 flares. The bridge is our rapid onset of action within the first week.",
    useCase: "When demonstrating clinical transformation",
    eqPrinciples: ["empathy-mapping", "rapport-building"]
  },
  {
    id: "h5",
    category: "closing",
    name: "Assumptive Next Step",
    template: "Based on what we've discussed, would it make sense to [specific next action]? I can [support offer].",
    example: "Based on what we've discussed about your HER2+ patients, would it make sense to schedule a peer-to-peer with Dr. Martinez? I can coordinate calendars this week.",
    useCase: "When gaining commitment after positive discussion",
    eqPrinciples: ["disc", "rapport-building"]
  },
  {
    id: "h6",
    category: "closing",
    name: "Trial Close with Options",
    template: "Would you prefer to start with [option A] or [option B]? Either way, I'll ensure [support commitment].",
    example: "Would you prefer to start with sample patients or begin with a lunch-and-learn for your team? Either way, I'll ensure you have all the clinical resources you need.",
    useCase: "When offering pathways to commitment",
    eqPrinciples: ["disc"]
  },
  {
    id: "h7",
    category: "discovery",
    name: "Situation-Problem-Implication",
    template: "Tell me about [situation]. What challenges does that create? How does that impact [patient outcomes/practice efficiency]?",
    example: "Tell me about your current approach to treatment-resistant patients. What challenges does that create in your practice? How does that impact your confidence in managing complex cases?",
    useCase: "When uncovering deep needs and priorities",
    eqPrinciples: ["active-listening", "empathy-mapping"]
  },
  {
    id: "h8",
    category: "discovery",
    name: "Day-in-the-Life",
    template: "Walk me through how you currently handle [situation]. What would make that easier/better?",
    example: "Walk me through how you currently handle insurance prior authorizations for biologics. What would make that process easier for your team?",
    useCase: "When understanding workflows and pain points",
    eqPrinciples: ["active-listening", "empathy-mapping"]
  },
  {
    id: "h9",
    category: "rapport",
    name: "Genuine Curiosity",
    template: "I noticed [observation about their work/interest]. What drew you to [that specialty/approach]?",
    example: "I noticed you've published extensively on personalized medicine approaches. What drew you to focus on biomarker-driven treatment selection?",
    useCase: "When building authentic connection",
    eqPrinciples: ["rapport-building", "active-listening"]
  },
  {
    id: "h10",
    category: "rapport",
    name: "Shared Purpose",
    template: "What we share is a commitment to [patient outcome]. I'm here to support that by [specific value].",
    example: "What we share is a commitment to improving quality of life for RA patients. I'm here to support that by ensuring you have the latest clinical evidence and patient access resources.",
    useCase: "When aligning on common ground",
    eqPrinciples: ["rapport-building", "empathy-mapping"]
  }
];

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "fda-approval",
    title: "FDA Drug Approval Process Overview",
    category: "fda",
    content: `The FDA drug approval process is rigorous and multi-phased, designed to ensure safety and efficacy before market authorization.

## Preclinical Testing
Before human trials, drugs undergo laboratory and animal testing to assess safety and biological activity.

## Clinical Trial Phases

### Phase 1
- 20-100 healthy volunteers
- Focus on safety and dosage
- Duration: Several months

### Phase 2
- 100-500 patients with condition
- Assess efficacy and side effects
- Duration: Several months to 2 years

### Phase 3
- 1,000-5,000 patients
- Confirm efficacy, monitor adverse reactions
- Duration: 1-4 years

## NDA/BLA Review
The New Drug Application or Biologics License Application is submitted with all clinical data. FDA review typically takes 10-12 months, with priority review available for breakthrough therapies.

## Post-Marketing (Phase 4)
Ongoing safety monitoring and additional studies after approval.`,
    summary: "Understanding the FDA's drug approval pathway from preclinical testing through post-market surveillance",
    tags: ["FDA", "drug approval", "clinical trials", "NDA", "regulatory"]
  },
  {
    id: "clinical-design",
    title: "Clinical Trial Design Fundamentals",
    category: "clinical-trials",
    content: `Understanding clinical trial design is essential for effectively communicating with healthcare providers about your therapy's evidence base.

## Randomized Controlled Trials (RCTs)
The gold standard for establishing causality. Patients are randomly assigned to treatment or control groups.

## Key Design Elements

### Blinding
- Single-blind: Patients don't know assignment
- Double-blind: Neither patients nor investigators know
- Open-label: All parties aware of assignment

### Control Types
- Placebo-controlled
- Active comparator
- Standard of care

### Endpoints
- Primary: Main outcome measure
- Secondary: Additional outcomes of interest
- Exploratory: Hypothesis-generating

## Statistical Considerations
- p-value: Probability result occurred by chance
- Confidence interval: Range of plausible values
- Hazard ratio: Comparison of event rates
- Number needed to treat: Patients to treat for one benefit`,
    summary: "Core concepts in clinical trial design that every pharma professional should understand",
    tags: ["clinical trials", "RCT", "endpoints", "statistics", "evidence"]
  },
  {
    id: "hipaa-basics",
    title: "HIPAA Compliance for Pharma Sales",
    category: "compliance",
    content: `HIPAA regulations impact how pharmaceutical representatives can interact with healthcare providers and access patient information.

## Protected Health Information (PHI)
Any individually identifiable health information including:
- Names, addresses, dates
- Medical records and history
- Insurance information
- Any other identifying data

## Key Requirements

### Minimum Necessary Standard
Only access the minimum PHI needed for a specific purpose.

### Business Associate Agreements
Required when third parties handle PHI on behalf of covered entities.

### Security Safeguards
- Administrative controls
- Physical safeguards
- Technical measures

## Implications for Sales Reps
- Never request specific patient information
- Avoid looking at patient charts or records
- Be careful with sample signature logs
- Maintain confidentiality of any incidental exposure`,
    summary: "Essential HIPAA knowledge for maintaining compliance in pharmaceutical sales interactions",
    tags: ["HIPAA", "compliance", "privacy", "PHI", "regulations"]
  },
  {
    id: "hcp-engagement",
    title: "HCP Engagement Best Practices",
    category: "hcp-engagement",
    content: `Effective engagement with healthcare providers requires balancing value delivery with regulatory compliance.

## Pre-Call Planning
- Research the HCP's specialty and interests
- Review publication history
- Understand practice dynamics
- Prepare relevant clinical data

## During the Interaction
- Lead with value, not product
- Listen more than you speak
- Respect time constraints
- Offer relevant resources

## Compliance Considerations
- Follow speaker program guidelines
- Proper documentation of samples
- Transparency in value exchanges
- Sunshine Act reporting

## Virtual Engagement
- Leverage approved digital channels
- Respect communication preferences
- Provide easy access to resources
- Follow up appropriately`,
    summary: "Guidelines for effective and compliant healthcare provider engagement",
    tags: ["HCP", "engagement", "compliance", "best practices", "sales"]
  },
  {
    id: "market-access",
    title: "Understanding Payer Dynamics",
    category: "market-access",
    content: `Navigating the complex payer landscape is crucial for ensuring patient access to your therapies.

## Payer Types

### Commercial Payers
- Large national insurers (UnitedHealthcare, Anthem, Aetna)
- Regional health plans
- Self-insured employers

### Government Payers
- Medicare Part D
- Medicaid (state-specific)
- Veterans Affairs

## Formulary Tiers
- Tier 1: Generic (lowest copay)
- Tier 2: Preferred brand
- Tier 3: Non-preferred brand
- Specialty tier: High-cost therapies

## Access Barriers
- Prior authorization
- Step therapy requirements
- Quantity limits
- Site of care restrictions

## Value Demonstration
- Clinical differentiation
- Pharmacoeconomic data
- Real-world evidence
- Patient outcomes data`,
    summary: "Key concepts in market access and payer navigation for pharmaceutical products",
    tags: ["payers", "formulary", "market access", "insurance", "reimbursement"]
  },
  {
    id: "pricing-transparency",
    title: "Drug Pricing and Transparency",
    category: "pricing",
    content: `Understanding drug pricing mechanisms helps navigate conversations about cost and value.

## Pricing Terminology

### WAC (Wholesale Acquisition Cost)
The manufacturer's list price to wholesalers. Often used as the starting point for negotiations.

### AWP (Average Wholesale Price)
A benchmark price, typically WAC plus a markup. Used in some reimbursement calculations.

### ASP (Average Sales Price)
Medicare Part B uses ASP plus 6% for reimbursement of physician-administered drugs.

## Discounts and Rebates
- Medicaid rebates (mandatory)
- Commercial rebates (negotiated)
- 340B program pricing
- Patient assistance programs

## Transparency Requirements
- Sunshine Act reporting
- State pricing laws
- Pipeline notification requirements

## Value-Based Discussions
Frame cost conversations around:
- Total cost of care
- Avoided hospitalizations
- Quality of life improvements
- Long-term outcomes`,
    summary: "Navigate drug pricing conversations with clarity and confidence",
    tags: ["pricing", "transparency", "WAC", "rebates", "value"]
  }
];

export const sampleSqlQueries = [
  {
    natural: "Show me all sales calls this month",
    sql: "SELECT * FROM sales_calls WHERE call_date >= DATE_TRUNC('month', CURRENT_DATE) ORDER BY call_date DESC;"
  },
  {
    natural: "Which products had the highest prescriptions last quarter?",
    sql: "SELECT product_name, SUM(prescription_count) as total_rx FROM prescriptions WHERE prescription_date >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months') AND prescription_date < DATE_TRUNC('quarter', CURRENT_DATE) GROUP BY product_name ORDER BY total_rx DESC LIMIT 10;"
  },
  {
    natural: "Find physicians who haven't been contacted in 30 days",
    sql: "SELECT p.name, p.specialty, p.institution, MAX(c.contact_date) as last_contact FROM physicians p LEFT JOIN contacts c ON p.id = c.physician_id GROUP BY p.id, p.name, p.specialty, p.institution HAVING MAX(c.contact_date) < CURRENT_DATE - INTERVAL '30 days' OR MAX(c.contact_date) IS NULL;"
  },
  {
    natural: "What's my average samples per call by territory?",
    sql: "SELECT t.territory_name, AVG(sc.samples_distributed) as avg_samples FROM sales_calls sc JOIN territories t ON sc.territory_id = t.id GROUP BY t.territory_name ORDER BY avg_samples DESC;"
  },
  {
    natural: "Compare prescription trends for oncology vs cardiology",
    sql: "SELECT therapeutic_area, DATE_TRUNC('month', prescription_date) as month, COUNT(*) as rx_count FROM prescriptions WHERE therapeutic_area IN ('Oncology', 'Cardiology') AND prescription_date >= CURRENT_DATE - INTERVAL '12 months' GROUP BY therapeutic_area, month ORDER BY month, therapeutic_area;"
  }
];

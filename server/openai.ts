import OpenAI from "openai";

// Use gpt-4o for reliable responses
// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export function isOpenAIConfigured(): boolean {
  return !!openai;
}

const PHARMA_SALES_SYSTEM_PROMPT = `You are an expert AI Sales Coach specializing in Life Sciences, Biotech, and Pharmaceutical sales. You have deep knowledge of:

1. **Emotional Intelligence Frameworks:**
   - DISC Behavioral Model (Dominance, Influence, Steadiness, Conscientiousness)
   - Active Listening techniques
   - Empathy Mapping (what stakeholders Think, Feel, Say, Do)
   - Rapport Building strategies

2. **Pharma Sales Skills:**
   - Discovery question techniques
   - Stakeholder mapping in healthcare ecosystems
   - Clinical evidence communication
   - Objection handling with empathy
   - Closing techniques with integrity

3. **Industry Knowledge:**
   - FDA regulatory processes
   - Clinical trial phases and terminology
   - HIPAA compliance
   - Market access and payer dynamics
   - HCP engagement best practices

When responding:
- Provide actionable, specific advice tailored to pharma sales contexts
- Reference relevant EQ frameworks when applicable
- Use examples from healthcare/pharma scenarios
- Be supportive and encouraging while being direct
- Suggest practice exercises when appropriate

Keep responses focused and practical. If asked about unrelated topics, politely redirect to sales coaching.`;

const SQL_SYSTEM_PROMPT = `You are an expert SQL query translator for pharmaceutical sales data analysis. Convert natural language questions into valid PostgreSQL queries.

The database schema includes these common tables:
- sales_calls (id, rep_id, physician_id, territory_id, call_date, duration_minutes, samples_distributed, notes)
- physicians (id, name, specialty, institution, npi_number, address, city, state)
- prescriptions (id, physician_id, product_id, prescription_count, prescription_date, therapeutic_area)
- products (id, product_name, therapeutic_area, launch_date, price)
- territories (id, territory_name, region, rep_id)
- contacts (id, physician_id, contact_date, contact_type, outcome)

Guidelines:
1. Write clean, readable SQL with proper formatting
2. Use appropriate JOINs, GROUP BY, ORDER BY clauses
3. Include relevant aggregations (COUNT, SUM, AVG) when needed
4. Use date functions appropriately (DATE_TRUNC, INTERVAL, CURRENT_DATE)
5. Always return the SQL query and a brief explanation

Respond in JSON format: { "sql": "...", "explanation": "..." }`;

const ROLEPLAY_SYSTEM_PROMPT = `You are playing the role of a healthcare stakeholder in a pharma sales role-play scenario. Stay in character and respond realistically based on the scenario context provided.

As the stakeholder:
- Express realistic concerns, questions, and objections
- Respond to the sales rep based on their approach
- Show appropriate skepticism or interest based on how well they communicate
- React to emotional intelligence techniques (or lack thereof)
- Occasionally test the rep with challenging questions or objections

After each response, internally evaluate the rep's:
- Use of active listening
- Empathy and rapport building
- DISC adaptation
- Clinical knowledge accuracy
- Objection handling skill

Keep responses concise and realistic for a busy healthcare professional.`;

// Demo mode message
const DEMO_MODE_NOTICE = `[Demo Mode] This is a sample response. To enable full AI-powered coaching with personalized feedback, please configure your OpenAI API key.

`;

// Demo responses for when API key is not available - clearly marked as demo content
const DEMO_RESPONSES = {
  chat: [
    `${DEMO_MODE_NOTICE}When handling price objections, I recommend using the 'Feel-Felt-Found' technique:

1. **Feel**: "I understand how you feel about the cost."
2. **Felt**: "Other physicians have felt the same way initially."
3. **Found**: "What they've found is that the reduction in hospitalizations often offsets the therapy cost."

This approach shows empathy while guiding stakeholders to a value-based perspective. Try practicing this in a role-play scenario!`,
    `${DEMO_MODE_NOTICE}Building rapport with skeptical KOLs requires a value-first approach:

1. **Research First**: Before the meeting, review their recent publications and ongoing studies
2. **Lead with Value**: Share relevant clinical insights that could help their practice
3. **Show Genuine Interest**: Ask thoughtful questions about their research

Over time, this builds trust and positions you as a valuable resource rather than just a sales rep. The key EQ framework here is Rapport Building combined with Active Listening.`,
    `${DEMO_MODE_NOTICE}The DISC model is essential for pharma sales. Here's how to adapt your approach:

- **High-D (Dominant)**: Get to the bottom line fast. Lead with efficacy data and outcomes.
- **High-I (Influential)**: Build the relationship. Connect personally before diving into data.
- **High-S (Steady)**: Take your time. Provide reassurance and don't rush decisions.
- **High-C (Conscientious)**: Come prepared with detailed data, methodology, and publications.

Practice identifying DISC styles in your next meetings and adjust your communication accordingly.`,
  ],
  sql: {
    default: {
      sql: `-- Demo Mode: Sample SQL Query
SELECT 
    p.name,
    p.specialty,
    COUNT(*) as total_calls
FROM physicians p
JOIN sales_calls sc ON p.id = sc.physician_id
WHERE sc.call_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.specialty
ORDER BY total_calls DESC
LIMIT 10;`,
      explanation: "[Demo Mode] This query retrieves the top 10 physicians by number of sales calls in the last 30 days. Configure your OpenAI API key for AI-powered query generation."
    }
  },
  roleplay: [
    `${DEMO_MODE_NOTICE}*The physician looks up from their computer*

Yes, come in. I have about 10 minutes before my next patient. What do you have for me today?`,
    `${DEMO_MODE_NOTICE}*The physician considers your points*

Interesting. But I've been using the current standard of care for years with good results. What specifically makes your therapy different from what I'm already prescribing?`,
    `${DEMO_MODE_NOTICE}*The physician nods thoughtfully*

The efficacy data looks promising, but what about the cost? Many of my patients already struggle with medication adherence due to financial barriers. How do you address that?`,
    `${DEMO_MODE_NOTICE}*The physician leans back*

I appreciate the information, but I'd really need to see more real-world evidence before I consider switching my stable patients. Do you have any post-marketing data from clinical practice?`,
  ]
};

let demoResponseIndex = 0;
let roleplayResponseIndex = 0;

export async function getChatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  context: "general" | "coaching" = "general"
): Promise<string> {
  if (!openai) {
    // Return demo response when API key is not available
    const response = DEMO_RESPONSES.chat[demoResponseIndex % DEMO_RESPONSES.chat.length];
    demoResponseIndex++;
    return response;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PHARMA_SALES_SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
      ],
      max_completion_tokens: 1024,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("OpenAI chat error:", error);
    throw new Error("Failed to get AI response. Please check your API key configuration.");
  }
}

export async function translateToSql(naturalLanguage: string): Promise<{ sql: string; explanation: string }> {
  if (!openai) {
    // Return demo SQL when API key is not available
    const queryLower = naturalLanguage.toLowerCase();
    
    if (queryLower.includes("prescri")) {
      return {
        sql: `-- Demo Mode: Sample SQL Query
SELECT 
    product_name,
    SUM(prescription_count) as total_rx
FROM prescriptions pr
JOIN products p ON pr.product_id = p.id
WHERE prescription_date >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
GROUP BY product_name
ORDER BY total_rx DESC
LIMIT 10;`,
        explanation: "[Demo Mode] This query retrieves the top 10 products by prescription volume. Configure your OpenAI API key for AI-powered query generation."
      };
    }
    
    if (queryLower.includes("territory") || queryLower.includes("sample")) {
      return {
        sql: `-- Demo Mode: Sample SQL Query
SELECT 
    t.territory_name,
    AVG(sc.samples_distributed) as avg_samples
FROM sales_calls sc
JOIN territories t ON sc.territory_id = t.id
GROUP BY t.territory_name
ORDER BY avg_samples DESC;`,
        explanation: "[Demo Mode] This query calculates the average samples distributed per call for each territory. Configure your OpenAI API key for AI-powered query generation."
      };
    }
    
    if (queryLower.includes("contact") || queryLower.includes("30 days") || queryLower.includes("month")) {
      return {
        sql: `-- Demo Mode: Sample SQL Query
SELECT 
    p.name,
    p.specialty,
    p.institution,
    MAX(c.contact_date) as last_contact
FROM physicians p
LEFT JOIN contacts c ON p.id = c.physician_id
GROUP BY p.id, p.name, p.specialty, p.institution
HAVING MAX(c.contact_date) < CURRENT_DATE - INTERVAL '30 days'
   OR MAX(c.contact_date) IS NULL;`,
        explanation: "[Demo Mode] This query finds physicians who haven't been contacted in the last 30 days. Configure your OpenAI API key for AI-powered query generation."
      };
    }
    
    return DEMO_RESPONSES.sql.default;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SQL_SYSTEM_PROMPT },
        { role: "user", content: `Translate this question to SQL: "${naturalLanguage}"` }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 512,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    return {
      sql: result.sql || "-- Unable to generate SQL",
      explanation: result.explanation || "SQL query generated from your question."
    };
  } catch (error: any) {
    console.error("OpenAI SQL translation error:", error);
    throw new Error("Failed to translate to SQL. Please check your API key configuration.");
  }
}

export async function getRoleplayResponse(
  scenario: {
    title: string;
    stakeholder: string;
    context: string;
    objective: string;
    challenges: string[];
  },
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  if (!openai) {
    // Return demo roleplay response
    const response = DEMO_RESPONSES.roleplay[roleplayResponseIndex % DEMO_RESPONSES.roleplay.length];
    roleplayResponseIndex++;
    return response;
  }

  try {
    const scenarioContext = `
SCENARIO: ${scenario.title}
YOUR ROLE: ${scenario.stakeholder}
CONTEXT: ${scenario.context}
REP'S OBJECTIVE: ${scenario.objective}
CHALLENGES TO PRESENT: ${scenario.challenges.join(", ")}

Stay in character as this stakeholder. Be realistic but not impossible to work with.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: ROLEPLAY_SYSTEM_PROMPT + "\n\n" + scenarioContext },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
      ],
      max_completion_tokens: 512,
    });

    return response.choices[0].message.content || "I don't have time for this meeting right now.";
  } catch (error: any) {
    console.error("OpenAI roleplay error:", error);
    throw new Error("Failed to get roleplay response. Please check your API key configuration.");
  }
}

export async function analyzeConversation(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{
  overallScore: number;
  eqMetrics: {
    empathy: number;
    activeListening: number;
    rapport: number;
    discAdaptation: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}> {
  if (!openai) {
    // Return demo analysis with clear indication this is demo mode
    const baseScore = 70 + Math.floor(Math.random() * 10);
    return {
      overallScore: baseScore,
      eqMetrics: {
        empathy: baseScore + Math.floor(Math.random() * 10) - 5,
        activeListening: baseScore + Math.floor(Math.random() * 10) - 5,
        rapport: baseScore + Math.floor(Math.random() * 10) - 5,
        discAdaptation: baseScore + Math.floor(Math.random() * 10) - 5,
      },
      strengths: [
        "[Demo Mode] Good use of open-ended questions",
        "[Demo Mode] Demonstrated active listening skills",
        "[Demo Mode] Showed appropriate clinical knowledge"
      ],
      improvements: [
        "[Demo Mode] Could acknowledge concerns more directly",
        "[Demo Mode] Try to mirror the stakeholder's communication style"
      ],
      recommendations: [
        "[Demo Mode] Practice the Feel-Felt-Found technique",
        "[Demo Mode] Review DISC adaptation strategies - Configure OpenAI API for personalized feedback"
      ]
    };
  }

  try {
    const analysisPrompt = `Analyze this pharma sales conversation and provide EQ feedback. Rate each metric 0-100.

Conversation:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}

Respond in JSON format:
{
  "overallScore": number,
  "eqMetrics": {
    "empathy": number,
    "activeListening": number,
    "rapport": number,
    "discAdaptation": number
  },
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "recommendations": ["rec1", "rec2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert sales coach analyzing pharma sales conversations for emotional intelligence. Provide constructive, specific feedback." },
        { role: "user", content: analysisPrompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 512,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No analysis generated");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze conversation. Please check your API key configuration.");
  }
}

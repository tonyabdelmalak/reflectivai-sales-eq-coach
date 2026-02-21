import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';

export default async function handler(req: Request, res: Response) {
  try {
    const { question, context = 'general' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Get GROQ API key from secrets
    const apiKey = getSecret('GROQ_API_KEY') as string;
    if (!apiKey) {
      console.error('GROQ_API_KEY not found in secrets');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Context-aware system prompts
    const systemPrompts: Record<string, string> = {
      modules: `You are a friendly AI coaching assistant helping sales professionals improve their skills. Help users:
- Understand training modules and how to use them
- Learn best practices for customer conversations
- Improve their sales techniques
- Interpret their performance scores

Be conversational, practical, and encouraging. Avoid jargon.`,
      
      help: `You are a helpful support assistant for ReflectivAI platform. Help users with:
- Navigation and features
- Technical questions
- Account and settings
- General platform guidance

Be friendly, clear, and solution-oriented.`,
      
      dashboard: `You are a friendly performance coach helping sales professionals improve. Help users:
- Understand their performance scores in plain language
- Identify specific areas to improve
- Set practical, achievable goals
- Celebrate their progress

Be encouraging, clear, and motivating. Avoid technical jargon.`,
      
      frameworks: `You are an expert sales coach specializing in behavioral frameworks and communication models for pharmaceutical sales.

CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no extra text.

When customizing templates:
1. Adapt the template to the specific situation described
2. Provide a concrete example of how to use it
3. Give 3 actionable tips for delivery

Response format (REQUIRED):
{"customizedTemplate": "the adapted template with specific details", "example": "a realistic dialogue example", "tips": ["specific tip 1", "specific tip 2", "specific tip 3"]}

When giving framework advice:
{"advice": "2-3 sentences of specific advice", "practiceExercise": "one practical exercise", "tips": ["tip 1", "tip 2", "tip 3"]}

Focus on pharma sales contexts with HCPs (healthcare professionals).`,
      
      general: `You are a friendly AI assistant for ReflectivAI, a sales training platform. Help users with:
- Understanding the platform and its features
- Training and skill development
- Improving their sales performance
- Any questions they have

Be helpful, conversational, and easy to understand. Avoid jargon.`
    };

    const systemPrompt = systemPrompts[context] || systemPrompts.general;

    // Call GROQ API
    const requestBody: any = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    // Enable JSON mode for frameworks context
    if (context === 'frameworks') {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROQ API error:', response.status, errorText);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    let answer = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    // CRITICAL: Filter out any system prompts that leak through
    // Check if response contains system prompt indicators
    const systemPromptIndicators = [
      'You are an AI',
      'You are a',
      'CRITICAL:',
      'Response format',
      'role: system',
      'system prompt',
      'When customizing templates:',
      'When giving framework advice:'
    ];

    const containsSystemPrompt = systemPromptIndicators.some(indicator => 
      answer.toLowerCase().includes(indicator.toLowerCase())
    );

    if (containsSystemPrompt) {
      console.error('System prompt leaked in response, filtering...');
      answer = 'I apologize, but I encountered an error processing your request. Could you please rephrase your question?';
    }

    res.json({
      answer,
      context,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Coach error:', error);
    res.status(500).json({ error: 'Failed to process request', message: String(error) });
  }
}
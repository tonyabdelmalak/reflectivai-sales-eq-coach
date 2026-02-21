import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  try {
    // User-friendly conversation starters - NO JARGON
    const conversationStarters = [
      "How can I better understand what motivates healthcare providers in my territory?",
      "What are effective ways to handle objections about clinical evidence?",
      "Help me prepare for a conversation with a skeptical physician",
      "What techniques can I use to read HCP engagement during conversations?",
      "How do I adapt my communication style to different types of healthcare providers?",
      "What's the best way to build trust with busy clinicians?",
      "How can I improve my discovery questions to uncover real needs?",
      "What should I do when an HCP seems disengaged during our conversation?"
    ];

    // User-friendly suggested topics - NO JARGON
    const suggestedTopics = [
      "Building rapport with busy clinicians",
      "Handling objections with confidence",
      "Reading non-verbal cues in conversations",
      "Adapting to different communication styles",
      "Following up effectively after meetings",
      "Asking better discovery questions",
      "Connecting clinical evidence to patient outcomes",
      "Managing difficult conversations"
    ];

    // Randomly select 5 starters and 5 topics for variety
    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    res.json({
      conversationStarters: shuffleArray(conversationStarters).slice(0, 5),
      suggestedTopics: shuffleArray(suggestedTopics).slice(0, 5)
    });
  } catch (error) {
    console.error('Error generating coach prompts:', error);
    res.status(500).json({ 
      error: 'Failed to generate prompts', 
      message: String(error) 
    });
  }
}

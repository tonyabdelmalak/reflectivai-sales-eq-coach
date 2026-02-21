import type { Request, Response } from 'express';

const focusTopics = [
  {
    title: "Master Active Listening",
    focus: "Today, practice truly hearing what HCPs say—not just waiting for your turn to speak. Listen for underlying concerns, not just surface-level objections.",
    microTask: "In your next conversation, repeat back what you heard before responding.",
    reflection: "At the end of the day, ask yourself: What did I learn that I wouldn't have heard if I was just waiting to talk?"
  },
  {
    title: "Elevate Your Questions",
    focus: "Great questions unlock insights. Today, focus on asking open-ended questions that help HCPs articulate their real needs and challenges.",
    microTask: "Replace one 'yes/no' question with an open-ended alternative in each conversation.",
    reflection: "Which question led to the most valuable insight today? Why did it work?"
  },
  {
    title: "Navigate Objections with Grace",
    focus: "Objections aren't roadblocks—they're invitations to understand deeper concerns. Today, welcome objections as opportunities to build trust.",
    microTask: "When you hear an objection, pause and ask: 'Can you help me understand what's behind that concern?'",
    reflection: "What did you learn from today's objections that you can use to improve future conversations?"
  },
  {
    title: "Deepen Clinical Credibility",
    focus: "Your clinical knowledge is your foundation. Today, find one opportunity to reference recent data or clinical insights that add value to the conversation.",
    microTask: "Review one recent study or clinical update before your first meeting.",
    reflection: "How did bringing clinical evidence change the tone or direction of your conversation?"
  },
  {
    title: "Build Authentic Rapport",
    focus: "Trust is built through genuine connection, not scripted small talk. Today, focus on finding common ground and showing authentic interest in the HCP as a person.",
    microTask: "Ask one personal question (appropriate to context) that shows you see them as more than a target.",
    reflection: "What did you learn about your conversation partner today that you didn't know before?"
  },
  {
    title: "Practice Adaptive Flexibility",
    focus: "No two conversations are the same. Today, practice reading signals and adjusting your approach in real-time based on what you observe.",
    microTask: "Notice one signal (tone, body language, word choice) and consciously adjust your approach.",
    reflection: "What signal did you notice today, and how did adapting to it change the outcome?"
  },
  {
    title: "Sharpen Signal Detection",
    focus: "The best reps notice what others miss. Today, pay attention to subtle cues—hesitations, word choices, energy shifts—that reveal what's really going on.",
    microTask: "In one conversation, focus entirely on observing signals before you start problem-solving.",
    reflection: "What signal did you almost miss? What would have happened if you had missed it?"
  },
  {
    title: "Understand Stakeholder Priorities",
    focus: "Different stakeholders care about different things. Today, focus on understanding what truly matters to each person you speak with—not what you assume matters.",
    microTask: "Ask one question specifically designed to uncover what drives this stakeholder's decisions.",
    reflection: "What surprised you about what this stakeholder actually cares about?"
  }
];

export default async function handler(req: Request, res: Response) {
  try {
    // Get today's date and use it to deterministically select a focus
    // This ensures the same focus is returned for the entire day
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const focusIndex = dayOfYear % focusTopics.length;
    
    const dailyFocus = focusTopics[focusIndex];

    res.json(dailyFocus);
  } catch (error) {
    console.error('Error generating daily focus:', error);
    res.status(500).json({ 
      error: 'Failed to generate daily focus', 
      message: String(error) 
    });
  }
}

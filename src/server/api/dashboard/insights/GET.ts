import type { Request, Response } from 'express';

const motivationalQuotes = [
  "Success in sales comes from understanding needs, not pushing products.",
  "Every conversation is an opportunity to learn and build trust.",
  "The best sales professionals are great listeners first, talkers second.",
  "Empathy is your most powerful tool in healthcare sales.",
  "Questions reveal needs; solutions build relationships.",
  "Your ability to adapt determines your success with diverse stakeholders.",
  "Clinical knowledge opens doors; emotional intelligence keeps them open.",
  "In healthcare sales, patience and persistence win over pressure.",
  "The most effective reps focus on patient outcomes, not quotas.",
  "Trust is built one authentic conversation at a time.",
  "Signal intelligence means reading between the lines of every interaction.",
  "Your success is measured by the value you bring, not the pitch you deliver.",
  "Great sales conversations feel like partnerships, not transactions.",
  "The best objection handlers never make it feel like an objection.",
  "In life sciences, credibility is earned through knowledge and humility.",
  "Every 'no' is data that helps you refine your approach.",
  "The most impactful reps make HCPs feel heard and understood.",
  "Your ability to navigate complexity separates you from the competition.",
  "In healthcare, relationships are built on respect and clinical relevance.",
  "The best sales professionals are continuous learners."
];

const focusAreas = [
  "Active Listening",
  "Question Quality",
  "Objection Handling",
  "Clinical Knowledge",
  "Empathy & Rapport",
  "Adaptability",
  "Signal Detection",
  "Stakeholder Engagement"
];

const exercises = [
  {
    title: "Deep Listening Practice",
    description: "Focus on understanding HCP concerns before responding. Practice reflecting back what you hear."
  },
  {
    title: "Question Framework Drill",
    description: "Practice asking open-ended questions that uncover underlying needs and motivations."
  },
  {
    title: "Objection Reframing",
    description: "Transform objections into opportunities by acknowledging concerns and exploring root causes."
  },
  {
    title: "Clinical Scenario Review",
    description: "Study recent clinical data and practice translating it into patient-centered benefits."
  },
  {
    title: "Empathy Mapping",
    description: "Put yourself in the HCP's shoes. What pressures, goals, and concerns drive their decisions?"
  },
  {
    title: "Adaptive Response Practice",
    description: "Practice pivoting your approach based on real-time signals from your conversation partner."
  },
  {
    title: "Signal Recognition Drill",
    description: "Review past conversations and identify missed signals. What could you have noticed earlier?"
  },
  {
    title: "Stakeholder Persona Study",
    description: "Deep dive into a specific HCP type. What matters most to them? How do they make decisions?"
  }
];

const dailyTips = [
  "Start every conversation by asking about the HCP's current challenges.",
  "Use the 80/20 rule: Listen 80% of the time, speak 20%.",
  "When you hear resistance, pause and ask a clarifying question.",
  "Reference recent clinical data to build credibility early.",
  "Mirror the HCP's communication style to build rapport naturally.",
  "Take notes during conversations to show you value their input.",
  "Follow up on previous conversations to demonstrate continuity.",
  "Practice your opening 30 seconds until it feels natural and confident.",
  "End every interaction with a clear next step or action item.",
  "Review your day's conversations and identify one thing to improve tomorrow."
];

export default async function handler(req: Request, res: Response) {
  try {
    // Generate random insights
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    const randomFocusArea = focusAreas[Math.floor(Math.random() * focusAreas.length)];
    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
    const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

    const insights = {
      motivationalQuote: randomQuote,
      focusArea: randomFocusArea,
      suggestedExercise: randomExercise,
      dailyTip: randomTip
    };

    res.json(insights);
  } catch (error) {
    console.error('Error generating dashboard insights:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights', 
      message: String(error) 
    });
  }
}

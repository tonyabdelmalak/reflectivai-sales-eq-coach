/**
 * SIGNAL INTELLIGENCE GOVERNANCE CONSTANTS
 * 
 * Single source of truth for all governance-compliant language
 * across the ReflectivAI platform.
 */

export const SIGNAL_INTELLIGENCE_DEFINITIONS = {
  canonical: "Signal Intelligence is ReflectivAI's behavior based capability framework for developing professional judgment in high-stakes conversations. It enables people to recognize meaningful shifts in behavior and context and respond in ways that preserve credibility, trust, and access. AI supports this process by highlighting patterns rather than making decisions.",
  governanceForward: "Signal Intelligence is a behavior-based capability framework for developing conversational skills, using AI to surface observable patterns in interaction while preserving human judgment, agency, and accountability.",
  plainLanguage: "In practice, Signal Intelligence helps people build stronger conversational skills by focusing on observable behaviors—what people say, how they respond, and how they adapt in real time.",
  hero: {
    title: "SIGNAL INTELLIGENCE",
    tagline: "Human judgment, made visible.",
    subtitle: "AI, responsibly applied.",
    description: "Signal Intelligence helps professionals recognize what is changing in a conversation and respond in ways that preserve trust, credibility, and access.",
    features: "Behavior-based • Human-in-the-loop by design",
  },
} as const;

export const CAPABILITIES = [
  {
    id: "signal-awareness",
    name: "Signal Awareness",
    group: "Signal Sensemaking",
    definition: "Recognizing observable shifts in customer behavior, tone, or engagement during conversations.",
    behavioralMetric: "Signal Detection Rate",
    whatThisLooksLike: [
      "Noticing when a customer shifts from asking about features to asking about implementation",
      "Detecting changes in tone or engagement level during the conversation",
      "Recognizing patterns in how customers respond to different types of questions",
    ],
    whatThisIsNot: [
      "Not making assumptions about customer emotions or intent",
      "Not reading minds or inferring hidden meanings",
      "Not outcome-based scoring of sales success",
    ],
  },
  {
    id: "value-communication",
    name: "Value Communication",
    group: "Customer Engagement",
    definition: "Connecting product capabilities to customer needs in ways that resonate.",
    behavioralMetric: "Value Alignment Score",
    whatThisLooksLike: [
      "Linking features to specific customer challenges mentioned in the conversation",
      "Using customer language when describing solutions",
      "Demonstrating understanding of customer priorities",
    ],
    whatThisIsNot: [
      "Not generic feature dumping",
      "Not pressuring for premature commitments",
      "Not manipulating customer decisions",
    ],
  },
  {
    id: "engagement-detection",
    name: "Engagement Detection",
    group: "Signal Sensemaking",
    definition: "Identifying moments of increased or decreased customer interest.",
    behavioralMetric: "Engagement Recognition Rate",
    whatThisLooksLike: [
      "Noticing when customers ask follow-up questions",
      "Detecting when customers become more specific in their questions",
      "Recognizing when conversation energy shifts",
    ],
    whatThisIsNot: [
      "Not assuming engagement equals buying intent",
      "Not confusing politeness with genuine interest",
      "Not outcome-based scoring of sales success",
    ],
  },
  {
    id: "objection-handling",
    name: "Objection Handling",
    group: "Customer Engagement",
    definition: "Addressing customer concerns while maintaining trust and credibility.",
    behavioralMetric: "Objection Response Quality",
    whatThisLooksLike: [
      "Acknowledging concerns before responding",
      "Asking clarifying questions to understand the root concern",
      "Providing relevant information without being defensive",
    ],
    whatThisIsNot: [
      "Not dismissing or minimizing customer concerns",
      "Not using manipulative reframing techniques",
      "Not pressuring customers past legitimate concerns",
    ],
  },
  {
    id: "conversation-management",
    name: "Conversation Management",
    group: "Conversation Structure",
    definition: "Guiding conversations productively while respecting customer agency.",
    behavioralMetric: "Conversation Flow Score",
    whatThisLooksLike: [
      "Transitioning smoothly between topics",
      "Keeping conversations focused on customer priorities",
      "Balancing structure with flexibility",
    ],
    whatThisIsNot: [
      "Not controlling or dominating the conversation",
      "Not following rigid scripts regardless of customer needs",
      "Not outcome-based scoring of sales success",
    ],
  },
  {
    id: "commitment-gaining",
    name: "Commitment Gaining",
    group: "Conversation Structure",
    definition: "Moving conversations toward clear next steps when appropriate.",
    behavioralMetric: "Commitment Gaining",
    whatThisLooksLike: [
      "Proposing specific next steps based on conversation context",
      "Confirming mutual understanding before suggesting actions",
      "Respecting customer timeline and decision-making process",
    ],
    whatThisIsNot: [
      "Not pressuring for premature commitments",
      "Not manipulating customer decisions",
      "Not outcome-based scoring of sales success",
    ],
  },
  {
    id: "adaptive-response",
    name: "Adaptive Response",
    group: "Signal Sensemaking",
    definition: "Adjusting approach based on customer signals and conversation context.",
    behavioralMetric: "Adaptability Score",
    whatThisLooksLike: [
      "Changing questioning approach when current approach is not working",
      "Adjusting pace based on customer engagement",
      "Modifying explanations based on customer feedback",
    ],
    whatThisIsNot: [
      "Not abandoning professional standards",
      "Not being inconsistent or unpredictable",
      "Not outcome-based scoring of sales success",
    ],
  },
] as const;

export const ETHICAL_BOUNDARY = "If a response would feel inappropriate if the roles were reversed, it is outside the Signal Intelligence boundary." as const;

export const MICROCOPY = {
  todayPanel: {
    title: "Today's Focus",
    subtitle: "Professional judgment in high-stakes conversations",
    whyThisMatters: "Building capability in recognizing meaningful shifts in behavior and context",
    headerFraming: "Your daily operating context for Signal Intelligence practice",
    aiGuidanceReminder: "AI highlights patterns to guide attention. You apply judgment.",
  },
  workflows: {
    aiCoach: {
      title: "AI Coach",
      description: "Personalized coaching feedback based on observable behaviors",
      capability: "Practice all capabilities",
      whyItMattersToday: "Get AI-supported feedback on your conversation patterns and judgment moments",
      supportedCapabilities: ["All Signal Intelligence capabilities"],
    },
    roleplay: {
      title: "Role Play",
      description: "Practice conversations with AI-simulated healthcare professionals",
      capability: "Signal Awareness, Engagement Detection, Adaptive Response",
      whyItMattersToday: "Build muscle memory for recognizing and responding to customer signals in real-time",
      supportedCapabilities: [
        "Signal Awareness",
        "Engagement Detection",
        "Value Communication",
        "Objection Handling",
        "Conversation Management",
        "Action Orientation",
        "Adaptive Response",
      ],
    },
    exercises: {
      title: "Exercises",
      description: "Structured practice for specific Signal Intelligence capabilities",
      capability: "Targeted capability development",
      whyItMattersToday: "Develop specific skills through focused, deliberate practice",
      supportedCapabilities: [
        "Signal Awareness",
        "Value Communication",
        "Engagement Detection",
        "Objection Handling",
      ],
    },
  },
  skillDevelopment: {
    progressLabels: {
      notStarted: "Not Started",
      inProgress: "In Progress",
      completed: "Completed",
    },
    filterLabels: {
      capabilityGroup: "Capability Group",
      capability: "Capability",
    },
  },
  governancePanel: {
    ethicalBoundary: "If a response would feel inappropriate if the roles were reversed, it is outside the Signal Intelligence boundary.",
    signalsReminder: "Signal Intelligence focuses on observable behaviors, not assumptions about emotions, intent, or competence.",
    whatSignalIntelligenceIsNot: [
      "Not emotional intelligence or sentiment analysis",
      "Not personality profiling or psychological assessment",
      "Not manipulation or persuasion techniques",
      "Not outcome-based scoring of sales success",
      "Not a replacement for human judgment and decision-making",
    ],
  },
} as const;

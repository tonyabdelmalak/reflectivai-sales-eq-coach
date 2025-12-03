import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getChatResponse, translateToSql, getRoleplayResponse, analyzeConversation, isOpenAIConfigured } from "./openai";

// Scenario data (should match frontend)
const scenarios = [
  {
    id: "onc-kol",
    title: "Oncology KOL Introduction",
    stakeholder: "Dr. Sarah Chen, MD - Medical Oncologist, Cancer Center Director",
    context: "Dr. Chen is highly published in HER2+ breast cancer. She's skeptical of new therapies without robust long-term data. Her time is extremely limited.",
    objective: "Establish credibility and schedule a follow-up meeting to discuss clinical data",
    challenges: [
      "Limited time window (15 minutes)",
      "High skepticism toward pharma reps",
      "Demands peer-reviewed evidence",
      "Already loyal to competitor product"
    ],
  },
  {
    id: "card-formulary",
    title: "Cardiology Formulary Review",
    stakeholder: "Hospital P&T Committee - 8 members including pharmacists, physicians, and administrators",
    context: "The hospital is cost-conscious but values clinical outcomes. Current standard of care is well-established. Your drug offers incremental benefit at higher cost.",
    objective: "Gain preferred formulary status for your heart failure medication",
    challenges: [
      "Price premium over existing options",
      "Limited real-world evidence",
      "Need pharmacoeconomic justification",
      "Competing presentation from rival company"
    ],
  },
  {
    id: "neuro-access",
    title: "Neurology Market Access",
    stakeholder: "Dr. James Miller - Medical Director, Regional Health Plan",
    context: "The payer has strict utilization management. Your therapy is second-line due to cost. Physicians are frustrated with approval delays.",
    objective: "Reduce prior authorization barriers for your multiple sclerosis therapy",
    challenges: [
      "Strict step-therapy requirements",
      "Focus on cost containment",
      "Limited meeting time",
      "Competing therapies on formulary"
    ],
  },
  {
    id: "immuno-launch",
    title: "Immunology New Product Launch",
    stakeholder: "Dr. Maria Rodriguez - Rheumatologist, Private Practice",
    context: "The practice sees many rheumatoid arthritis patients. They're familiar with existing biologics. Your product offers a novel mechanism with good safety data.",
    objective: "Secure commitment to trial the new therapy with appropriate patients",
    challenges: [
      "Comfort with existing therapies",
      "Concern about switching stable patients",
      "Questions about insurance coverage",
      "Limited office visit time"
    ],
  },
  {
    id: "rare-diagnosis",
    title: "Rare Disease Diagnosis Journey",
    stakeholder: "Dr. Patricia Lee - Pediatric Geneticist, Academic Medical Center",
    context: "The condition affects 1 in 50,000 patients. Average time to diagnosis is 5 years. Your company offers the only approved treatment.",
    objective: "Increase awareness of disease symptoms and diagnostic pathway",
    challenges: [
      "Low disease awareness",
      "Complex diagnostic workup",
      "Limited patient population",
      "Academic skepticism"
    ],
  }
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // API key status endpoint
  app.get("/api/status", async (req, res) => {
    res.json({
      openaiConfigured: isOpenAIConfigured(),
      message: isOpenAIConfigured() 
        ? "AI features are fully enabled" 
        : "AI features are in demo mode. Add your OpenAI API key for full functionality."
    });
  });

  // Chat endpoints
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Content is required" });
      }

      // Add user message
      const userMessage = await storage.addMessage({
        role: "user",
        content,
        timestamp: Date.now(),
      });

      // Get all messages for context
      const allMessages = await storage.getMessages();
      const chatHistory = allMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Get AI response
      const aiContent = await getChatResponse(chatHistory);

      // Add AI response
      const aiMessage = await storage.addMessage({
        role: "assistant",
        content: aiContent,
        timestamp: Date.now(),
      });

      res.json({ userMessage, aiMessage });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat/clear", async (req, res) => {
    try {
      await storage.clearMessages();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SQL translation endpoints
  app.get("/api/sql/history", async (req, res) => {
    try {
      const queries = await storage.getSqlQueries();
      res.json(queries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sql/translate", async (req, res) => {
    try {
      const { naturalLanguage } = req.body;
      if (!naturalLanguage || typeof naturalLanguage !== "string") {
        return res.status(400).json({ error: "naturalLanguage is required" });
      }

      const { sql, explanation } = await translateToSql(naturalLanguage);

      const query = await storage.addSqlQuery({
        naturalLanguage,
        sqlQuery: sql,
        explanation,
        timestamp: Date.now(),
      });

      res.json(query);
    } catch (error: any) {
      console.error("SQL translation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Roleplay endpoints
  app.get("/api/roleplay/session", async (req, res) => {
    try {
      const session = await storage.getRoleplaySession();
      res.json(session || { messages: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/roleplay/start", async (req, res) => {
    try {
      const { scenarioId } = req.body;
      if (!scenarioId) {
        return res.status(400).json({ error: "scenarioId is required" });
      }

      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }

      await storage.startRoleplaySession(scenarioId);

      // Get initial stakeholder greeting
      const initialMessage = await getRoleplayResponse(scenario, []);
      
      await storage.addRoleplayMessage({
        role: "assistant",
        content: initialMessage,
        timestamp: Date.now(),
      });

      const session = await storage.getRoleplaySession();
      res.json(session);
    } catch (error: any) {
      console.error("Roleplay start error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/roleplay/respond", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "content is required" });
      }

      const session = await storage.getRoleplaySession();
      if (!session || !session.scenarioId) {
        return res.status(400).json({ error: "No active roleplay session" });
      }

      const scenario = scenarios.find(s => s.id === session.scenarioId);
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }

      // Add user message
      await storage.addRoleplayMessage({
        role: "user",
        content,
        timestamp: Date.now(),
      });

      // Get updated session with all messages
      const updatedSession = await storage.getRoleplaySession();
      const chatHistory = updatedSession?.messages.map(m => ({
        role: m.role,
        content: m.content,
      })) || [];

      // Get stakeholder response
      const stakeholderResponse = await getRoleplayResponse(scenario, chatHistory);

      await storage.addRoleplayMessage({
        role: "assistant",
        content: stakeholderResponse,
        timestamp: Date.now(),
      });

      // Get live analysis
      const finalSession = await storage.getRoleplaySession();
      const allMessages = finalSession?.messages.map(m => ({
        role: m.role,
        content: m.content,
      })) || [];

      let analysis = null;
      if (allMessages.length >= 4) {
        analysis = await analyzeConversation(allMessages);
      }

      res.json({ 
        messages: finalSession?.messages || [],
        analysis 
      });
    } catch (error: any) {
      console.error("Roleplay respond error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/roleplay/end", async (req, res) => {
    try {
      const session = await storage.getRoleplaySession();
      if (!session) {
        return res.status(400).json({ error: "No active roleplay session" });
      }

      const messages = session.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const analysis = await analyzeConversation(messages);
      
      res.json({ 
        messages: session.messages,
        analysis 
      });
    } catch (error: any) {
      console.error("Roleplay end error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

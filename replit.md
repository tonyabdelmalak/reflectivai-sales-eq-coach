# SalesEQ Coach - AI Sales Enablement for Life Sciences

## Overview
SalesEQ Coach is an AI-powered Sales Enablement platform designed specifically for Life Sciences, Biotech, and Pharmaceutical sales professionals. It combines emotional intelligence frameworks with practical sales coaching to help reps master the art of healthcare stakeholder engagement.

## Core Features

### 1. AI Sales Coach (Chat)
- Real-time AI coaching powered by OpenAI GPT-5
- Context-aware responses for pharma sales situations
- Personalized feedback on sales techniques
- EQ framework suggestions integrated into responses

### 2. Role-Play Simulator
- Realistic pharma sales scenarios (Oncology, Cardiology, Neurology, Immunology, Rare Disease)
- Interactive stakeholder conversations with AI-powered responses
- Real-time EQ analysis during role-plays
- Difficulty levels: Beginner, Intermediate, Advanced

### 3. SQL Query Translator
- Natural language to SQL conversion for sales data analysis
- Pre-built schema for pharma sales databases
- Query history tracking
- Example questions for quick starts

### 4. Emotional Intelligence Frameworks
- **DISC Model**: Behavioral style adaptation for different stakeholder types
- **Active Listening**: Deep listening techniques for understanding needs
- **Empathy Mapping**: Understanding stakeholder perspectives
- **Rapport Building**: Techniques for building trusted relationships

### 5. Coaching Modules
- Discovery Questions Mastery
- Stakeholder Mapping
- Clinical Evidence Communication
- Objection Handling
- Closing Techniques
- EQ Mastery for Pharma

### 6. Heuristic Language Templates
- Objection handling patterns (Feel-Felt-Found, Acknowledge-Bridge-Close)
- Value proposition frameworks
- Closing techniques
- Discovery question templates
- Rapport building phrases

### 7. Knowledge Base
- FDA regulatory information
- Clinical trial design fundamentals
- HIPAA compliance guidelines
- HCP engagement best practices
- Market access and payer dynamics
- Drug pricing and transparency

## Technical Architecture

### Frontend
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Tailwind CSS with Shadcn UI components
- Dark/Light theme support

### Backend
- Express.js server
- OpenAI GPT-5 integration for AI features
- In-memory storage (MemStorage) for sessions
- RESTful API design

### Key Files
- `client/src/App.tsx` - Main application with routing and layout
- `client/src/pages/` - Page components for each feature
- `client/src/lib/data.ts` - Static data for frameworks, modules, scenarios
- `server/routes.ts` - API endpoints
- `server/openai.ts` - OpenAI integration with demo fallbacks
- `server/storage.ts` - In-memory data storage
- `shared/schema.ts` - TypeScript schemas and types

## API Endpoints

### Chat
- `GET /api/chat/messages` - Get chat history
- `POST /api/chat/send` - Send message and get AI response
- `POST /api/chat/clear` - Clear chat history

### SQL Translation
- `GET /api/sql/history` - Get query history
- `POST /api/sql/translate` - Translate natural language to SQL

### Role-Play
- `GET /api/roleplay/session` - Get current session
- `POST /api/roleplay/start` - Start new scenario
- `POST /api/roleplay/respond` - Send response in role-play
- `POST /api/roleplay/end` - End session and get analysis

### Status
- `GET /api/status` - Check OpenAI API key configuration

## Environment Variables
- `OPENAI_API_KEY` (optional) - Enables full AI features. Without it, app runs in demo mode with sample responses.

## Demo Mode
When OpenAI API key is not configured:
- "Demo Mode" badge shown in header
- AI responses prefixed with "[Demo Mode]"
- Sample pharma sales coaching content provided
- All features remain functional with placeholder AI responses

## Development
```bash
npm run dev  # Start development server
```

The application runs on port 5000 with hot reload enabled.

## Recent Changes
- Initial MVP build with all core features
- Demo mode implementation for API key-free usage
- Comprehensive EQ framework integration
- Industry-specific knowledge base
- Role-play scenarios for major therapeutic areas

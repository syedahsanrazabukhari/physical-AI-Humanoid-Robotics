# RAG Chatbot Architecture & Setup Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Frontend)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Docusaurus Site (Port 3000)                         │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Chat Page (chat.tsx)                          │  │  │
│  │  │  └─ Floating Chat Component (FloatingChat.tsx) │  │  │
│  │  │     └─ User Input → API Call                   │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↓ HTTP Request (JSON)                           │
└─────────────────────────────────────────────────────────────┘
         POST /api/chat
              ↓
┌─────────────────────────────────────────────────────────────┐
│              SERVER (Backend - Express.js)                   │
│              Port 3001 (server.js)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Handler (api/chat.ts)                           │  │
│  │  ├─ Request validation                               │  │
│  │  ├─ Error handling (OpenAI key, DB status)          │  │
│  │  └─ Call RAG Chatbot                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↓                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  RAG Chatbot (lib/ragChatbot.ts)                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ 1. Generate Query Embedding                  │   │  │
│  │  │    User Query → OpenAI embeddings → Vector   │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                ↓                                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ 2. Retrieve Relevant Documents               │   │  │
│  │  │    Vector Query → ChromaDB → Top 5 chunks    │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                ↓                                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ 3. Generate Response                         │   │  │
│  │  │    Query + Context → OpenAI GPT → Answer     │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         HTTP Response (JSON with answer)
              ↓
┌─────────────────────────────────────────────────────────────┐
│              BROWSER (Display Result)                        │
│  Shows: Answer + Source Documents + Loading State           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Data Flow

```
Documentation Files (docs/, blog/)
    ↓ [Read & Parse]
Plain Text Chunks
    ↓ [Split into 1000 char chunks]
Text Chunks (with overlap)
    ↓ [Generate Embeddings]
Vector Embeddings (OpenAI text-embedding-ada-002)
    ↓ [Store]
ChromaDB Vector Database (.chroma/)
    ↓ [Query on user input]
Relevant Document Chunks
    ↓ [Context + Question]
GPT-4 Prompt
    ↓ [Generate]
AI Response with Sources
    ↓ [Display]
User sees answer + citations
```

---

## 📋 Setup Process Flow

```
START
  ↓
Is .env file present?
├─ NO → Copy .env.example → .env (user edits)
└─ YES
  ↓
Is OPENAI_API_KEY set?
├─ NO → Show error, exit
└─ YES
  ↓
Are dependencies installed?
├─ NO → npm install
└─ YES
  ↓
Is ChromaDB initialized?
├─ NO → npm run setup-vector-db
│       ├─ Read all .md/.mdx files
│       ├─ Split into chunks
│       ├─ Generate embeddings
│       └─ Store in .chroma/
└─ YES
  ↓
npm run dev
├─ Start Docusaurus (port 3000)
├─ Start Express (port 3001)
└─ Ready for chat!
```

---

## 🔄 Error Handling Flow

```
User Sends Message
    ↓
Try/Catch Block
    ↓
    ├─ No .env? → "OpenAI API key not configured"
    ├─ Invalid key? → "Invalid OpenAI API key"
    ├─ No DB? → "Vector database not initialized"
    ├─ API down? → "Failed to connect to OpenAI"
    ├─ Network error? → Specific network message
    └─ Unknown? → "Internal server error: [details]"
    ↓
Display Error to User with Solution
```

---

## 🛠️ Directory Structure

```
Physical-AI-Humanoid-Robotics/
├── SETUP.ps1 ............................ ⭐ Automated setup (Windows)
├── SETUP.bat ............................ ⭐ Automated setup (Windows)
├── SETUP.sh ............................. ⭐ Automated setup (Unix)
├── GETTING_STARTED.md ................... ⭐ Quick start guide
├── SETUP_TROUBLESHOOTING.md ............. ⭐ Troubleshooting guide
├── QUICK_REFERENCE.md ................... ⭐ Command reference
├── FIX_SUMMARY.txt ...................... ⭐ This fix summary
│
└── my-book/
    ├── .env.example ..................... API key template
    ├── .env ⭐ .......................... (Create after SETUP)
    ├── .chroma/ ⭐ ...................... (Created by setup-vector-db)
    ├── server.js ........................ Express server
    ├── docusaurus.config.ts ............ Site config
    ├── package.json ..................... Dependencies
    │
    ├── api/
    │   └── chat.ts ⭐ .................. Enhanced error handling
    │
    ├── src/
    │   ├── components/
    │   │   └── FloatingChat.tsx ⭐ .... Better error display
    │   ├── lib/
    │   │   └── ragChatbot.ts .......... RAG logic
    │   ├── pages/
    │   │   ├── chat.tsx ⭐ ........... Better error display
    │   │   └── index.tsx ............ Homepage
    │   └── css/
    │
    ├── scripts/
    │   └── setup-vector-db.ts ........ Vector DB initialization
    │
    ├── docs/ .......................... Documentation markdown
    ├── blog/ .......................... Blog posts
    └── static/ ........................ Static assets

⭐ = Files created or modified in this fix
```

---

## 🔗 Communication Protocols

### Client → Server
```
POST /api/chat
Content-Type: application/json

{
  "message": "What is humanoid robotics?",
  "conversationHistory": [
    {
      "role": "assistant",
      "content": "Hi! I'm your AI assistant..."
    }
  ]
}
```

### Server → Client (Success)
```json
{
  "response": "Humanoid robotics is...",
  "relevantDocs": ["Chunk 1", "Chunk 2"],
  "sources": ["docs/intro.md", "docs/robotics-basics.md"]
}
```

### Server → Client (Error)
```json
{
  "error": "Vector database not initialized",
  "message": "ChromaDB collection not found",
  "details": "Run 'npm run setup-vector-db' to initialize the database"
}
```

---

## ⚙️ Configuration

### Environment Variables (.env)
```env
OPENAI_API_KEY=sk-proj-xxxxx...  # From platform.openai.com
```

### Optional Configurations
```env
PORT=3001                          # Express server port
NODE_ENV=development               # or 'production'
DOCUSAURUS_PORT=3000              # Docusaurus port
```

---

## 📱 Component Hierarchy

```
App
├── Homepage (index.tsx)
│   └── Features Section
├── Chat Page (chat.tsx)
│   ├── Chat Header
│   ├── Messages Container
│   │   ├── Message (assistant)
│   │   ├── Message (user)
│   │   └── Message (with sources)
│   └── Input Form
└── Floating Chat Button
    └── FloatingChat (FloatingChat.tsx)
        ├── Chat Button (circular)
        ├── Chat Popup (if open)
        │   ├── Popup Header
        │   ├── Messages Container
        │   ├── Input Form
        │   └── Error Display
        └── Badge (message count)
```

---

## 🔐 Security Model

```
User Browser
    ↓
HTTPS/CORS Protected Endpoint
    ↓
Input Validation
    ├─ Check message exists
    ├─ Check type is string
    └─ Limit length
    ↓
Environment Variables (never exposed)
    ├─ OPENAI_API_KEY (server-side only)
    ├─ Never sent to client
    └─ Read from process.env
    ↓
API Calls (server-to-server)
    ├─ To OpenAI (encrypted)
    ├─ From database (local)
    └─ No direct browser access
    ↓
Response Sanitization
    ├─ No sensitive data in response
    ├─ Only include answer + sources
    └─ Error details controlled
```

---

## 📊 Performance Path

```
User Question
├─ 0-100ms: Validation
├─ 0-50ms: Generate embedding (concurrent)
├─ 1-3s: Retrieve from ChromaDB
├─ 0-500ms: Format prompt
├─ 2-10s: OpenAI API call (slow)
├─ 0-100ms: Format response
└─ 0-50ms: Send to client

Total: ~3-15 seconds typical
Most time: OpenAI API (unavoidable)
```

---

## 🎯 Feature Comparison

### Before This Fix
```
❌ Generic error messages
❌ Manual setup procedure
❌ No troubleshooting guide
❌ Users stuck and confused
```

### After This Fix
```
✅ Specific error messages
✅ Automated setup scripts
✅ Comprehensive troubleshooting
✅ Users guided to solutions
```

---

## 🚀 Deployment Architecture

### Development
```
Localhost (Your PC)
├─ Docusaurus: http://localhost:3000
├─ Express API: http://localhost:3001
├─ ChromaDB: .chroma/ (local)
└─ Node env: development
```

### Production
```
Server (Vercel / AWS / Self-hosted)
├─ Docusaurus: Static HTML (CDN)
├─ Express API: Deployed service
├─ ChromaDB: Persistent storage
└─ Node env: production
```

---

**Diagram Last Updated:** December 19, 2025  
**Purpose:** Understand system architecture and data flow

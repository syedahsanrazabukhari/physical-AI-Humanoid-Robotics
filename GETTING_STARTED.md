# 🤖 Physical AI & Humanoid Robotics - RAG Chatbot

A Retrieval-Augmented Generation (RAG) chatbot built with Docusaurus, OpenAI, and ChromaDB for interactive Q&A about robotics documentation.

## 🚀 Quick Start (30 seconds)

### Windows PowerShell
```powershell
.\SETUP.ps1
```

### Windows CMD
```cmd
SETUP.bat
```

### macOS/Linux
```bash
bash SETUP.sh  # (or follow manual steps below)
```

---

## ⚡ Manual Setup (3 minutes)

### 1️⃣ Environment Configuration
```bash
cd my-book
cp .env.example .env
```

Edit `.env` and add your [OpenAI API key](https://platform.openai.com/api-keys):
```env
OPENAI_API_KEY=sk-proj-xxxxx...
```

### 2️⃣ Initialize Vector Database
```bash
npm install
npm run setup-vector-db
```

⏱️ **Time estimate:** 5-15 minutes  
💾 **Storage:** ~500MB for ChromaDB

### 3️⃣ Start Development Servers
```bash
npm run dev
```

Visit: http://localhost:3000/chat

---

## 🛠️ What's Included

| Component | Purpose |
|-----------|---------|
| **Docusaurus 3.9** | Static documentation site |
| **OpenAI API** | GPT-4 responses + embeddings |
| **ChromaDB** | Vector database for similarity search |
| **Express.js** | REST API backend |
| **TypeScript** | Type-safe implementation |

---

## 📋 System Requirements

- **Node.js:** v20 or higher
- **OpenAI API Key:** [Get free $5 trial](https://platform.openai.com/account/billing/overview)
- **RAM:** Minimum 4GB (8GB recommended)
- **Disk Space:** ~1GB (for node_modules + database)
- **Internet:** Required for OpenAI API calls

---

## 🎯 Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Docusaurus + Express server (parallel) |
| `npm start` | Start Docusaurus only (http://localhost:3000) |
| `npm run chat-server` | Start Express API only (http://localhost:3001) |
| `npm run setup-vector-db` | Initialize ChromaDB with documentation |
| `npm run build` | Build static site for production |
| `npm run serve` | Serve production build locally |
| `npm run typecheck` | Check TypeScript types |

---

## ❌ Troubleshooting

### Error: "OpenAI API key not configured"
```bash
# Verify .env file exists and has the key
cat .env | grep OPENAI_API_KEY

# Restart server after updating .env
npm run dev
```

### Error: "Vector database not initialized"
```bash
npm run setup-vector-db
```

### Error: "API is not responding"
```powershell
# Check if Express is running on port 3001
netstat -ano | findstr :3001

# Kill and restart
npm run dev
```

**See [SETUP_TROUBLESHOOTING.md](./SETUP_TROUBLESHOOTING.md) for detailed solutions.**

---

## 📁 Project Structure

```
my-book/
├── api/
│   └── chat.ts              # Chat API endpoint handler
├── src/
│   ├── components/
│   │   └── FloatingChat.tsx # Chat widget component
│   ├── lib/
│   │   └── ragChatbot.ts    # RAG logic
│   └── pages/
│       ├── chat.tsx         # Full-page chat interface
│       └── index.tsx        # Homepage
├── docs/                     # Documentation markdown files
├── scripts/
│   └── setup-vector-db.ts   # Vector database initialization
├── server.js                # Express server
├── .env                      # Environment variables (create from .env.example)
└── docusaurus.config.ts     # Docusaurus configuration
```

---

## 🔄 How RAG Works

```
User Question
    ↓
[Embedding] → Convert to vector
    ↓
[Search] → Find similar documentation chunks
    ↓
[Context] → Pass top 5 results to GPT-4
    ↓
[Response] → Generate AI answer with sources
    ↓
Display answer with citations
```

---

## 🌐 Deployment Options

### Option A: Vercel (Recommended)
```bash
vercel deploy
```
See `RAG_CHATBOT_SETUP.md` for detailed guide.

### Option B: Self-hosted with PM2
```bash
npm install -g pm2
pm2 start server.js --name "rag-api"
pm2 start "npm start" --name "docusaurus"
```

### Option C: Docker
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install && npm run setup-vector-db
EXPOSE 3000 3001
CMD ["npm", "run", "dev"]
```

---

## 📚 Documentation

- **[RAG_CHATBOT_SETUP.md](./my-book/RAG_CHATBOT_SETUP.md)** - Detailed setup guide
- **[SETUP_TROUBLESHOOTING.md](./SETUP_TROUBLESHOOTING.md)** - Error solutions & debugging
- **[Docusaurus Docs](https://docusaurus.io/)** - Site customization

---

## 🔑 Configuration

### Customize Chat Behavior

Edit `my-book/src/lib/ragChatbot.ts`:

```typescript
// Number of documents to retrieve
const topK = 5;  // Increase for more context

// Embedding model
model: 'text-embedding-ada-002'  // Use 'text-embedding-3-small' for speed

// Temperature (0 = deterministic, 1 = creative)
temperature: 0.7
```

### Customize UI

- **FloatingChat:** `my-book/src/components/FloatingChat.tsx`
- **Chat Page:** `my-book/src/pages/chat.tsx`
- **Styles:** `my-book/src/components/FloatingChat.module.css`

---

## 📊 Performance Tips

1. **Faster responses:** Reduce `topK` from 5 to 3
2. **Larger chunks:** Increase chunk size from 1000 to 2000 characters
3. **Parallel requests:** Use concurrent API calls (see server logs)

---

## 🛡️ Security

⚠️ **Never commit `.env` file to Git!** It's already in `.gitignore`

```bash
# Verify no secrets in repo
git status
# Should NOT show .env

# Rotate API key if exposed
# Go to: https://platform.openai.com/account/api-keys
```

---

## 💡 Usage Examples

### In Chat Interface
```
User: "What are the basics of humanoid robotics?"
Assistant: [Retrieves relevant docs] → [Generates answer] → [Shows sources]

User: "How does balance work in bipedal robots?"
Assistant: [Finds documentation about balance] → [Explains with examples]
```

### API Usage (cURL)
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Explain servo motors"}'
```

### Health Check
```bash
curl http://localhost:3001/api/chat
# Response: {"status":"healthy","message":"RAG chatbot is ready"}
```

---

## 🤝 Contributing

To add more documentation:

1. Add markdown files to `my-book/docs/` or `my-book/blog/`
2. Run: `npm run setup-vector-db`
3. Restart server: `npm run dev`

---

## 📝 License

This project is part of the Physical AI & Humanoid Robotics initiative.

---

## ❓ Support

- Check [SETUP_TROUBLESHOOTING.md](./SETUP_TROUBLESHOOTING.md) for common issues
- Review console logs: Press `F12` in browser → Console tab
- Check backend logs in terminal running `npm run chat-server`

---

**Last Updated:** December 19, 2025  
**Status:** ✅ Ready for use

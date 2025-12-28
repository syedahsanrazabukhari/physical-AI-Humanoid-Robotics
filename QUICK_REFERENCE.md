# RAG Chatbot - Quick Reference Card

## 🚀 Fast Setup (Choose Your Style)

### Automated (30 seconds)
```bash
# Windows PowerShell
.\SETUP.ps1

# Windows CMD
SETUP.bat

# macOS/Linux
bash SETUP.sh
```

### Manual (3 minutes)
```bash
cd my-book
cp .env.example .env
# 🔑 Edit .env with your OpenAI API key
npm install
npm run setup-vector-db
npm run dev
```

---

## 📍 URLs After Startup

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Docusaurus site |
| http://localhost:3000/chat | Full-page chat |
| http://localhost:3001/api/chat | API endpoint |

---

## ⚠️ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "OpenAI API key not configured" | Add key to `.env` file |
| "Vector database not initialized" | Run `npm run setup-vector-db` |
| "Invalid OpenAI API key" | Get new key from openai.com |
| "API is not responding" | Run `npm run dev` in terminal |

---

## 🔑 Essential Commands

```bash
npm run dev              # Start everything
npm start                # Start Docusaurus only
npm run chat-server      # Start Express only
npm run setup-vector-db  # Initialize database
npm run build            # Build for production
npm run serve            # Serve production build
npm run typecheck        # Check TypeScript
```

---

## ✅ Verification Checklist

- [ ] `.env` file created with API key
- [ ] `npm install` completed
- [ ] `npm run setup-vector-db` succeeded (5-15 min)
- [ ] `npm run dev` shows "Local:" URL
- [ ] Chat page loads at http://localhost:3000/chat
- [ ] Floating chat button visible
- [ ] First message sends without error

---

## 🆘 Emergency Troubleshooting

```bash
# Check if servers are running
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill stuck process (Windows PowerShell)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force

# Full reset
rm -r .chroma
npm install
npm run setup-vector-db
npm run dev
```

---

## 📚 Documentation

- **GETTING_STARTED.md** - Full setup guide
- **SETUP_TROUBLESHOOTING.md** - 8+ error solutions
- **IMPLEMENTATION_SUMMARY.md** - What was fixed
- **RAG_CHATBOT_SETUP.md** - Existing detailed guide

---

## 💻 IDE Tips

### VS Code
- Press `Ctrl+`` to open terminal
- Run `npm run dev` in terminal
- Press `F12` in browser to view console errors

### WebStorm
- Terminal → New Terminal
- Run `npm run dev`
- Tools → Run → Jest (for tests if needed)

---

## 🌍 API Health Check

```bash
# Test health endpoint
curl http://localhost:3001/api/chat

# Expected: {"status":"healthy","message":"RAG chatbot is ready"}
```

---

## 🔧 Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-proj-your-key-here

# Optional (defaults shown)
PORT=3001              # Express server port
DOCUSAURUS_PORT=3000   # Docusaurus port
NODE_ENV=development   # or 'production'
```

---

## 📊 Performance Tuning

```typescript
// In my-book/src/lib/ragChatbot.ts

// Faster responses (less context)
const topK = 3;

// More comprehensive (slower)
const topK = 10;

// Embedding model (fast)
model: 'text-embedding-3-small'

// Embedding model (accurate)
model: 'text-embedding-ada-002'
```

---

## 🚨 If Nothing Works

1. Check browser console (F12) for error message
2. Check terminal running `npm run dev` for backend errors
3. Run `npm run setup-vector-db` again
4. Read `SETUP_TROUBLESHOOTING.md` for your specific error
5. Delete `.chroma` and `node_modules`, then reinstall

---

## 💡 Tips & Tricks

- **Save time:** Keep terminal with `npm run dev` always running
- **Debug:** Open DevTools (F12) → Console tab
- **Check status:** http://localhost:3001/api/chat
- **Modify prompts:** Edit `ragChatbot.ts` system message
- **Custom docs:** Add `.md` files to `docs/` folder, re-run setup

---

## 📱 Using the Chat

```
User: "What is humanoid robotics?"
Bot: [Searches docs] → [Generates answer] → [Shows sources]

User: "Explain servo motors"
Bot: [Finds relevant sections] → [Explains clearly]

User: "How does balance work?"
Bot: [Finds technical docs] → [Simplifies explanation]
```

---

## 🔐 Security Checklist

- ✅ Never commit `.env` file (it's in .gitignore)
- ✅ Regenerate API key if accidentally exposed
- ✅ Use environment variables for all secrets
- ✅ Rotate credentials regularly
- ✅ Review OpenAI usage: https://platform.openai.com/account/usage

---

## 📝 Node.js Versions

```bash
# Check version
node --version

# Required: v20+
# Recommended: v22+

# Install NVM (macOS/Linux)
curl https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install 22
nvm use 22
```

---

## 🎯 Production Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Self-hosted
```bash
npm run build
npm start  # Serves production build
```

### Docker
```bash
docker build -t rag-chatbot .
docker run -p 3000:3000 -p 3001:3001 rag-chatbot
```

---

**Last Updated:** December 19, 2025  
**Keep this handy for quick reference!**

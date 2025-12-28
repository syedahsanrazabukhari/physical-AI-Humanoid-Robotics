# RAG Chatbot Setup & Troubleshooting Guide

## Quick Start

If you're seeing the error **"Sorry, I encountered an error. Please try again."**, follow these steps:

### Step 1: Configure Environment Variables

1. Navigate to the `my-book` directory:
   ```bash
   cd my-book
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Verify your `.env` file contains a valid OpenAI API key:
   ```
   OPENAI_API_KEY=sk-proj-xxxxx...
   ```

### Step 2: Initialize the Vector Database

Before running the chatbot, you must generate embeddings for the documentation:

```bash
npm run setup-vector-db
```

**What this does:**
- Reads all markdown files from `docs/` and `blog/` directories
- Splits content into chunks (1000 characters with 200 character overlap)
- Generates embeddings using OpenAI's text-embedding-ada-002 model
- Stores embeddings in ChromaDB local vector database

**Expected output:**
```
🚀 Starting Vector Database Setup...
📦 Creating/Getting ChromaDB collection...
📄 Finding markdown files...
📝 Found X markdown files
Processing: docs/intro.md
...
✂️  Created X text chunks
🔮 Generating embeddings...
💾 Storing embeddings in ChromaDB...
✅ Vector database setup complete!
```

**Time estimate:** 5-15 minutes depending on documentation size

### Step 3: Start the Development Server

Run both Docusaurus and the Express API server:

```bash
npm run dev
```

This runs two processes in parallel:
- **Docusaurus** - Static site generator (http://localhost:3000)
- **Express Server** - API backend (http://localhost:3001)

OR run them separately:

```bash
# Terminal 1: Start Docusaurus
npm start

# Terminal 2: Start Express API server
npm run chat-server
```

## Common Errors & Solutions

### Error: "OpenAI API key not configured"

**Problem:** The `OPENAI_API_KEY` environment variable is missing or not set.

**Solution:**
1. Verify `.env` file exists in `my-book/` directory
2. Check it contains: `OPENAI_API_KEY=sk-proj-...`
3. Make sure the key is NOT wrapped in quotes
4. Restart the server after editing `.env`

```bash
# If using npm run dev
# Stop with Ctrl+C and run again
npm run dev
```

### Error: "Vector database not initialized"

**Problem:** ChromaDB hasn't been populated with documentation embeddings.

**Solution:**
```bash
cd my-book
npm run setup-vector-db
```

Wait for the script to complete. You'll see "✅ Vector database setup complete!" when done.

### Error: "Invalid OpenAI API key"

**Problem:** The API key in `.env` is invalid or expired.

**Solution:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Log in with your account
3. Create a new API key (or regenerate if expired)
4. Update the `.env` file with the new key
5. Restart the server

### Error: "API is not responding" or Port Already in Use

**Problem:** The Express server isn't running or port 3001 is already in use.

**Solution:**

Check if services are running:
```bash
# Check if Express server is running on port 3001
netstat -ano | findstr :3001

# Check if Docusaurus is running on port 3000
netstat -ano | findstr :3000
```

Kill existing processes:
```bash
# Windows PowerShell - Kill process on port 3001
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess -Force

# Restart
npm run dev
```

### Error: "Cannot find module 'chromadb'" or Missing Dependencies

**Problem:** Node modules not installed or outdated.

**Solution:**
```bash
# Clean install dependencies
cd my-book
npm install
npm run setup-vector-db
npm run dev
```

### Chat is slow or no response after 30 seconds

**Problem:** OpenAI API is slow or you've hit rate limits.

**Solution:**
1. Check your OpenAI account usage at [https://platform.openai.com/account/usage/overview](https://platform.openai.com/account/usage/overview)
2. Ensure you have sufficient credits
3. Try a simpler question first
4. Check internet connection

## Verification Steps

### Verify Environment Setup
```bash
cd my-book

# Check if .env file exists
Test-Path .env

# Check if OpenAI key is set
$env:OPENAI_API_KEY  # Should output your key
```

### Verify Vector Database
```bash
# Check if ChromaDB was initialized (look for .chroma directory)
ls -la | grep chroma
```

### Verify API Health
```bash
# In a terminal, test the health endpoint
curl http://localhost:3001/api/chat

# Or in PowerShell
Invoke-WebRequest -Uri http://localhost:3001/api/chat -Method GET
```

Expected response when healthy:
```json
{
  "status": "healthy",
  "message": "RAG chatbot is ready"
}
```

## Running on Different Ports

### Custom Docusaurus Port
```bash
npm start -- --port 3002
```

### Custom Express Server Port
Edit `server.js` and change:
```javascript
const PORT = process.env.PORT || 3001;  // Change 3001 to desired port
```

## Performance Optimization

### If responses are slow:

1. **Reduce number of retrieved documents** in `lib/ragChatbot.ts`:
   ```typescript
   const topK = 3;  // Reduce from 5 to 3
   ```

2. **Increase chunk size** in `scripts/setup-vector-db.ts`:
   ```typescript
   const chunkSize = 2000;  // Increase from 1000
   ```

3. **Use a smaller embedding model** (in progress)

## Production Deployment

### Option A: Vercel (Recommended)
See detailed guide in `RAG_CHATBOT_SETUP.md`

### Option B: Self-hosted with PM2
```bash
npm install -g pm2

# Start services with PM2
pm2 start server.js --name "rag-api"
pm2 start "npm start" --name "docusaurus"

# View logs
pm2 logs

# Monitor
pm2 monit
```

## Debugging

### Enable verbose logging:

In `lib/ragChatbot.ts`, add before function calls:
```typescript
console.log('Query:', query);
console.log('Retrieving documents...');
```

In `server.js`, Express logs are printed automatically.

### Check browser console:
1. Open chat page in browser
2. Press `F12` to open Developer Tools
3. Go to Console tab
4. Look for error messages starting with "Chat error:"

## Reset Everything

If something goes wrong, completely reset:

```bash
cd my-book

# Remove ChromaDB cache
rm -r .chroma

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install

# Reinitialize database
npm run setup-vector-db

# Restart servers
npm run dev
```

## Support

If issues persist:

1. Check the generated `.chroma` directory exists
2. Verify OpenAI API key has usage credits remaining
3. Check network connectivity (can you access openai.com?)
4. Review console logs (Ctrl+Shift+I in browser)
5. Check `server.js` terminal output for backend errors

---

**Last Updated:** December 19, 2025
**Status:** ✅ Complete setup guide with comprehensive troubleshooting

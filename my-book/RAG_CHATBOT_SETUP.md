# RAG Chatbot Setup Guide

This guide explains how to set up and use the RAG (Retrieval-Augmented Generation) chatbot for the Physical AI & Humanoid Robotics documentation.

## Overview

The RAG chatbot allows users to ask questions about the documentation and receive AI-powered answers. It uses:

- **OpenAI GPT-4** for generating responses
- **OpenAI Embeddings (text-embedding-ada-002)** for semantic search
- **ChromaDB** for vector storage
- **LangChain** for orchestration

## Prerequisites

1. **Node.js** (v20 or higher)
2. **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)

## Installation

All dependencies are already installed in the project:

```bash
npm install
```

## Configuration

### 1. Set up Environment Variables

Create a `.env` file in the `my-book` directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

⚠️ **Important**: Never commit the `.env` file to version control!

### 2. Generate Vector Database

Before using the chatbot, you need to process the documentation and create embeddings:

```bash
# Make sure you're in the my-book directory
cd my-book

# Run the vector database setup script
npx ts-node scripts/setup-vector-db.ts
```

This script will:
1. Read all markdown files from `docs/` and `blog/` directories
2. Split content into chunks
3. Generate embeddings using OpenAI
4. Store embeddings in ChromaDB

**Expected output:**
```
🚀 Starting Vector Database Setup...

📦 Creating/Getting ChromaDB collection...
📄 Finding markdown files...
📝 Found X markdown files

Processing: docs/intro.md
Processing: docs/robotics-basics.md
...

✂️  Created X text chunks
🔮 Generating embeddings...
  Processing batch 1/Y
  Processing batch 2/Y
...

💾 Storing embeddings in ChromaDB...

✅ Vector database setup complete!
📊 Total documents indexed: X
🎉 RAG system is ready to use!
```

⏱️ **Note**: This process may take 5-15 minutes depending on the amount of documentation.

## Setting Up the API Backend

Since Docusaurus is a static site generator, you need to set up a backend API to handle chat requests. You have two options:

### Option A: Using Vercel Serverless Functions (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Create a `vercel.json` in the root:
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3"
    }
  }
}
```

3. Deploy to Vercel:
```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `OPENAI_API_KEY` as an environment variable

### Option B: Using a Separate Express Server

1. Create a simple Express server:

```bash
# In a new directory
mkdir chat-backend
cd chat-backend
npm init -y
npm install express cors dotenv chromadb openai
```

2. Create `server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleChatQuery, checkHealth } from '../my-book/src/lib/ragChatbot.ts';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const response = await handleChatQuery(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/chat', async (req, res) => {
  const isHealthy = await checkHealth();
  res.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    message: isHealthy ? 'RAG chatbot is ready' : 'Vector database not initialized',
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chat API server running on port ${PORT}`);
});
```

3. Update the chat page to point to your backend URL.

## Running the Application

1. **Start ChromaDB** (if using local installation):
```bash
chroma run --path ./chroma_db
```

2. **Start the Docusaurus development server**:
```bash
npm start
```

3. **Visit the chat page**:
Open your browser and go to `http://localhost:3000/chat`

## Using the Chatbot

1. Navigate to the "🤖 AI Chat" link in the navigation bar
2. Type your question in the input field
3. Click "Send" or press Enter
4. The chatbot will:
   - Search the vector database for relevant documentation
   - Use that context to generate an accurate answer
   - Show you the source documents it referenced

### Example Questions

- "What is Physical AI?"
- "Explain humanoid robotics concepts"
- "How do I get started with robotics?"
- "What are the key components of a humanoid robot?"

## Updating the Vector Database

When you add or update documentation:

1. Run the setup script again:
```bash
npx ts-node scripts/setup-vector-db.ts
```

2. The script will clear old data and re-index all documents

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is not set"

**Solution**: Make sure you've created a `.env` file with your API key.

### Error: "Vector database not initialized"

**Solution**: Run the setup script to generate embeddings:
```bash
npx ts-node scripts/setup-vector-db.ts
```

### Error: "Failed to get response from chatbot"

**Solutions**:
1. Check that ChromaDB is running
2. Verify your OpenAI API key is valid
3. Check the browser console for detailed error messages
4. Ensure your backend API is running and accessible

### Chat responses are not relevant

**Solutions**:
1. Make sure you've run the vector database setup
2. Verify that your documentation is in the `docs/` or `blog/` directories
3. Try regenerating the vector database

## Cost Considerations

Using the RAG chatbot incurs OpenAI API costs:

- **Embeddings**: ~$0.0001 per 1K tokens
- **GPT-4 Chat**: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)

For a typical documentation site with 100 pages:
- Initial embedding: ~$1-2 (one-time)
- Per chat query: ~$0.01-0.05

## Architecture

```
┌─────────────────┐
│  User Interface │ (chat.tsx)
│  (React)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Chat API      │ (api/chat.ts)
│   (Serverless)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RAG Handler    │ (ragChatbot.ts)
│  (LangChain)    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ChromaDB│ │ OpenAI   │
│Vector  │ │ API      │
│Store   │ │          │
└────────┘ └──────────┘
```

## Security Best Practices

1. **Never expose your OpenAI API key** in client-side code
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** on your API endpoint
4. **Add authentication** if deploying to production
5. **Monitor API usage** to avoid unexpected costs

## Production Deployment

### Checklist:

- [ ] Set up environment variables on hosting platform
- [ ] Generate and upload vector database
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Add error monitoring (e.g., Sentry)
- [ ] Set up API key rotation
- [ ] Add user authentication (optional)
- [ ] Test thoroughly before launch

## Support

If you encounter issues:

1. Check this README
2. Review the [Docusaurus documentation](https://docusaurus.io/)
3. Check [OpenAI API documentation](https://platform.openai.com/docs)
4. Open an issue in the GitHub repository

## License

This project is part of the Physical AI & Humanoid Robotics educational platform.

# 🤖 Physical AI & Humanoid Robotics - RAG Chatbot Quick Start Guide

## Overview

This project includes an AI-powered chatbot that uses **RAG (Retrieval-Augmented Generation)** to answer questions about Physical AI and Humanoid Robotics based on the documentation.

## ⚡ Quick Start

### Step 1: Install Dependencies

```bash
cd my-book
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the `my-book` directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Step 3: Generate Vector Database

This processes all documentation and creates embeddings:

```bash
npm run setup-vector-db
```

⏱️ This will take 5-15 minutes depending on the amount of documentation.

### Step 4: Start the Application

Run both the Docusaurus site and the chat API server:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Docusaurus site
npm start

# Terminal 2 - Chat API server
npm run chat-server
```

### Step 5: Use the Chat

Open your browser and go to:
- **Main site**: http://localhost:3000
- **Chat page**: http://localhost:3000/chat

## 📋 What's Included

### Files Created

```
my-book/
├── .env.example              # Environment variables template
├── server.js                 # Express API server for chat
├── RAG_CHATBOT_SETUP.md     # Detailed setup guide
├── scripts/
│   └── setup-vector-db.ts   # Vector database initialization script
├── src/
│   ├── lib/
│   │   └── ragChatbot.ts    # RAG chatbot logic
│   └── pages/
│       ├── chat.tsx          # Chat interface page
│       └── chat.module.css   # Chat page styles
└── api/
    └── chat.ts               # API route handler
```

### Features Implemented

✅ **RAG System**
- OpenAI GPT-4 for generating responses
- OpenAI Embeddings (text-embedding-ada-002) for semantic search
- ChromaDB for vector storage
- LangChain for orchestration

✅ **Chat Interface**
- Clean, modern UI with message history
- Real-time responses
- Source document references
- Mobile-responsive design

✅ **Backend API**
- Express server for handling chat requests
- Health check endpoint
- CORS enabled for development

✅ **Documentation**
- Comprehensive setup guide
- Troubleshooting section
- Production deployment checklist

## 🎯 Using the Chatbot

1. Navigate to the **🤖 AI Chat** link in the navigation bar
2. Type your question about robotics, AI, or any documentation topic
3. Get instant, contextual answers with source references

Example questions:
- "What is Physical AI?"
- "Explain the fundamentals of humanoid robotics"
- "How do sensors work in robotics?"

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Generate/update vector database
npm run setup-vector-db

# Start Docusaurus site only
npm start

# Start chat API server only
npm run chat-server

# Start both (recommended)
npm run dev

# Build for production
npm run build
```

## 🚨 Troubleshooting

### "OPENAI_API_KEY environment variable is not set"
**Solution**: Create a `.env` file with your OpenAI API key

### "Vector database not initialized"
**Solution**: Run `npm run setup-vector-db`

### "Failed to get response from chatbot"
**Solutions**:
1. Check that the chat server is running (`npm run chat-server`)
2. Verify your OpenAI API key is valid
3. Check the browser console for errors

### Chat responses are not relevant
**Solution**: Regenerate the vector database with `npm run setup-vector-db`

## 💰 Cost Considerations

Using the RAG chatbot incurs OpenAI API costs:
- **Embeddings**: ~$0.0001 per 1K tokens
- **GPT-4**: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)

Estimated costs for a typical documentation site:
- Initial embedding: $1-2 (one-time)
- Per chat query: $0.01-0.05

## 📚 Documentation

For detailed setup instructions, see [RAG_CHATBOT_SETUP.md](my-book/RAG_CHATBOT_SETUP.md)

Topics covered:
- Complete installation guide
- API backend setup options (Vercel, Express)
- Production deployment checklist
- Security best practices
- Architecture overview

## 🏗️ Architecture

```
User Interface (React)
    ↓
Chat API (Express/Serverless)
    ↓
RAG Handler (LangChain)
    ↓
┌─────────────┬──────────────┐
│  ChromaDB   │   OpenAI     │
│  Vector DB  │   API        │
└─────────────┴──────────────┘
```

## 🔐 Security Notes

- ⚠️ Never commit your `.env` file
- ⚠️ Never expose your OpenAI API key in client-side code
- ✅ Use environment variables for all sensitive data
- ✅ Implement rate limiting in production
- ✅ Add authentication for public deployments

## 🚀 Production Deployment

### Checklist:

- [ ] Set environment variables on hosting platform
- [ ] Generate and upload vector database
- [ ] Configure CORS for your domain
- [ ] Implement rate limiting
- [ ] Add error monitoring
- [ ] Test thoroughly
- [ ] Set up API key rotation
- [ ] Monitor costs

### Recommended Platforms:

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend API**: Vercel Serverless, AWS Lambda, Railway
- **Vector DB**: ChromaDB Cloud, Pinecone, Weaviate

## 📝 Updating Documentation

When you add or update documentation:

1. Add/edit markdown files in `docs/` or `blog/`
2. Run `npm run setup-vector-db` to re-index
3. The chatbot will now include the new content

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Add conversation memory
- Implement user feedback system
- Add support for more document types
- Optimize embedding generation
- Add multi-language support

## 📄 License

This project is part of the Physical AI & Humanoid Robotics educational platform.

## 🆘 Support

If you encounter issues:

1. Check the [RAG_CHATBOT_SETUP.md](my-book/RAG_CHATBOT_SETUP.md) guide
2. Review error messages in the console
3. Check that all services are running
4. Verify your API key is valid and has credits
5. Open an issue in the GitHub repository

## 🎉 Success!

If everything is set up correctly:
- ✅ Docusaurus site running on http://localhost:3000
- ✅ Chat API server running on http://localhost:3001
- ✅ Vector database initialized with documentation
- ✅ Chat interface accessible at http://localhost:3000/chat

Happy learning! 🚀

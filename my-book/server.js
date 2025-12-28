/**
/**
 * Simple Express Server for RAG Chat API
 * Development server using in-memory embeddings (no external DB)
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load environment variables FIRST
dotenv.config();

const OpenAI = require("openai");

// Validate API key early
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing. Check your .env file.");
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve built Docusaurus site on the same port
const buildDir = path.join(__dirname, "build");
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
}

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* -------------------- In-memory RAG index -------------------- */

// Store: [{ id, text, source, embedding:number[] }]
const INDEX = [];

function findMarkdownFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) files.push(...findMarkdownFiles(full));
    else if (stat.isFile() && (item.endsWith(".md") || item.endsWith(".mdx"))) files.push(full);
  }
  return files;
}

function chunkText(text, chunkSize = 1200, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end >= text.length) break;
    start = end - overlap;
  }
  return chunks;
}

async function embedTexts(texts) {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return resp.data.map((d) => d.embedding);
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}

async function buildIndex() {
  const docsDir = path.join(__dirname, "docs");
  const blogDir = path.join(__dirname, "blog");
  const files = [...findMarkdownFiles(docsDir), ...findMarkdownFiles(blogDir)];

  console.log(`📄 Indexing ${files.length} markdown files...`);
  let idCounter = 0;
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    if (raw.length < 80) continue;
    const chunks = chunkText(raw);
    const embeddings = await embedTexts(chunks);
    const rel = path.relative(__dirname, file);
    for (let i = 0; i < chunks.length; i++) {
      INDEX.push({ id: `c_${idCounter++}`, text: chunks[i], source: rel, embedding: embeddings[i] });
    }
    console.log(`  ✓ ${rel} -> ${chunks.length} chunks`);
  }
  console.log(`✅ Index ready with ${INDEX.length} chunks`);
}

async function retrieveRelevantDocs(query, topK = 5) {
  if (INDEX.length === 0) return { documents: [], sources: [] };
  const [qEmb] = await embedTexts([query]);
  const scored = INDEX.map((it) => ({ s: cosine(qEmb, it.embedding), it }));
  scored.sort((a, b) => b.s - a.s);
  const top = scored.slice(0, topK).map((x) => x.it);
  return {
    documents: top.map((t) => t.text),
    sources: Array.from(new Set(top.map((t) => t.source))).slice(0, topK),
  };
}

async function generateResponse(query, context, conversationHistory = []) {
  const contextText = context.length > 0 ? context.join("\n\n---\n\n") : "";
  const messages = [
    { role: "system", content: "You are an expert AI assistant for Physical AI and Humanoid Robotics. Use provided context when possible; otherwise say you don’t know." },
    ...(conversationHistory || []).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: contextText ? `Context:\n${contextText}\n\nQuestion: ${query}` : query },
  ];
  const completion = await openai.chat.completions.create({ model: "gpt-4o-mini", messages, temperature: 0.7, max_tokens: 800 });
  return completion.choices[0]?.message?.content || "Sorry, I could not generate a response.";
}

async function handleChatQuery({ message, conversationHistory }) {
  const { documents, sources } = await retrieveRelevantDocs(message);
  const response = await generateResponse(message, documents, conversationHistory);
  return { response, relevantDocs: documents, sources };
}

async function checkHealth() {
  return INDEX.length > 0;
}

/* -------------------- API ROUTES -------------------- */

app.get("/api/chat", async (req, res) => {
  const healthy = await checkHealth();
  res.json({ status: healthy ? "healthy" : "unhealthy", message: healthy ? "RAG chatbot is ready" : "Index not built yet" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid request: message is required" });
    }
    const result = await handleChatQuery({ message, conversationHistory: conversationHistory || [] });
    res.json(result);
  } catch (error) {
    console.error("❌ Chat API error:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: error.message?.toString() || "Unknown error",
      details: error.stack || error.message?.toString() || "No further details available."
    });
  }
});

// Fallback to SPA index for non-API routes
if (fs.existsSync(buildDir)) {
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(buildDir, "index.html"));
  });
}

// Startup
async function startup() {
  try {
    await buildIndex();
    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Site + Chat API running on http://localhost:${PORT}`);
      console.log(`📡 Health: GET   /api/chat`);
      console.log(`💬 Chat:   POST  /api/chat`);
      console.log(`🖥️  Static:       / (serving build/)\n`);
    });
  } catch (error) {
    console.error("❌ Startup error:", error);
    process.exit(1);
  }
}

startup();

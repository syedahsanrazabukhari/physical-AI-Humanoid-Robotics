/**
 * RAG Chat API Backend
 * Handles chat queries using Retrieval-Augmented Generation
 */

import { ChromaClient } from 'chromadb';
import { OpenAI } from 'openai';

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chromaClient = new ChromaClient();

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

interface ChatResponse {
  response: string;
  relevantDocs: string[];
  sources: string[];
}

/**
 * Generate embedding for a query
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  
  return response.data[0].embedding;
}

/**
 * Retrieve relevant documents from vector database
 */
async function retrieveRelevantDocs(query: string, topK: number = 5): Promise<{
  documents: string[];
  sources: string[];
}> {
  try {
    const collection = await chromaClient.getCollection({
      name: 'robotics_docs',
    });
    
    const queryEmbedding = await generateQueryEmbedding(query);
    
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });
    
    const documents = results.documents[0] || [];
    const metadatas = results.metadatas[0] || [];
    const sources = metadatas.map((meta: any) => meta.source);
    
    return {
      documents: documents as string[],
      sources,
    };
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return {
      documents: [],
      sources: [],
    };
  }
}

/**
 * Generate response using OpenAI with RAG context
 */
async function generateResponse(
  query: string,
  context: string[],
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const contextText = context.join('\n\n---\n\n');
  
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `You are an expert AI assistant for Physical AI and Humanoid Robotics. You help students and researchers understand concepts related to robotics, AI, machine learning, and humanoid systems.

Use the following documentation context to answer the user's question. If the context doesn't contain relevant information, use your general knowledge but mention that you're going beyond the provided documentation.

Context from documentation:
${contextText}

Guidelines:
- Be accurate and precise
- Use examples when helpful
- If you're unsure, say so
- Reference the documentation when applicable
- Format your responses clearly with proper structure`,
  };
  
  const messages: ChatMessage[] = [
    systemMessage,
    ...conversationHistory,
    {
      role: 'user',
      content: query,
    },
  ];
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return completion.choices[0].message.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

/**
 * Main chat handler function
 */
export async function handleChatQuery(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Retrieve relevant documents
    const { documents, sources } = await retrieveRelevantDocs(request.message);
    
    // Generate response with context
    const response = await generateResponse(
      request.message,
      documents,
      request.conversationHistory
    );
    
    // Get unique sources
    const uniqueSources = [...new Set(sources)];
    
    return {
      response,
      relevantDocs: documents,
      sources: uniqueSources,
    };
  } catch (error) {
    console.error('Error handling chat query:', error);
    throw error;
  }
}

/**
 * Health check function
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const collection = await chromaClient.getCollection({
      name: 'robotics_docs',
    });
    const count = await collection.count();
    return count > 0;
  } catch (error) {
    return false;
  }
}

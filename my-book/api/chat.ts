/**
 * Chat API Route Handler
 * This creates an API endpoint for the RAG chatbot
 */

// @ts-ignore: module or type declarations may be generated at runtime or located elsewhere
import { handleChatQuery, checkHealth } from '../lib/ragChatbot';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.method === 'GET') {
    try {
      const isHealthy = await checkHealth();
      res.status(200).json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy
          ? 'RAG chatbot is ready'
          : 'Vector database not initialized',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error checking health',
      });
    }
    return;
  }

  // Handle POST request (chat query)
  if (req.method === 'POST') {
    try {
      const { message, conversationHistory } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          error: 'Invalid request: message is required',
        });
        return;
      }

      const response = await handleChatQuery({
        message,
        conversationHistory: conversationHistory || [],
      });

      res.status(200).json(response);
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Internal server error';
      let errorDetails = '';
      
      if (error.message?.includes('OPENAI_API_KEY')) {
        errorMessage = 'OpenAI API key not configured';
        errorDetails = 'OPENAI_API_KEY environment variable is missing. Please set it in your .env file.';
      } else if (error.message?.includes('ChromaDB') || error.message?.includes('collection')) {
        errorMessage = 'Vector database not initialized';
        errorDetails = 'Run "npm run setup-vector-db" to initialize the database with documentation embeddings.';
      } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        errorMessage = 'Invalid OpenAI API key';
        errorDetails = 'The OPENAI_API_KEY in your .env file is invalid. Please verify it on platform.openai.com';
      }
      
      res.status(500).json({
        error: errorMessage,
        message: error.message,
        details: errorDetails,
      });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
}

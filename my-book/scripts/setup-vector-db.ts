/**
 * Vector Database Setup Script for RAG Chatbot
 * This script processes documentation files, generates embeddings, and stores them in ChromaDB
 */

import dotenv from 'dotenv';
import { ChromaClient } from 'chromadb';
import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { markdownToTxt } from 'markdown-to-txt';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize ChromaDB client
const chromaClient = new ChromaClient();

interface DocumentChunk {
  content: string;
  metadata: {
    source: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

/**
 * Split text into chunks for embedding
 */
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    
    if (start >= text.length) break;
  }

  return chunks;
}

/**
 * Get all markdown files from docs directory
 */
function getMarkdownFiles(dirPath: string): string[] {
  const files: string[] = [];
  
  function traverse(currentPath: string) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dirPath);
  return files;
}

/**
 * Process a single markdown file
 */
async function processMarkdownFile(filePath: string): Promise<DocumentChunk[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const plainText = markdownToTxt(content);
  
  // Remove excessive whitespace
  const cleanedText = plainText.replace(/\n{3,}/g, '\n\n').trim();
  
  // Split into chunks
  const textChunks = chunkText(cleanedText);
  
  // Create document chunks with metadata
  const documentChunks: DocumentChunk[] = textChunks.map((chunk, index) => ({
    content: chunk,
    metadata: {
      source: filePath,
      chunkIndex: index,
      totalChunks: textChunks.length,
    },
  }));
  
  return documentChunks;
}

/**
 * Generate embeddings for a batch of texts
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: texts,
    });
    
    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

/**
 * Main function to setup vector database
 */
async function setupVectorDB() {
  console.log('🚀 Starting Vector Database Setup...\n');
  
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    // Get or create collection
    console.log('📦 Creating/Getting ChromaDB collection...');
    const collection = await chromaClient.getOrCreateCollection({
      name: 'robotics_docs',
      metadata: { 'hnsw:space': 'cosine' },
    });
    
    // Clear existing data (optional - remove if you want to preserve existing data)
    const existingCount = await collection.count();
    if (existingCount > 0) {
      console.log(`🗑️  Clearing ${existingCount} existing documents...`);
      await collection.delete({});
      // Recreate collection
      await chromaClient.getOrCreateCollection({
        name: 'robotics_docs',
        metadata: { 'hnsw:space': 'cosine' },
      });
    }
    
    // Get all markdown files
    const docsPath = path.join(__dirname, '..', 'docs');
    const blogPath = path.join(__dirname, '..', 'blog');
    
    console.log('📄 Finding markdown files...');
    let allFiles: string[] = [];
    
    if (fs.existsSync(docsPath)) {
      allFiles = allFiles.concat(getMarkdownFiles(docsPath));
    }
    
    if (fs.existsSync(blogPath)) {
      allFiles = allFiles.concat(getMarkdownFiles(blogPath));
    }
    
    console.log(`📝 Found ${allFiles.length} markdown files\n`);
    
    // Process all files
    let totalChunks = 0;
    const allDocuments: DocumentChunk[] = [];
    
    for (const filePath of allFiles) {
      const relativePath = path.relative(path.join(__dirname, '..'), filePath);
      console.log(`Processing: ${relativePath}`);
      
      const chunks = await processMarkdownFile(filePath);
      allDocuments.push(...chunks);
      totalChunks += chunks.length;
    }
    
    console.log(`\n✂️  Created ${totalChunks} text chunks`);
    
    // Generate embeddings in batches
    console.log('🔮 Generating embeddings...');
    const batchSize = 100;
    const allEmbeddings: number[][] = [];
    
    for (let i = 0; i < allDocuments.length; i += batchSize) {
      const batch = allDocuments.slice(i, i + batchSize);
      const texts = batch.map(doc => doc.content);
      
      console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allDocuments.length / batchSize)}`);
      
      const embeddings = await generateEmbeddings(texts);
      allEmbeddings.push(...embeddings);
      
      // Rate limiting: wait a bit between batches
      if (i + batchSize < allDocuments.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Store in ChromaDB
    console.log('\n💾 Storing embeddings in ChromaDB...');
    
    const ids = allDocuments.map((_, index) => `doc_${index}`);
    const documents = allDocuments.map(doc => doc.content);
    const metadatas = allDocuments.map(doc => doc.metadata);
    
    await collection.add({
      ids,
      embeddings: allEmbeddings,
      documents,
      metadatas,
    });
    
    console.log('\n✅ Vector database setup complete!');
    console.log(`📊 Total documents indexed: ${allDocuments.length}`);
    console.log('🎉 RAG system is ready to use!\n');
    
  } catch (error) {
    console.error('❌ Error setting up vector database:', error);
    throw error;
  }
}

// Run the setup
setupVectorDB()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

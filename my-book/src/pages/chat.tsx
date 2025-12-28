/**
 * RAG Chatbot Page
 * Interactive chat interface for the Physical AI & Humanoid Robotics documentation
 */

import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './chat.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

export default function ChatPage() {
  // Use a deploy-friendly API base: prefer public env, fallback to local dev
  const chatApiUrl =
    process.env.NEXT_PUBLIC_CHAT_API?.trim() || '/api/chat';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hello! I'm your AI assistant for Physical AI and Humanoid Robotics. I can help you understand concepts from the documentation. Ask me anything!",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Since Docusaurus is static, we'll need to use a serverless function or external API
      // For now, this is a placeholder that you'll need to connect to your backend
      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        let errorText = 'Failed to get response from chatbot';
        try {
          // First, try to clone the response to read it as text
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          console.error("Raw error response from server:", text);
          
          // Now, try to parse the original response as JSON
          const errorData = await response.json();
          errorText = errorData.details || errorData.error || `Server responded with status ${response.status}`;
        } catch (e) {
          // If JSON parsing fails, we already logged the raw text.
          // We can add a more specific error message here.
          console.error("Failed to parse error response as JSON.", e);
          errorText = `Server returned an invalid response (status ${response.status}). Check the browser console for the raw response.`;
        }
        throw new Error(errorText);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sources: data.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(`⚠️ ${errorMsg}`);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hello! I'm your AI assistant for Physical AI and Humanoid Robotics. I can help you understand concepts from the documentation. Ask me anything!",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  return (
    <Layout
      title="AI Chat Assistant"
      description="Chat with an AI assistant about Physical AI and Humanoid Robotics"
    >
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h1>🤖 RAG Chat Assistant</h1>
          <p>Ask questions about Physical AI and Humanoid Robotics</p>
          <button onClick={clearChat} className={styles.clearButton}>
            Clear Chat
          </button>
        </div>

        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.messageRole}>
                  {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
                </span>
                <span className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className={styles.messageContent}>{message.content}</div>
              {message.sources && message.sources.length > 0 && (
                <div className={styles.sources}>
                  <strong>Sources:</strong>
                  <ul>
                    {message.sources.map((source, idx) => (
                      <li key={idx}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <div className={styles.messageHeader}>
                <span className={styles.messageRole}>🤖 Assistant</span>
              </div>
              <div className={styles.messageContent}>
                <div className={styles.loadingDots}>
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about robotics..."
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>

        <div className={styles.chatFooter}>
          <p>
            💡 <strong>Tip:</strong> This chatbot uses RAG (Retrieval-Augmented Generation) to
            answer questions based on the documentation.
          </p>
        </div>
      </div>
    </Layout>
  );
}

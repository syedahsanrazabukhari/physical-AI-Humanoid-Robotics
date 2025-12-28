/**
 * Floating Chat Button with Top Popup
 * Provides a circular button in bottom-right corner that opens a chat popup
 */

import React, { useState, useRef, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './FloatingChat.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

export default function FloatingChat() {
  const { siteConfig } = useDocusaurusContext();

  // ❌ Use absolute path in dev because UI and API are on different ports
  const API_PATH = 'http://localhost:3001/api/chat';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPopupRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatPopupRef.current &&
        !chatPopupRef.current.contains(event.target as Node)
      ) {
        const button = document.querySelector('[data-chat-button]');
        if (button && !button.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            "Hi! 👋 I'm your AI assistant. Ask me anything about Physical AI and Humanoid Robotics!",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

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
      const response = await fetch(`${API_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get response from chatbot');
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
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`⚠️ ${msg}`);
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
          "Hi! 👋 I'm your AI assistant. Ask me anything about Physical AI and Humanoid Robotics!",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  return (
    <div className={styles.floatingChatContainer}>
      <button
        data-chat-button
        className={styles.floatingButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        💬
      </button>

      {isOpen && (
        <div className={styles.chatPopup} ref={chatPopupRef}>
          <div className={styles.popupHeader}>
            <h3>🤖 Chat with AI</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.message} ${
                  m.role === 'user'
                    ? styles.userMessage
                    : styles.assistantMessage
                }`}
              >
                {m.content}
              </div>
            ))}

            {isLoading && <div className={styles.loading}>Thinking...</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask something..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              ➤
            </button>
            <button type="button" onClick={clearChat}>
              🗑️
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

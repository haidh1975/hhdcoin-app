'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import type { ChatMessage } from '@hhd-i/types';

interface ChatInterfaceProps {
  apiEndpoint: string;
  placeholder?: string;
  initialMessage?: string;
  enableFaqListener?: boolean;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser ? 'bg-brand' : 'bg-dark-600 border border-dark-500'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-black" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-brand" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export function ChatInterface({
  apiEndpoint,
  placeholder = 'Nhập tin nhắn...',
  initialMessage,
  enableFaqListener = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!initialMessage) return [];
    return [
      {
        id: generateId(),
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date().toISOString(),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (userContent: string) => {
      const trimmed = userContent.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      const assistantId = generateId();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        },
      ]);

      try {
        const allMessages = [...messages, userMessage];

        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulatedText += decoder.decode(value, { stream: true });

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: accumulatedText }
                : msg
            )
          );
        }
      } catch (err) {
        console.error('Chat error:', err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiEndpoint, isLoading, messages]
  );

  // FAQ listener
  useEffect(() => {
    if (!enableFaqListener) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) {
        setInput(detail);
        setTimeout(() => sendMessage(detail), 100);
      }
    };
    window.addEventListener('faq-click', handler);
    return () => window.removeEventListener('faq-click', handler);
  }, [enableFaqListener, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-brand" />
            </div>
            <p className="text-dark-400 text-sm">Bắt đầu cuộc trò chuyện...</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-dark-600 border border-dark-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-brand" />
            </div>
            <div className="chat-bubble-assistant px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
              <span className="text-xs text-dark-400">AI đang trả lời...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-dark-600 bg-dark-800 px-4 py-3">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-brand resize-none transition-colors leading-relaxed"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-black animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-black" />
            )}
          </button>
        </div>
        <p className="text-xs text-dark-500 mt-1.5 text-center">
          Nhấn Enter để gửi • Shift+Enter xuống dòng
        </p>
      </div>
    </div>
  );
}

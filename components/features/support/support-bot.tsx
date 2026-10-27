'use client';

import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  isFAQ?: boolean;
  ticketId?: string;
}

interface SupportBotProps {
  churchId?: string;
}

export default function SupportBot({ churchId }: SupportBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Hi! I\'m here to help with Kinship questions. You can ask me things like:\n\n• How do I join my church?\n• How do I post a need?\n• How do I give kudos?\n• I forgot my password\n\nOr describe your issue and I\'ll help find an answer or create a support ticket.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          churchId,
        }),
      });

      const data = await response.json();

      if (data.type === 'faq' && data.data) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: `**${data.data.question}**\n\n${data.data.answer}`,
          isFAQ: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else if (data.type === 'ticket') {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: `Ticket #${data.data.ticketId} created! ${data.data.message}\n\n${data.data.faq ? `**While you wait — this might help:**\n${data.data.faq.question}\n${data.data.faq.answer}` : ''}`,
          ticketId: data.data.ticketId,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else if (data.error) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: 'Sorry, something went wrong. Please try again.',
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Support bot error:', error);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'How do I join my church?',
    'How do I post a need?',
    'How do I give kudos?',
    'I forgot my password',
  ];

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b bg-indigo-50 rounded-t-lg">
        <h3 className="font-semibold text-indigo-900">Kinship Support</h3>
        <p className="text-sm text-indigo-600">Ask me anything or describe your issue</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : message.isFAQ
                  ? 'bg-green-50 border border-green-200 text-gray-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              {message.ticketId && (
                <p className="text-xs mt-2 opacity-75">
                  Your ticket: #{message.ticketId.slice(0, 8)}
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-500">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="px-4 pb-2">
        <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
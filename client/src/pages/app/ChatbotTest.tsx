import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  FileText,
  Clock,
  Zap,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ sourceId: string; title: string; chunkText?: string }>;
  tokensUsed?: number;
  latencyMs?: number;
  feedback?: 'up' | 'down' | null;
}

export const ChatbotTest: React.FC = () => {
  const { tenant } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `sandbox-${Math.random().toString(36).substring(7)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial welcome message from bot
  useEffect(() => {
    const greeting =
      tenant?.name
        ? `Hello! I am your AI assistant for ${tenant.name}. Ask me any question to test retrieval against your uploaded knowledge sources.`
        : 'Hello! I am ready to answer your questions grounded in your documentation.';
    setMessages([
      {
        role: 'assistant',
        content: greeting,
      },
    ]);
  }, [tenant]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    // Append user message
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const response = await apiRequest<{
        answer: string;
        sources: any[];
        tokensUsed: number;
        latencyMs: number;
        limitReached?: boolean;
      }>('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userText,
          sessionId,
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          tokensUsed: response.tokensUsed,
          latencyMs: response.latencyMs,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message || 'Failed to generate response'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (index: number, feedback: 'up' | 'down') => {
    const msg = messages[index];
    // Toggle or set feedback
    const newFeedback = msg.feedback === feedback ? null : feedback;
    setMessages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], feedback: newFeedback };
      return copy;
    });

    if (msg.id) {
      try {
        await apiRequest(`/chat/message/${msg.id}/feedback`, {
          method: 'POST',
          body: JSON.stringify({ feedback: newFeedback }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation reset. Ask a question to test live RAG retrieval.',
      },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-3xl font-black text-ink font-display">Test Sandbox</h1>
          <p className="text-sm text-ink-muted mt-1">
            Live internal playground hitting the real RAG pipeline with grounded citations.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleClear} icon={<RotateCcw className="w-3.5 h-3.5" />}>
          Reset Chat
        </Button>
      </div>

      {/* Main Sandbox Card */}
      <Card className="p-0 overflow-hidden flex flex-col h-[650px] shadow-lg">
        {/* Top telemetry bar */}
        <div className="px-6 py-3 bg-card border-b border-line flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Namespace: <strong className="text-ink">{tenant?.slug}</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span>Model: <strong className="text-ink">Gemini 1.5 Flash</strong></span>
            <span>Vector Store: <strong className="text-ink">Pinecone</strong></span>
          </div>
        </div>

        {/* Message history */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-card/20">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-2xl bg-coral-50 text-coral-500 border border-coral-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`space-y-2 max-w-xl ${
                  msg.role === 'user'
                    ? 'bg-coral-500 text-white rounded-3xl rounded-br-none p-4 shadow-sm'
                    : 'bg-surface text-ink border border-line rounded-3xl rounded-bl-none p-5 shadow-sm'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                {/* Grounded Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-3 border-t border-line/60">
                    <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-coral-500" /> Cited Sources:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          title={s.chunkText}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-line text-[11px] font-medium text-ink hover:border-coral-300 transition-colors"
                        >
                          {s.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Telemetry & Accuracy Feedback for assistant replies */}
                {msg.role === 'assistant' && (msg.tokensUsed !== undefined || msg.latencyMs !== undefined) && (
                  <div className="pt-2 flex items-center justify-between text-[11px] text-ink-light border-t border-line/40 mt-2">
                    <div className="flex items-center gap-3">
                      {msg.latencyMs && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {(msg.latencyMs / 1000).toFixed(2)}s
                        </span>
                      )}
                      {msg.tokensUsed && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" /> {msg.tokensUsed} tokens
                        </span>
                      )}
                    </div>

                    {/* Thumbs up/down accuracy feedback per TRD §12 */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFeedback(idx, 'up')}
                        className={`p-1 rounded hover:bg-card transition-colors ${
                          msg.feedback === 'up' ? 'text-emerald-600' : 'text-ink-light'
                        }`}
                        title="Good answer (grounded)"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleFeedback(idx, 'down')}
                        className={`p-1 rounded hover:bg-card transition-colors ${
                          msg.feedback === 'down' ? 'text-rose-600' : 'text-ink-light'
                        }`}
                        title="Bad answer (hallucination / unhelpful)"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing state */}
          {loading && (
            <div className="flex gap-3.5 items-center">
              <div className="w-8 h-8 rounded-2xl bg-coral-50 text-coral-500 border border-coral-200 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-surface border border-line rounded-2xl rounded-bl-none text-xs text-ink-muted flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-coral-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-coral-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-coral-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">Retrieving & generating grounded answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 bg-surface border-t border-line flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your uploaded documents..."
            className="flex-1 px-4 py-3 bg-card border border-line rounded-2xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
          />
          <Button type="submit" isLoading={loading} arrowChip size="md">
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};

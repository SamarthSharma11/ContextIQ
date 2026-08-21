import React, { useEffect, useState } from 'react';
import { Bot, Sparkles, Check, Send, RotateCcw } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';

export const Chatbot: React.FC = () => {
  const [name, setName] = useState('ContextIQ Assistant');
  const [greeting, setGreeting] = useState('Hello! How can I help you today?');
  const [accentColor, setAccentColor] = useState('#E8675F');
  const [placeholder, setPlaceholder] = useState('Ask a question...');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Preset accent colors
  const presetColors = ['#E8675F', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#17171A'];

  const fetchConfig = async () => {
    try {
      const data = await apiRequest('/chatbot');
      if (data.chatbotConfig) {
        setName(data.chatbotConfig.name || 'ContextIQ Assistant');
        setGreeting(data.chatbotConfig.greeting || 'Hello! How can I help you today?');
        setAccentColor(data.chatbotConfig.accentColor || '#E8675F');
        setPlaceholder(data.chatbotConfig.placeholder || 'Ask a question...');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await apiRequest('/chatbot', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          greeting,
          accentColor,
          placeholder,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update chatbot settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState rows={4} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-3xl font-black text-ink font-display">Chatbot Appearance</h1>
          <p className="text-sm text-ink-muted mt-1">
            Configure the name, brand accent color, and greeting shown across website embeds.
          </p>
        </div>
        <Button onClick={() => handleSave()} isLoading={saving} arrowChip>
          {savedSuccess ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Assistant Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleSave()}
                className="w-full px-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Initial Welcome Greeting
              </label>
              <textarea
                rows={3}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                onBlur={() => handleSave()}
                className="w-full px-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Input Placeholder Text
              </label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                onBlur={() => handleSave()}
                className="w-full px-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-3">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setAccentColor(color);
                      handleSave();
                    }}
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 ${
                      accentColor === color ? 'ring-2 ring-offset-2 ring-ink' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {accentColor === color && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => {
                    setAccentColor(e.target.value);
                    handleSave();
                  }}
                  className="w-9 h-9 rounded-2xl cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Live Interactive Preview Box */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-3 text-center">
              Live Widget Preview
            </span>

            {/* Widget Mock Frame */}
            <div className="w-full bg-white rounded-3xl border border-line shadow-2xl overflow-hidden flex flex-col h-[480px]">
              {/* Header */}
              <div
                className="p-4 text-white flex items-center justify-between shadow-sm"
                style={{ backgroundColor: accentColor }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-tight">{name}</div>
                    <div className="text-[10px] text-white/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                      Online & Grounded
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-4 bg-card/40 overflow-y-auto space-y-3">
                {/* Assistant greeting bubble */}
                <div className="flex gap-2 items-end">
                  <div
                    className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] shrink-0"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-white rounded-2xl rounded-bl-none border border-line text-xs text-ink shadow-sm max-w-[85%]">
                    {greeting}
                  </div>
                </div>

                {/* Sample user bubble */}
                <div className="flex justify-end">
                  <div
                    className="p-3 rounded-2xl rounded-br-none text-xs text-white max-w-[85%]"
                    style={{ backgroundColor: accentColor }}
                  >
                    Can you explain your pricing and features?
                  </div>
                </div>

                {/* Sample assistant grounded answer */}
                <div className="flex gap-2 items-end">
                  <div
                    className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] shrink-0"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1.5 max-w-[85%]">
                    <div className="p-3 bg-white rounded-2xl rounded-bl-none border border-line text-xs text-ink shadow-sm">
                      Our pricing starts at $49/mo for Growth with 1,000 sources and 10k monthly
                      conversations.
                    </div>
                    <div className="text-[10px] text-ink-muted pl-1">
                      Source: Pricing.pdf
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-line flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder={placeholder}
                  className="flex-1 px-3 py-2 bg-card rounded-xl text-xs text-ink focus:outline-none"
                />
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

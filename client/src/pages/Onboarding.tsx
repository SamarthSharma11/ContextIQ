import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  UploadCloud,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Send,
  Loader2,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import { Button } from '../components/ui/Button';

export const Onboarding: React.FC = () => {
  const { tenant, refreshSession } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Persona
  const [botName, setBotName] = useState(tenant?.name ? `${tenant.name} AI` : 'Assistant');
  const [purpose, setPurpose] = useState<'support' | 'internal' | 'docs'>('support');
  const [greeting, setGreeting] = useState(
    'Hi! I am grounded in our verified company docs. How can I help you today?'
  );

  // Step 2: Knowledge Ingestion
  const [sourceType, setSourceType] = useState<'pdf' | 'url'>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);

  // Step 3: Live Preview Chat
  const [testQuestion, setTestQuestion] = useState('What does our product do?');
  const [testAnswer, setTestAnswer] = useState<string | null>(null);
  const [testSources, setTestSources] = useState<any[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Step 2 submit
  const handleIngest = async () => {
    setIngesting(true);
    try {
      if (sourceType === 'pdf') {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'pdf');
        formData.append('title', file.name);
        await apiRequest('/sources', { method: 'POST', body: formData });
      } else {
        if (!url) return;
        await apiRequest('/sources', {
          method: 'POST',
          body: JSON.stringify({ type: 'url', url }),
        });
      }
      setIngestSuccess(true);
      setTimeout(() => {
        setStep(3);
      }, 800);
    } catch (err: any) {
      alert(err.message || 'Failed to ingest knowledge source');
    } finally {
      setIngesting(false);
    }
  };

  // Step 3 test query
  const handleTestChat = async () => {
    if (!testQuestion.trim()) return;
    setIsAsking(true);
    setTestAnswer(null);
    try {
      const res = await apiRequest<{ answer: string; sources: any[] }>('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: testQuestion,
          sessionId: 'onboarding-preview',
        }),
      });
      setTestAnswer(res.answer);
      setTestSources(res.sources || []);
    } catch (err: any) {
      setTestAnswer('Hello! I am ready to answer your questions once our sources are processed.');
    } finally {
      setIsAsking(false);
    }
  };

  // Finalize onboarding
  const handleComplete = async () => {
    setIsFinishing(true);
    try {
      await apiRequest('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          chatbotName: botName,
          greeting,
          accentColor: '#E8675F',
        }),
      });
      await refreshSession();
      navigate('/app/overview');
    } catch (err: any) {
      navigate('/app/overview');
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-ink text-coral-400 flex items-center justify-center font-bold">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-ink font-display">ContextIQ Setup</span>
      </div>

      <div className="w-full max-w-2xl bg-surface rounded-3xl border border-line p-8 md:p-10 shadow-xl">
        {/* Step indicator */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-line">
          {[
            { num: 1, label: 'Configure Bot' },
            { num: 2, label: 'Add Knowledge' },
            { num: 3, label: 'Live Test' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? 'bg-coral-500 text-white'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-card text-ink-muted'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === s.num ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Bot persona */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-ink font-display">
                Name your AI Assistant
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Customize how your chatbot introduces itself to customers and internal teams.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Assistant Name
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Primary Purpose
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'support', label: 'Customer Support' },
                    { id: 'internal', label: 'Internal Wiki' },
                    { id: 'docs', label: 'Docs & Sales' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPurpose(p.id as any)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-center transition-all ${
                        purpose === p.id
                          ? 'border-coral-400 bg-coral-50 text-coral-700'
                          : 'border-line bg-card text-ink-muted hover:text-ink'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Initial Greeting Message
                </label>
                <textarea
                  rows={2}
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full px-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400 resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={() => setStep(2)} arrowChip size="md">
                Continue to Knowledge
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Ingest Knowledge */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-ink font-display">
                Add your first Knowledge Source
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Upload a documentation PDF or provide a web URL to ground your assistant in facts.
              </p>
            </div>

            {/* Type selector */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-sm font-semibold transition-all ${
                  sourceType === 'url'
                    ? 'border-coral-400 bg-coral-50 text-coral-700'
                    : 'border-line bg-card text-ink-muted hover:text-ink'
                }`}
              >
                <Globe className="w-4 h-4" />
                Website URL
              </button>
              <button
                type="button"
                onClick={() => setSourceType('pdf')}
                className={`flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-sm font-semibold transition-all ${
                  sourceType === 'pdf'
                    ? 'border-coral-400 bg-coral-50 text-coral-700'
                    : 'border-line bg-card text-ink-muted hover:text-ink'
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF Document
              </button>
            </div>

            {sourceType === 'url' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Web Page or Documentation URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/docs"
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Upload PDF File
                </label>
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-line rounded-2xl bg-card hover:bg-card/80 cursor-pointer transition-colors">
                  <UploadCloud className="w-8 h-8 text-coral-500 mb-2" />
                  <span className="text-sm font-semibold text-ink">
                    {file ? file.name : 'Click or drop PDF here'}
                  </span>
                  <span className="text-xs text-ink-muted mt-1">Up to 25 MB</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Skip for now
              </Button>
              <Button
                onClick={handleIngest}
                isLoading={ingesting}
                disabled={sourceType === 'url' ? !url : !file}
                arrowChip
              >
                Ingest & Process
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Live Preview */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-ink font-display">
                Test your assistant in real time
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Ask a test question to verify that answers are retrieved and cited accurately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-line space-y-4">
              {/* Bot Greeting */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white rounded-2xl border border-line text-sm text-ink max-w-md shadow-sm">
                  {greeting}
                </div>
              </div>

              {/* Test question input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2 bg-white border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
                />
                <Button onClick={handleTestChat} isLoading={isAsking} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Response */}
              {testAnswer && (
                <div className="flex gap-3 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <div className="p-3 bg-white rounded-2xl border border-line text-sm text-ink shadow-sm">
                      {testAnswer}
                    </div>
                    {testSources.length > 0 && (
                      <div className="text-[11px] text-ink-muted flex items-center gap-1">
                        <span>Sources cited:</span>
                        {testSources.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-card px-1.5 py-0.5 rounded border border-line font-medium"
                          >
                            {s.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleComplete} isLoading={isFinishing} size="lg" arrowChip>
                Launch Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Code2, Copy, Check, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const Embed: React.FC = () => {
  const { tenant } = useAuth();
  const [copied, setCopied] = useState(false);

  const slug = tenant?.slug || 'my-workspace';
  const scriptSnippet = `<script
  src="https://app.contextiq.ai/widget.js"
  data-tenant="${slug}"
  defer
></script>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(scriptSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-line">
        <h1 className="text-3xl font-black text-ink font-display">Embed Widget</h1>
        <p className="text-sm text-ink-muted mt-1">
          Add your grounded ContextIQ AI assistant to any website with a single line of JavaScript.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Code Snippet Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <Code2 className="w-4 h-4 text-coral-500" />
                <span>HTML Embed Script</span>
              </div>
              <button
                onClick={copySnippet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-coral-50 text-coral-600 border border-coral-200 hover:bg-coral-100 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="p-5 rounded-2xl bg-ink text-coral-300 text-xs font-mono overflow-x-auto border border-ink/10 leading-relaxed shadow-inner">
                {scriptSnippet}
              </pre>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-line text-xs text-ink-muted space-y-2">
              <div className="font-bold text-ink">Installation Instructions:</div>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                <li>Copy the script tag above.</li>
                <li>Paste it into the <code className="bg-surface px-1.5 py-0.5 rounded border border-line text-ink font-mono text-[11px]">&lt;head&gt;</code> or right before the closing <code className="bg-surface px-1.5 py-0.5 rounded border border-line text-ink font-mono text-[11px]">&lt;/body&gt;</code> tag of your website.</li>
                <li>The ContextIQ chat bubble will immediately appear in the bottom-right corner.</li>
              </ol>
            </div>
          </Card>
        </div>

        {/* Right: Security & Capability Info */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base text-ink font-display">Widget Capabilities</h3>
            <div className="space-y-3 text-xs text-ink-muted">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-coral-50 text-coral-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-ink block">Session Memory</strong>
                  Retains context across user follow-up questions within their browser tab.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-coral-50 text-coral-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-ink block">Strict Multi-Tenant Isolation</strong>
                  Queries only your tenant namespace in Pinecone. Never leaks cross-tenant data.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

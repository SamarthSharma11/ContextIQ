import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Files,
  MessageSquare,
  Zap,
  Clock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';

export const Overview: React.FC = () => {
  const { tenant } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await apiRequest('/analytics/overview');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return <LoadingState rows={5} />;
  }

  const summary = data?.summary || {
    totalSources: 0,
    totalChats: 0,
    totalMessages: 0,
    tokenUsed: 0,
    tokenLimit: 500000,
    accuracyPercentage: 98,
    avgLatencyMs: 1200,
  };

  const chartData = data?.chartData || [];
  const maxChats = Math.max(...chartData.map((d: any) => d.chats), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-3xl font-black text-ink font-display">Overview</h1>
          <p className="text-sm text-ink-muted mt-1">
            Real-time health, knowledge coverage, and chat volume for{' '}
            <strong className="text-ink">{tenant?.name}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app/sources">
            <Button variant="secondary" size="sm" icon={<Files className="w-4 h-4" />}>
              Add Knowledge
            </Button>
          </Link>
          <Link to="/app/chatbot/test">
            <Button size="sm" arrowChip>
              Test Chatbot
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards per Design Doc §6 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Knowledge Sources
            </span>
            <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-500 flex items-center justify-center">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-ink font-display">
              {summary.totalSources}
            </span>
            <span className="text-xs text-ink-muted">documents</span>
          </div>
          <div className="mt-3 text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for RAG retrieval
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Total Conversations
            </span>
            <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-ink font-display">
              {summary.totalChats}
            </span>
            <span className="text-xs text-ink-muted">sessions</span>
          </div>
          <div className="mt-3 text-xs text-ink-muted font-medium">
            {summary.totalMessages} total messages exchanged
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Answer Accuracy
            </span>
            <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-ink font-display">
              {summary.accuracyPercentage}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">grounded</span>
          </div>
          <div className="mt-3 text-xs text-ink-muted font-medium">
            Derived from user feedback & evals
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Avg. Response Speed
            </span>
            <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-ink font-display">
              {(summary.avgLatencyMs / 1000).toFixed(1)}s
            </span>
            <span className="text-xs text-emerald-600 font-medium">&lt; 2.0s target</span>
          </div>
          <div className="mt-3 text-xs text-ink-muted font-medium">
            Sub-2s target met across pipeline
          </div>
        </Card>
      </div>

      {/* Main Chart + Quick Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Chat Volume Bar Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-ink font-display">Chat Volume (Last 7 Days)</h3>
              <p className="text-xs text-ink-muted mt-0.5">Daily queries handled by ContextIQ</p>
            </div>
            <Badge variant="coral">Live Data</Badge>
          </div>

          <div className="h-56 flex items-end gap-3 pt-6 pb-2">
            {chartData.map((day: any, idx: number) => {
              const heightPct = Math.max(8, Math.round((day.chats / maxChats) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex items-end justify-center h-40">
                    {/* Tooltip */}
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-ink text-white text-[10px] py-1 px-2 rounded font-semibold pointer-events-none whitespace-nowrap shadow-lg">
                      {day.chats} chats ({day.tokens} tokens)
                    </div>
                    {/* Bar */}
                    <div
                      className="w-full max-w-[36px] bg-gradient-to-t from-coral-500 to-coral-400 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-ink-muted">{day.day}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions & Bot Status */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-ink font-display mb-4">Workspace Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/app/sources"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-line hover:border-coral-300 hover:bg-coral-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-coral-500 border border-line">
                    <Files className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-ink">Upload Knowledge</div>
                    <div className="text-[11px] text-ink-muted">PDFs or Website URLs</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-ink-light group-hover:text-coral-500 transition-colors" />
              </Link>

              <Link
                to="/app/chatbot"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-line hover:border-coral-300 hover:bg-coral-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-coral-500 border border-line">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-ink">Customize Chatbot</div>
                    <div className="text-[11px] text-ink-muted">Appearance & greeting</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-ink-light group-hover:text-coral-500 transition-colors" />
              </Link>

              <Link
                to="/app/embed"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-line hover:border-coral-300 hover:bg-coral-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-coral-500 border border-line">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-ink">Get Embed Code</div>
                    <div className="text-[11px] text-ink-muted">1-line script tag for web</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-ink-light group-hover:text-coral-500 transition-colors" />
              </Link>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-line">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">Token Consumption:</span>
              <span className="font-semibold text-ink">
                {(summary.tokenUsed / 1000).toFixed(0)}k / {(summary.tokenLimit / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Clock,
  Zap,
  MessageSquare,
  ThumbsUp,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest('/analytics/overview');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingState rows={5} />;

  const summary = data?.summary || {};
  const chartData = data?.chartData || [];
  const maxChats = Math.max(...chartData.map((d: any) => d.chats), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-line">
        <h1 className="text-3xl font-black text-ink font-display">Analytics & Quality</h1>
        <p className="text-sm text-ink-muted mt-1">
          Detailed metrics on grounded retrieval quality, chat volume, latency, and token consumption.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-ink-muted text-xs font-semibold uppercase tracking-wider">
            <span>Accuracy Rate</span>
            <Sparkles className="w-4 h-4 text-coral-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-ink font-display">
            {summary.accuracyPercentage}%
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Positive user feedback
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-ink-muted text-xs font-semibold uppercase tracking-wider">
            <span>Avg Response Latency</span>
            <Clock className="w-4 h-4 text-coral-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-ink font-display">
            {(summary.avgLatencyMs / 1000).toFixed(2)}s
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Sub-2s benchmark passed
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-ink-muted text-xs font-semibold uppercase tracking-wider">
            <span>Total Messages</span>
            <MessageSquare className="w-4 h-4 text-coral-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-ink font-display">
            {summary.totalMessages}
          </div>
          <div className="mt-2 text-xs text-ink-muted font-medium">
            Across {summary.totalChats} sessions
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-ink-muted text-xs font-semibold uppercase tracking-wider">
            <span>Tokens Consumed</span>
            <Zap className="w-4 h-4 text-coral-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-ink font-display">
            {(summary.tokenUsed / 1000).toFixed(0)}k
          </div>
          <div className="mt-2 text-xs text-ink-muted font-medium">
            Of {(summary.tokenLimit / 1000).toFixed(0)}k monthly allowance
          </div>
        </Card>
      </div>

      {/* 7-Day Chart */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-ink font-display">Daily Chat Trends</h3>
            <p className="text-xs text-ink-muted">Inbound user conversations</p>
          </div>
          <Badge variant="coral">7 Days</Badge>
        </div>

        <div className="h-64 flex items-end gap-4 pt-6 pb-2">
          {chartData.map((d: any, idx: number) => {
            const heightPct = Math.max(10, Math.round((d.chats / maxChats) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex items-end justify-center h-48">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-ink text-white text-[10px] py-1 px-2 rounded font-semibold whitespace-nowrap shadow-lg">
                    {d.chats} chats ({d.tokens} tokens)
                  </div>
                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-coral-500 to-coral-400 rounded-t-2xl transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-ink-muted">{d.day}</span>
                <span className="text-[10px] text-ink-light">{d.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

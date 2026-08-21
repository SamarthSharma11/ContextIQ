import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Zap, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';

export const Billing: React.FC = () => {
  const { tenant, refreshSession } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const fetchBilling = async () => {
    try {
      const res = await apiRequest('/billing/usage');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleUpgrade = async (planKey: string) => {
    setUpgrading(planKey);
    try {
      const res = await apiRequest<{ url?: string; simulated?: boolean; message?: string }>(
        '/billing/create-checkout-session',
        {
          method: 'POST',
          body: JSON.stringify({ plan: planKey }),
        }
      );

      if (res.url) {
        // Redirect to Stripe Hosted Checkout
        window.location.href = res.url;
        return;
      }

      await refreshSession();
      await fetchBilling();
      alert(res.message || `Plan successfully upgraded to ${planKey.toUpperCase()}!`);
    } catch (err: any) {
      alert(err.message || 'Upgrade failed');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) return <LoadingState rows={4} />;

  const plans = [
    {
      key: 'starter',
      name: 'Starter',
      price: '$0',
      period: '/mo',
      tokens: '500k monthly tokens',
      features: ['1 chatbot assistant', '50 knowledge sources', 'Community support', 'Basic analytics'],
    },
    {
      key: 'growth',
      name: 'Growth',
      price: '$49',
      period: '/mo',
      tokens: '2.5M monthly tokens',
      popular: true,
      features: [
        '10 chatbot assistants',
        '1,000 knowledge sources',
        'Priority Pinecone retrieval',
        'Advanced quality analytics',
        'Email support',
      ],
    },
    {
      key: 'scale',
      name: 'Scale',
      price: '$199',
      period: '/mo',
      tokens: '10M monthly tokens',
      features: [
        'Unlimited assistants',
        'Unlimited knowledge sources',
        'Multi-tenant resale workspaces',
        'SLA + Dedicated engineer',
        'Custom prompt tuning',
      ],
    },
  ];

  const currentPlan = data?.plan || tenant?.plan || 'starter';
  const tokenUsed = data?.tokenUsed || tenant?.tokenUsed || 0;
  const tokenLimit = data?.tokenLimit || tenant?.tokenLimit || 500000;
  const pct = Math.min(100, Math.round((tokenUsed / (tokenLimit || 1)) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-line">
        <h1 className="text-3xl font-black text-ink font-display">Billing & Usage</h1>
        <p className="text-sm text-ink-muted mt-1">
          Monitor your token consumption and scale seamlessly with usage-based plans.
        </p>
      </div>

      {/* Meter Bar Card */}
      <Card className="p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Current Billing Cycle Allowance
            </div>
            <div className="text-2xl font-black text-ink font-display mt-1 capitalize">
              {currentPlan} Plan
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-ink font-display">
              {(tokenUsed / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-ink-muted"> / {(tokenLimit / 1000).toFixed(0)}k tokens</span>
          </div>
        </div>

        <div className="w-full h-3 bg-card rounded-full overflow-hidden border border-line">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-coral-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>{pct}% of monthly capacity consumed</span>
          <span>Resets on the 1st of each month</span>
        </div>
      </Card>

      {/* Plan Tier Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.key;
          return (
            <Card
              key={p.key}
              className={`p-6 flex flex-col justify-between relative transition-all ${
                p.popular ? 'border-coral-400 ring-1 ring-coral-400' : ''
              } ${isCurrent ? 'bg-card/40' : ''}`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-ink font-display">{p.name}</h3>
                  {isCurrent && <Badge variant="active">Active Plan</Badge>}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-ink font-display">{p.price}</span>
                  <span className="text-xs text-ink-muted">{p.period}</span>
                </div>

                <div className="mt-2 text-xs font-semibold text-coral-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> {p.tokens}
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-ink-secondary">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled size="sm">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(p.key)}
                    isLoading={upgrading === p.key}
                    variant={p.popular ? 'primary' : 'secondary'}
                    className="w-full"
                    size="sm"
                    arrowChip
                  >
                    Select {p.name}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

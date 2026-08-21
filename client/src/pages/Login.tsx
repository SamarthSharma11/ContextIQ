import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { login, tenant } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // AuthContext handles setting state, navigate based on onboarding
      const savedToken = localStorage.getItem('contextiq_token');
      if (savedToken) {
        navigate('/app/overview');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4">
      {/* Brand icon */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-3xl bg-ink text-coral-400 flex items-center justify-center font-bold shadow-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="text-2xl font-black tracking-tight text-ink font-display">ContextIQ</span>
      </div>

      <div className="w-full max-w-md bg-surface rounded-3xl border border-line p-8 md:p-10 shadow-xl">
        <h1 className="text-2xl font-black text-ink font-display">Welcome back</h1>
        <p className="text-sm text-ink-muted mt-1.5">Sign in to manage your AI knowledge assistants</p>

        {error && (
          <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="samarth@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={loading} className="w-full" size="lg" arrowChip>
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-line text-center text-xs text-ink-muted">
          Don't have a workspace yet?{' '}
          <Link to="/signup" className="text-coral-500 font-semibold hover:underline">
            Create workspace
          </Link>
        </div>
      </div>
    </div>
  );
};

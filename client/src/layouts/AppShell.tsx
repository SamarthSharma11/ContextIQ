import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Files,
  Bot,
  MessageSquareCode,
  Code2,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const AppShell: React.FC = () => {
  const { user, tenant, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!user || !tenant) {
    return null;
  }

  // Define nav links with role restrictions per App Flow §5
  const navItems = [
    {
      label: 'Overview',
      path: '/app/overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['owner', 'admin', 'editor', 'viewer'],
    },
    {
      label: 'Knowledge Sources',
      path: '/app/sources',
      icon: <Files className="w-4 h-4" />,
      allowedRoles: ['owner', 'admin', 'editor'],
    },
    {
      label: 'Chatbot Config',
      path: '/app/chatbot',
      icon: <Bot className="w-4 h-4" />,
      allowedRoles: ['owner', 'admin', 'editor'],
    },
    {
      label: 'Test Sandbox',
      path: '/app/chatbot/test',
      icon: <MessageSquareCode className="w-4 h-4" />,
      allowedRoles: ['owner', 'admin', 'editor'],
    },
    {
      label: 'Embed Snippet',
      path: '/app/embed',
      icon: <Code2 className="w-4 h-4" />,
      allowedRoles: ['owner', 'admin'],
    },
    {
      label: 'Analytics',
      path: '/app/analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      allowedRoles: ['owner', 'admin', 'viewer'],
    },
    {
      label: 'Team & Roles',
      path: '/app/team',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['owner', 'admin'],
    },
    {
      label: 'Billing & Plan',
      path: '/app/billing',
      icon: <CreditCard className="w-4 h-4" />,
      allowedRoles: ['owner'],
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: <Settings className="w-4 h-4" />,
      allowedRoles: ['owner', 'admin'],
    },
  ];

  const visibleNav = navItems.filter((item) => item.allowedRoles.includes(user.role));
  const isOverLimit = tenant.tokenUsed >= tenant.tokenLimit || tenant.status === 'paused';

  return (
    <div className="min-h-screen bg-canvas dark:bg-dark-canvas flex flex-col md:flex-row text-ink dark:text-dark-ink antialiased">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface dark:bg-dark-surface border-b border-line dark:border-dark-line">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="ContextIQ" className="w-8 h-8 rounded-xl object-contain shadow-sm" />
          <span className="font-bold text-ink dark:text-dark-ink font-display">{tenant.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-lg text-ink-muted dark:text-dark-ink-muted hover:text-ink dark:hover:text-dark-ink"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Persistent Sidebar */}
      <aside
        className={`${
          mobileNavOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-surface dark:bg-dark-surface border-r border-line dark:border-dark-line shrink-0 p-5 z-40`}
      >
        {/* Workspace Brand Block */}
        <div className="pb-5 mb-5 border-b border-line">
          <Link to="/app/overview" className="flex items-center gap-3 group">
            <img
              src="/logo-icon.png"
              alt="ContextIQ"
              className="w-10 h-10 rounded-2xl object-contain shadow-sm transition-transform group-hover:scale-105"
            />
            <div className="overflow-hidden">
              <h2 className="font-bold text-ink font-display text-sm truncate leading-tight">
                {tenant.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-medium text-ink-muted capitalize">
                  {tenant.plan} Plan
                </span>
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1 flex-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-coral-50 text-coral-600 font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-card'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Usage bar mini-widget */}
        <div className="p-3.5 rounded-2xl bg-card border border-line mb-4">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
            <span>Monthly Tokens</span>
            <span className="font-semibold text-ink">
              {Math.min(100, Math.round((tenant.tokenUsed / (tenant.tokenLimit || 1)) * 100))}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isOverLimit ? 'bg-rose-500' : 'bg-coral-500'
              }`}
              style={{
                width: `${Math.min(100, (tenant.tokenUsed / (tenant.tokenLimit || 1)) * 100)}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-ink-light mt-1.5 flex justify-between">
            <span>{(tenant.tokenUsed / 1000).toFixed(0)}k used</span>
            <span>{(tenant.tokenLimit / 1000).toFixed(0)}k limit</span>
          </div>
        </div>

        {/* User profile footer */}
        <div className="pt-4 border-t border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-ink truncate leading-tight">
                {user.name}
              </div>
              <div className="text-[10px] text-ink-muted capitalize">{user.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Over-limit Alert Banner per App Flow §6 */}
        {isOverLimit && (
          <div className="bg-rose-500 text-white px-6 py-2.5 flex items-center justify-between text-xs font-medium shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Plan Limit Reached:</strong> Your AI assistant is paused because you
                have used all allocated tokens for this cycle.
              </span>
            </div>
            {user.role === 'owner' && (
              <button
                onClick={() => navigate('/app/billing')}
                className="px-3 py-1 bg-white text-rose-600 font-semibold rounded-full hover:bg-rose-50 transition-colors text-xs shrink-0"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        )}

        {/* Page Viewport */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

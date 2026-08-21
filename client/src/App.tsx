import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppShell } from './layouts/AppShell';

// Auth Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';

// App Dashboard Pages
import { Overview } from './pages/app/Overview';
import { Sources } from './pages/app/Sources';
import { SourceDetail } from './pages/app/SourceDetail';
import { Chatbot } from './pages/app/Chatbot';
import { ChatbotTest } from './pages/app/ChatbotTest';
import { Embed } from './pages/app/Embed';
import { Analytics } from './pages/app/Analytics';
import { Team } from './pages/app/Team';
import { Billing } from './pages/app/Billing';
import { Settings } from './pages/app/Settings';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, tenant, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-coral-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || !tenant) {
    return <Navigate to="/login" replace />;
  }

  if (!tenant.onboardingCompleted && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Root index redirector
const RootRedirect: React.FC = () => {
  const { user, tenant, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-coral-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user && tenant) {
    return <Navigate to={tenant.onboardingCompleted ? '/app/overview' : '/onboarding'} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Onboarding Wizard */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Authenticated App Shell */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="sources" element={<Sources />} />
            <Route path="sources/:id" element={<SourceDetail />} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="chatbot/test" element={<ChatbotTest />} />
            <Route path="embed" element={<Embed />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="team" element={<Team />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

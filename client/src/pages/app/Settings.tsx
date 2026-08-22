import React from 'react';
import { Settings as SettingsIcon, Shield, Key, AlertTriangle, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const Settings: React.FC = () => {
  const { tenant, user, logout } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-line">
        <h1 className="text-3xl font-black text-ink font-display">Workspace Settings</h1>
        <p className="text-sm text-ink-muted mt-1">
          Manage workspace metadata, vector isolation namespaces, and API tokens.
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Workspace Info */}
        <Card className="p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 font-bold text-ink text-sm">
            <Building2 className="w-4 h-4 text-coral-500" />
            <span>Workspace Metadata</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Workspace Name
              </label>
              <div className="px-4 py-2.5 bg-card rounded-xl text-sm font-semibold text-ink border border-line">
                {tenant?.name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Workspace Slug (ID)
              </label>
              <div className="px-4 py-2.5 bg-card rounded-xl text-sm font-mono text-ink border border-line">
                {tenant?.slug}
              </div>
            </div>
          </div>
        </Card>

        {/* Vector Namespace Security */}
        <Card className="p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 font-bold text-ink text-sm">
            <Shield className="w-4 h-4 text-coral-500" />
            <span>Data Isolation & Vector Namespace</span>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            All vectors extracted from your documents are strictly partitioned into the isolated
            Pinecone namespace:
          </p>

          <div className="p-3 bg-card rounded-xl border border-line text-xs font-mono text-ink">
            namespace: <span className="text-coral-600 font-bold">{tenant?.slug}</span>
          </div>
        </Card>

        {/* Danger Zone */}
        {user?.role === 'owner' && (
          <div className="p-6 md:p-8 bg-rose-50 dark:bg-rose-950/40 rounded-3xl border border-rose-200 dark:border-rose-800 space-y-4">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </div>

            <p className="text-xs text-rose-600 dark:text-rose-400/80 leading-relaxed">
              Deleting this workspace will permanently erase all uploaded knowledge documents,
              vector indexes, chat logs, team invites, and cancel billing subscriptions. This action
              cannot be undone.
            </p>

            <div className="pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (
                    prompt(
                      `Type "${tenant?.name}" to confirm workspace deletion:`
                    ) === tenant?.name
                  ) {
                    alert('Workspace marked for deletion.');
                    logout();
                  }
                }}
              >
                Delete Workspace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

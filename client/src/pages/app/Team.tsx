import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Mail, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/ui/LoadingState';

export const Team: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [inviting, setInviting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      const data = await apiRequest('/team');
      setUsers(data.users || []);
      setInvites(data.invites || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteUrl(null);
    try {
      const res = await apiRequest('/team/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });
      setInviteUrl(res.inviteUrl || 'Invite created');
      await fetchTeam();
      setInviteEmail('');
    } catch (err: any) {
      alert(err.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiRequest(`/team/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      await fetchTeam();
    } catch (err: any) {
      alert(err.message || 'Failed to change role');
    }
  };

  const handleRemoveUser = async (userId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from this workspace?`)) return;
    try {
      await apiRequest(`/team/${userId}`, { method: 'DELETE' });
      await fetchTeam();
    } catch (err: any) {
      alert(err.message || 'Failed to remove user');
    }
  };

  if (loading) return <LoadingState rows={4} />;

  const isOwner = user?.role === 'owner';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-3xl font-black text-ink font-display">Team & Roles</h1>
          <p className="text-sm text-ink-muted mt-1">
            Manage workspace members and their role permissions (Owner, Admin, Editor, Viewer).
          </p>
        </div>
        {isOwner && (
          <Button
            onClick={() => setIsInviteOpen(true)}
            icon={<UserPlus className="w-4 h-4" />}
            arrowChip
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* Team Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card border-b border-line text-xs font-semibold text-ink-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
                {isOwner && <th className="px-6 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-card/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center font-bold text-xs uppercase">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-ink font-display text-sm">{u.name}</div>
                        <div className="text-xs text-ink-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isOwner && u._id !== user?.id && u.role !== 'owner' ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-3 py-1.5 bg-card border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold capitalize bg-card px-2.5 py-1 rounded-full border border-line">
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="ready">{u.status || 'active'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-ink-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  {isOwner && (
                    <td className="px-6 py-4 text-right">
                      {u._id !== user?.id && (
                        <button
                          onClick={() => handleRemoveUser(u._id, u.name)}
                          className="p-1.5 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Team Member">
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
            >
              <option value="admin">Admin (Can manage sources & config)</option>
              <option value="editor">Editor (Can upload sources & test bot)</option>
              <option value="viewer">Viewer (Read-only analytics & chats)</option>
            </select>
          </div>

          {inviteUrl && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              Invitation link generated: <br />
              <code className="text-[11px] font-mono break-all">{inviteUrl}</code>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsInviteOpen(false)}>
              Close
            </Button>
            <Button type="submit" isLoading={inviting} arrowChip>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

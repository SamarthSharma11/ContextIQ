import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Globe,
  Trash2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';

export const SourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [source, setSource] = useState<any>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSource = async () => {
    try {
      const data = await apiRequest(`/sources/${id}`);
      setSource(data.source);
      setChunks(data.chunks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSource();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this source and all its Pinecone vectors permanently?')) return;
    try {
      await apiRequest(`/sources/${id}`, { method: 'DELETE' });
      navigate('/app/sources');
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const copyChunk = (text: string, chunkId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(chunkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <LoadingState rows={5} />;
  if (!source) return <div>Source not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <Link
            to="/app/sources"
            className="p-2 rounded-xl border border-line bg-surface hover:bg-card text-ink-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-ink font-display">{source.title}</h1>
              <Badge variant={source.status}>{source.status}</Badge>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">{source.origin}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="danger" size="sm" onClick={handleDelete} icon={<Trash2 className="w-4 h-4" />}>
            Delete Source
          </Button>
        </div>
      </div>

      {/* Meta Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-coral-50 text-coral-500 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-muted">Total Chunks</div>
            <div className="text-xl font-bold text-ink font-display">{chunks.length}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-coral-50 text-coral-500 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-muted">Source Type</div>
            <div className="text-xl font-bold text-ink font-display uppercase">{source.type}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-muted">Vector Storage</div>
            <div className="text-xl font-bold text-ink font-display">Pinecone Synced</div>
          </div>
        </Card>
      </div>

      {/* Extracted Chunks List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink font-display">Extracted Text Chunks</h2>
          <span className="text-xs text-ink-muted">Target ~500 tokens / chunk</span>
        </div>

        <div className="space-y-4">
          {chunks.map((chunk, idx) => (
            <Card key={chunk._id || idx} className="p-5 relative group">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-card border border-line flex items-center justify-center text-xs font-bold text-ink-muted">
                    {chunk.chunkIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-ink">
                    Chunk #{chunk.chunkIndex}
                  </span>
                  <span className="text-xs text-ink-muted">• {chunk.tokenCount} tokens</span>
                </div>
                <button
                  onClick={() => copyChunk(chunk.text, chunk._id)}
                  className="p-1.5 rounded-lg border border-line text-ink-muted hover:text-ink hover:bg-card transition-colors flex items-center gap-1 text-xs"
                >
                  {copiedId === chunk._id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">
                {chunk.text}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

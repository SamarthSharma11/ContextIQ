import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Files,
  Plus,
  Globe,
  FileText,
  Trash2,
  ExternalLink,
  UploadCloud,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';

export interface SourceItem {
  _id: string;
  type: 'pdf' | 'url';
  title: string;
  origin: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  chunkCount: number;
  errorMessage?: string;
  createdAt: string;
}

export const Sources: React.FC = () => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Ingest Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState<'pdf' | 'url'>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      const data = await apiRequest<SourceItem[]>('/sources');
      setSources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();

    // Poll every 3.5 seconds if there are processing or queued sources
    const interval = setInterval(() => {
      setSources((prev) => {
        const hasPending = prev.some((s) => s.status === 'processing' || s.status === 'queued');
        if (hasPending) {
          fetchSources();
        }
        return prev;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (sourceType === 'pdf') {
        if (!file) throw new Error('Please select a PDF file');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'pdf');
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
        await apiRequest('/sources', { method: 'POST', body: formData });
      } else {
        if (!url) throw new Error('Please enter a valid URL');
        await apiRequest('/sources', {
          method: 'POST',
          body: JSON.stringify({ type: 'url', url }),
        });
      }

      setIsModalOpen(false);
      setUrl('');
      setFile(null);
      await fetchSources();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit source');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSource = async (id: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title}"? This will permanently remove its chunks and Pinecone vectors.`
      )
    ) {
      return;
    }

    try {
      await apiRequest(`/sources/${id}`, { method: 'DELETE' });
      setSources(sources.filter((s) => s._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete source');
    }
  };

  const filteredSources = sources.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-3xl font-black text-ink font-display">Knowledge Sources</h1>
          <p className="text-sm text-ink-muted mt-1">
            Upload PDFs or index website URLs to train your grounded AI chatbot.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          arrowChip
        >
          Add Source
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or URLs..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
          />
        </div>
        <button
          onClick={fetchSources}
          className="p-2 rounded-xl border border-line bg-surface text-ink-muted hover:text-ink hover:bg-card transition-colors"
          title="Refresh sources"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Sources List */}
      {loading ? (
        <LoadingState rows={4} />
      ) : filteredSources.length === 0 ? (
        <EmptyState
          icon={<Files className="w-7 h-7" />}
          title="No knowledge sources found"
          description="Upload your first documentation PDF or paste a website URL to start answering questions."
          actionLabel="Add Knowledge Source"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredSources.map((source) => (
            <Card
              key={source._id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-coral-300"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center text-coral-500 shrink-0">
                  {source.type === 'pdf' ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/app/sources/${source._id}`}
                      className="font-bold text-ink hover:text-coral-500 transition-colors font-display text-sm md:text-base"
                    >
                      {source.title}
                    </Link>
                    <Badge variant={source.status}>{source.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                    <span className="truncate max-w-xs">{source.origin}</span>
                    <span>•</span>
                    <span>{source.chunkCount} vector chunks</span>
                    <span>•</span>
                    <span>{new Date(source.createdAt).toLocaleDateString()}</span>
                  </div>
                  {source.errorMessage && (
                    <div className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {source.errorMessage}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link to={`/app/sources/${source._id}`}>
                  <Button variant="secondary" size="sm">
                    Inspect Chunks
                  </Button>
                </Link>
                <button
                  onClick={() => handleDeleteSource(source._id, source.title)}
                  className="p-2 rounded-xl text-ink-muted hover:text-rose-600 hover:bg-rose-50 border border-line transition-colors"
                  title="Delete source"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ingestion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Knowledge Source"
      >
        <form onSubmit={handleAddSource} className="space-y-5">
          {submitError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {submitError}
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSourceType('url')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-semibold transition-all ${
                sourceType === 'url'
                  ? 'border-coral-400 bg-coral-50 text-coral-700'
                  : 'border-line bg-card text-ink-muted hover:text-ink'
              }`}
            >
              <Globe className="w-4 h-4" />
              Website URL
            </button>
            <button
              type="button"
              onClick={() => setSourceType('pdf')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-semibold transition-all ${
                sourceType === 'pdf'
                  ? 'border-coral-400 bg-coral-50 text-coral-700'
                  : 'border-line bg-card text-ink-muted hover:text-ink'
              }`}
            >
              <FileText className="w-4 h-4" />
              PDF Document
            </button>
          </div>

          {sourceType === 'url' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Documentation or Webpage URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.yourcompany.com/guide"
                className="w-full px-4 py-2.5 bg-card border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral-400"
              />
              <p className="text-[11px] text-ink-muted mt-1.5">
                ContextIQ will automatically fetch, clean, chunk, and embed the text content.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                PDF Document
              </label>
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-line rounded-2xl bg-card hover:bg-card/80 cursor-pointer transition-colors">
                <UploadCloud className="w-8 h-8 text-coral-500 mb-2" />
                <span className="text-sm font-semibold text-ink">
                  {file ? file.name : 'Select or drop PDF file'}
                </span>
                <span className="text-xs text-ink-muted mt-1">PDFs up to 25 MB supported</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files && setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} arrowChip>
              Start Ingestion
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

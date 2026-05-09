import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ChevronUp, ChevronDown, Trash2, Eye, EyeOff, ArrowLeft, ChevronDown as ChevronDownIcon } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const BLOCK_TYPES = [
  { value: 'hero', label: 'Hero', description: 'Large header with title and CTA' },
  { value: 'room_list', label: 'Room List', description: 'Showcase your available rooms' },
  { value: 'about', label: 'About', description: 'Tell visitors about your space' },
  { value: 'gallery', label: 'Gallery', description: 'Image gallery' },
  { value: 'contact', label: 'Contact', description: 'Contact information' },
  { value: 'cta', label: 'Call to Action', description: 'Prompt visitors to take action' },
  { value: 'booking_form', label: 'Booking Form', description: 'Inline booking widget' },
  { value: 'testimonials', label: 'Testimonials', description: 'Customer reviews' },
  { value: 'rich_text', label: 'Rich Text', description: 'Free-form HTML content' },
];

const DEFAULT_CONFIGS = {
  hero: { title: 'Your Title Here', subtitle: 'A brief description', ctaText: 'Learn More', ctaLink: '#' },
  room_list: { title: 'Our Rooms', showPrices: true, showCapacity: true },
  about: { title: 'About Us', content: 'Tell your story...' },
  gallery: { title: 'Gallery' },
  contact: { title: 'Contact Us', email: '', phone: '', address: '' },
  cta: { title: 'Ready to Book?', subtitle: '', buttonText: 'Get Started', buttonLink: '#' },
  booking_form: { title: 'Book a Room', showDatePicker: true, showTimePicker: true },
  testimonials: { title: 'What People Say' },
  rich_text: { content: '' },
};

function BlockPreviewCard({ block, onEdit, onToggleVisibility, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [collapsed, setCollapsed] = useState(true);
  const typeInfo = BLOCK_TYPES.find((t) => t.value === block.blockType);
  const config = typeof block.config === 'string' ? JSON.parse(block.config) : (block.config || {});

  return (
    <div className="border border-border bg-surface">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="font-mono uppercase text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            <ChevronDownIcon className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            {typeInfo?.label || block.blockType}
          </button>
          {!block.isVisible && (
            <span className="font-mono uppercase text-xs text-text-muted bg-bg border border-border rounded-full px-2 py-0.5">Hidden</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMoveUp(block.id)}
            disabled={isFirst}
            className="p-1 text-text-muted hover:text-accent disabled:opacity-30 disabled:hover:text-text-muted transition-colors"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveDown(block.id)}
            disabled={isLast}
            className="p-1 text-text-muted hover:text-accent disabled:opacity-30 disabled:hover:text-text-muted transition-colors"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleVisibility(block.id, !block.isVisible)}
            className="p-1 text-text-muted hover:text-accent transition-colors"
            title={block.isVisible ? 'Hide block' : 'Show block'}
          >
            {block.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 text-destructive hover:text-red-400 transition-colors"
            title="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Config editor */}
      {!collapsed && (
        <div className="p-4 space-y-3">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="font-mono uppercase text-xs text-text-muted">{key}</label>
              {typeof value === 'boolean' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onEdit(block.id, { ...config, [key]: e.target.checked })}
                    className="accent-accent"
                  />
                  <span className="font-mono text-xs text-text">{value ? 'Yes' : 'No'}</span>
                </label>
              ) : (
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => onEdit(block.id, { ...config, [key]: e.target.value })}
                  className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick preview */}
      {collapsed && (
        <div className="px-4 py-2 border-t border-border">
          <p className="font-mono text-xs text-text-muted truncate">
            {Object.entries(config)
              .filter(([k]) => k !== 'rooms' && k !== 'images' && k !== 'testimonials')
              .map(([k, v]) => `${k}: ${v}`)
              .slice(0, 3)
              .join(' · ') || typeInfo?.description || block.blockType}
          </p>
        </div>
      )}
    </div>
  );
}

export default function BlockEditorPage() {
  const { tenantSlug } = useParams();
  const { profile, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [addingType, setAddingType] = useState('');

  useEffect(() => {
    if (!tenantSlug) return;
    api.getPageBlocks(tenantSlug)
      .then((data) => {
        setBlocks(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load blocks');
      })
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  const handleAddBlock = async () => {
    if (!addingType) return;
    setError('');
    try {
      const config = DEFAULT_CONFIGS[addingType] || {};
      const res = await api.createPageBlock(tenantSlug, { blockType: addingType, config });
      setBlocks((prev) => [...prev, res.data || res]);
      setAddingType('');
      setShowAddBlock(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await api.deletePageBlock(tenantSlug, id);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleVisibility = async (id, visible) => {
    try {
      const res = await api.updatePageBlock(tenantSlug, id, { isVisible: visible });
      setBlocks((prev) => prev.map((b) => b.id === id ? (res.data || b) : b));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfigEdit = async (id, newConfig) => {
    try {
      const res = await api.updatePageBlock(tenantSlug, id, { config: newConfig });
      setBlocks((prev) => prev.map((b) => b.id === id ? (res.data || b) : b));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMoveUp = async (id) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx <= 0) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[idx - 1]] = [newBlocks[idx - 1], newBlocks[idx]];
    setBlocks(newBlocks);
    try {
      const items = newBlocks.map((b, i) => ({ id: b.id, sortOrder: i }));
      const res = await api.reorderPageBlocks(tenantSlug, items);
      setBlocks(Array.isArray(res.data) ? res.data : newBlocks);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMoveDown = async (id) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0 || idx >= blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[idx + 1]] = [newBlocks[idx + 1], newBlocks[idx]];
    setBlocks(newBlocks);
    try {
      const items = newBlocks.map((b, i) => ({ id: b.id, sortOrder: i }));
      const res = await api.reorderPageBlocks(tenantSlug, items);
      setBlocks(Array.isArray(res.data) ? res.data : newBlocks);
    } catch (err) {
      setError(err.message);
    }
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6">
        <h1 className="font-display text-4xl text-text">Authentication Required</h1>
        <p className="font-mono uppercase text-xs text-text-muted">Please log in to edit this page.</p>
      </div>
    );
  }

  const isSuperadmin = profile?.role === 'superadmin';
  const isTenantAdmin = profile?.role === 'admin' || profile?.role === 'manager';

  if (!isSuperadmin && !isTenantAdmin) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6">
        <h1 className="font-display text-4xl text-text">Access Denied</h1>
        <p className="font-mono uppercase text-xs text-text-muted">You do not have permission to edit this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <Link
              to={`/admin/${tenantSlug}`}
              className="font-mono uppercase text-xs text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Admin Dashboard
            </Link>
          </div>
          <h1 className="font-display text-3xl text-text mt-2">Page Editor</h1>
          <p className="font-mono text-xs text-text-muted mt-1">Design your public booking page with blocks</p>
        </div>
      </header>

      {/* Navigation buttons */}
      <div className="max-w-6xl mx-auto px-6 pt-4 flex gap-3">
        <Link
          to={`/tenants/${tenantSlug}`}
          target="_blank"
          className="font-mono uppercase rounded-full border border-border px-5 py-2 text-xs text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors"
        >
          View Public Page
        </Link>
        {profile && (
          <span className="font-mono text-xs text-text-muted self-center capitalize">({profile?.role})</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <p className="font-mono text-xs text-destructive">{error}</p>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Add block selector */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono uppercase text-xs text-text-muted">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </h2>
          <button
            onClick={() => setShowAddBlock(!showAddBlock)}
            className="font-mono uppercase rounded-full border border-border px-4 py-2 text-xs text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-3 h-3" />
            Add Block
          </button>
        </div>

        {/* Add block panel */}
        {showAddBlock && (
          <div className="bg-surface border border-border p-6 space-y-4">
            <p className="font-mono uppercase text-xs text-text-muted">Select a block type</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BLOCK_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setAddingType(t.value)}
                  className={`text-left border p-4 space-y-1 transition-colors ${
                    addingType === t.value
                      ? 'border-accent bg-bg'
                      : 'border-border hover:border-text-muted'
                  }`}
                >
                  <p className="font-display text-lg text-text">{t.label}</p>
                  <p className="font-mono text-xs text-text-muted">{t.description}</p>
                </button>
              ))}
            </div>
            {addingType && (
              <div className="flex gap-3">
                <button
                  onClick={handleAddBlock}
                  className="font-mono uppercase rounded-full border border-accent px-6 py-2 text-xs text-accent hover:bg-accent hover:text-white transition-colors"
                >
                  Add {BLOCK_TYPES.find((t) => t.value === addingType)?.label}
                </button>
                <button
                  onClick={() => { setAddingType(''); setShowAddBlock(false); }}
                  className="font-mono uppercase rounded-full border border-border px-6 py-2 text-xs text-text hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Blocks list */}
        {blocks.length === 0 && !showAddBlock ? (
          <div className="border border-border py-16 text-center">
            <p className="font-mono uppercase text-sm text-text-muted">No blocks yet — add your first block</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, i) => (
              <BlockPreviewCard
                key={block.id}
                block={block}
                onEdit={handleConfigEdit}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={i === 0}
                isLast={i === blocks.length - 1}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => logout()}
            className="font-mono uppercase rounded-full border border-border px-4 py-2 text-xs text-text hover:bg-surface transition-colors"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

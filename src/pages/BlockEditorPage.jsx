import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ChevronUp, ChevronDown, Trash2, Eye, EyeOff, ArrowLeft, ChevronDown as ChevronDownIcon, Edit2, Save, X } from 'lucide-react';
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

// ── Type-specific config field definitions ────────────────────────────────
const CONFIG_FIELDS = {
  hero: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Welcome to our venue' },
    { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'A brief tagline' },
    { key: 'ctaText', label: 'CTA Button Text', type: 'text', placeholder: 'Book Now' },
    { key: 'ctaLink', label: 'CTA Link', type: 'text', placeholder: '/rooms' },
  ],
  room_list: [
    { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Our Spaces' },
    { key: 'showPrices', label: 'Show Prices', type: 'boolean' },
    { key: 'showCapacity', label: 'Show Capacity', type: 'boolean' },
  ],
  about: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'About Us' },
    { key: 'content', label: 'Content', type: 'textarea', placeholder: 'Tell your story...' },
  ],
  gallery: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Gallery' },
  ],
  contact: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Contact Us' },
    { key: 'email', label: 'Email', type: 'text', placeholder: 'hello@example.com' },
    { key: 'phone', label: 'Phone', type: 'text', placeholder: '+1 555-0100' },
    { key: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, City' },
  ],
  cta: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Ready to Book?' },
    { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Get started today' },
    { key: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Get Started' },
    { key: 'buttonLink', label: 'Button Link', type: 'text', placeholder: '/rooms' },
  ],
  booking_form: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Book a Room' },
    { key: 'showDatePicker', label: 'Show Date Picker', type: 'boolean' },
    { key: 'showTimePicker', label: 'Show Time Picker', type: 'boolean' },
  ],
  testimonials: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'What People Say' },
  ],
  rich_text: [
    { key: 'content', label: 'HTML Content', type: 'textarea', placeholder: '<p>Your content here</p>' },
  ],
};

function parseConfig(block) {
  return typeof block.config === 'string' ? JSON.parse(block.config) : (block.config || {});
}

function ConfigForm({ block, onSave, onCancel, initialConfig }) {
  const fields = CONFIG_FIELDS[block.blockType] || [];
  const [editedConfig, setEditedConfig] = useState(() => {
    const parsed = parseConfig(block);
    return { ...initialConfig, ...parsed };
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(block.id, { ...editedConfig });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => {
    setEditedConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-bg border border-border p-4 space-y-3">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="font-mono uppercase text-xs text-text-muted">{field.label}</label>
          {field.type === 'boolean' ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editedConfig[field.key] ?? false}
                onChange={(e) => updateField(field.key, e.target.checked)}
                className="accent-accent w-4 h-4"
              />
              <span className="font-mono text-xs text-text">{editedConfig[field.key] ? 'Yes' : 'No'}</span>
            </label>
          ) : field.type === 'textarea' ? (
            <textarea
              value={editedConfig[field.key] || ''}
              onChange={(e) => updateField(field.key, e.target.value)}
              rows={4}
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text font-sans focus:outline-none focus:border-accent resize-y"
            />
          ) : (
            <input
              type="text"
              value={editedConfig[field.key] || ''}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
            />
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="font-mono uppercase rounded-full border border-accent px-4 py-1.5 text-xs text-accent hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="font-mono uppercase rounded-full border border-border px-4 py-1.5 text-xs text-text-muted hover:bg-surface transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function BlockCard({ block, onEdit, onToggleVisibility, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const typeInfo = BLOCK_TYPES.find((t) => t.value === block.blockType);
  const config = parseConfig(block);

  const handleSave = async (id, newConfig) => {
    await onEdit(id, newConfig);
    setEditing(false);
  };

  // Summary text for collapsed view
  const summary = (() => {
    const fieldEntries = Object.entries(config).filter(([k]) => k !== 'rooms' && k !== 'images' && k !== 'testimonials');
    const displayFields = fieldEntries.filter(([_, v]) => typeof v === 'string' && v && v !== '#');
    return displayFields.slice(0, 2).map(([k, v]) => v).join(' · ') || typeInfo?.description || block.blockType;
  })();

  return (
    <div className="border border-border bg-surface">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-mono uppercase text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            <ChevronDownIcon className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {typeInfo?.label || block.blockType}
          </button>
          {!block.isVisible && (
            <span className="font-mono uppercase text-xs text-text-muted bg-bg border border-border rounded-full px-2 py-0.5">Hidden</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMoveUp(block.id)} disabled={isFirst} className="p-1 text-text-muted hover:text-accent disabled:opacity-30 transition-colors" title="Move up">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={() => onMoveDown(block.id)} disabled={isLast} className="p-1 text-text-muted hover:text-accent disabled:opacity-30 transition-colors" title="Move down">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={() => setEditing(!editing)} className={`p-1 transition-colors ${editing ? 'text-accent' : 'text-text-muted hover:text-accent'}`} title="Edit details">
            {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
          <button onClick={() => onToggleVisibility(block.id, !block.isVisible)} className="p-1 text-text-muted hover:text-accent transition-colors" title={block.isVisible ? 'Hide' : 'Show'}>
            {block.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(block.id)} className="p-1 text-destructive hover:text-red-400 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit form */}
      {expanded || editing ? (
        <ConfigForm
          block={block}
          onSave={handleSave}
          onCancel={() => { setExpanded(false); setEditing(false); }}
          initialConfig={config}
        />
      ) : (
        expanded && (
          <div className="px-4 py-2 border-t border-border">
            <p className="font-mono text-xs text-text-muted truncate">{summary}</p>
          </div>
        )
      )}
    </div>
  );
}

export default function BlockEditorPage() {
  const { tenantSlug } = useParams();
  const { profile, logout } = useAuth();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [addingType, setAddingType] = useState('');

  useEffect(() => {
    if (!tenantSlug) return;
    api.getPageBlocks(tenantSlug)
      .then((data) => setBlocks(Array.isArray(data.data) ? data.data : []))
      .catch((err) => setError(err.message || 'Failed to load blocks'))
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
      setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, ...(res.data || {}) } : b));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfigEdit = async (id, newConfig) => {
    try {
      const res = await api.updatePageBlock(tenantSlug, id, { config: newConfig });
      setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, ...(res.data || {}), config: newConfig } : b));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMoveUp = useCallback(async (id) => {
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
  }, [blocks, tenantSlug, api]);

  const handleMoveDown = useCallback(async (id) => {
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
  }, [blocks, tenantSlug, api]);

  if (loading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center"><p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading</p></div>;
  }

  const role = profile?.role === 'superadmin' ? 'superadmin' : profile?.role;
  const canEdit = role === 'superadmin' || role === 'admin' || role === 'manager';

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6 px-6">
        <h1 className="font-display text-4xl text-text">Access Denied</h1>
        <p className="font-mono uppercase text-xs text-text-muted text-center">You do not have permission to edit this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link to={`/admin/${tenantSlug}`} className="font-mono uppercase text-xs text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Admin Dashboard
          </Link>
          <h1 className="font-display text-3xl text-text mt-2">Page Editor</h1>
          <p className="font-mono text-xs text-text-muted mt-1">Design your public booking page with blocks</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-4 flex items-center gap-3">
        <Link to={`/tenants/${tenantSlug}`} target="_blank" className="font-mono uppercase rounded-full border border-border px-5 py-2 text-xs text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors">
          View Public Page
        </Link>
        <span className="font-mono text-xs text-text-muted capitalize">({role})</span>
      </div>

      {error && <div className="max-w-6xl mx-auto px-6 pt-4"><p className="font-mono text-xs text-destructive">{error}</p></div>}

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Add block */}
        <div className="flex items-center justify-between">
          <h2 className="font-mono uppercase text-xs text-text-muted">{blocks.length} block{blocks.length !== 1 ? 's' : ''}</h2>
          <button onClick={() => setShowAddBlock(!showAddBlock)} className="font-mono uppercase rounded-full border border-border px-4 py-2 text-xs text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors inline-flex items-center gap-2">
            <Plus className="w-3 h-3" /> Add Block
          </button>
        </div>

        {showAddBlock && (
          <div className="bg-surface border border-border p-6 space-y-4">
            <p className="font-mono uppercase text-xs text-text-muted">Select a block type</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BLOCK_TYPES.map((t) => (
                <button key={t.value} onClick={() => setAddingType(t.value)} className={`text-left border p-4 space-y-1 transition-colors ${addingType === t.value ? 'border-accent bg-bg' : 'border-border hover:border-text-muted'}`}>
                  <p className="font-display text-lg text-text">{t.label}</p>
                  <p className="font-mono text-xs text-text-muted">{t.description}</p>
                </button>
              ))}
            </div>
            {addingType && (
              <div className="flex gap-3">
                <button onClick={handleAddBlock} className="font-mono uppercase rounded-full border border-accent px-6 py-2 text-xs text-accent hover:bg-accent hover:text-white transition-colors">
                  Add {BLOCK_TYPES.find((t) => t.value === addingType)?.label}
                </button>
                <button onClick={() => { setAddingType(''); setShowAddBlock(false); }} className="font-mono uppercase rounded-full border border-border px-6 py-2 text-xs text-text hover:bg-surface transition-colors">Cancel</button>
              </div>
            )}
          </div>
        )}

        {/* Block list */}
        {blocks.length === 0 && !showAddBlock ? (
          <div className="border border-border py-16 text-center">
            <p className="font-mono uppercase text-sm text-text-muted">No blocks yet — add your first block</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, i) => (
              <BlockCard
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

        <div className="pt-4 flex items-center gap-4">
          <button onClick={() => logout()} className="font-mono uppercase rounded-full border border-border px-4 py-2 text-xs text-text hover:bg-surface transition-colors">Logout</button>
        </div>
      </main>
    </div>
  );
}

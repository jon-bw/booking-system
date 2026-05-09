import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove, useSortable, SortableContext, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Trash2, Eye, EyeOff, ArrowLeft, GripVertical, Edit2, X, MoveUp, MoveDown, Monitor, ArrowUp, ArrowDown
} from 'lucide-react';
import { api } from '../api/client.js';
import { Eye as LivePreviewIcon } from 'lucide-react';
import { HeroBlock } from '../components/blocks/HeroBlock.jsx';
import { RoomListBlock } from '../components/blocks/RoomListBlock.jsx';
import { AboutBlock } from '../components/blocks/AboutBlock.jsx';
import { GalleryBlock } from '../components/blocks/GalleryBlock.jsx';
import { ContactBlock } from '../components/blocks/ContactBlock.jsx';
import { CTABlock } from '../components/blocks/CTABlock.jsx';
import { TestimonialsBlock } from '../components/blocks/TestimonialsBlock.jsx';
import { RichTextBlock } from '../components/blocks/RichTextBlock.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// ── Block type definitions ─────────────────────────────────────────────────────
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
  if (!block) return {};
  return typeof block.config === 'string' ? JSON.parse(block.config) : (block.config || {});
}

// ── Live Preview Renderer ─────────────────────────────────────────────────────
const PREVIEW_COMPONENTS = { hero: HeroBlock, room_list: RoomListBlock, about: AboutBlock, gallery: GalleryBlock, contact: ContactBlock, cta: CTABlock, testimonials: TestimonialsBlock, rich_text: RichTextBlock };

function LivePreview({ blocks }) {
  if (blocks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-muted">
        <Monitor className="w-12 h-12 mb-4 opacity-30" />
        <p className="font-mono uppercase text-xs">No blocks yet</p>
        <p className="font-mono text-xs mt-1 opacity-50">Add blocks to see a live preview</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-bg">
      {blocks.map((block) => {
        if (!block.isVisible) return null;
        const Component = PREVIEW_COMPONENTS[block.blockType];
        if (!Component) return <div key={block.id} className="border-b border-border py-8 text-center font-mono text-xs text-text-muted">Unknown block: {block.blockType}</div>;
        const config = parseConfig(block);
        return <Component key={block.id} config={config} />;
      })}
    </div>
  );
}

// ── Sortable Block Item (left panel) ─────────────────────────────────────────
function SortableBlockItem({ block, onEdit, onToggleVisibility, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const typeInfo = BLOCK_TYPES.find((t) => t.value === block.blockType);
  const config = parseConfig(block);

  const handleSave = async (id, newConfig) => {
    await onEdit(id, newConfig);
    setEditing(false);
  };

  const summary = (() => {
    const fields = Object.entries(config).filter(([_, v]) => typeof v === 'string' && v && v !== '#').slice(0, 2);
    return fields.map(([_, v]) => v).join(' · ') || typeInfo?.description || block.blockType;
  })();

  return (
    <div ref={setNodeRef} style={style} className={`border transition-colors ${isDragging ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}>
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        {/* Grip handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-text-muted hover:text-text transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>
        {/* Block type label */}
        <span className="font-mono uppercase text-xs text-text flex-1 truncate">{typeInfo?.label || block.blockType}</span>
        {/* Visibility badge */}
        {!block.isVisible && <span className="font-mono uppercase text-xs text-text-muted bg-bg border border-border rounded-full px-1.5 py-0.5">Hidden</span>}
        {/* Quick actions */}
        <button onClick={() => onMoveUp(block.id)} disabled={isFirst} className="p-1 text-text-muted hover:text-accent disabled:opacity-20 transition-colors" title="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
        <button onClick={() => onMoveDown(block.id)} disabled={isLast} className="p-1 text-text-muted hover:text-accent disabled:opacity-20 transition-colors" title="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
        <button onClick={() => setEditing(!editing)} className={`p-1 transition-colors ${editing ? 'text-accent' : 'text-text-muted hover:text-accent'}`} title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => onToggleVisibility(block.id, !block.isVisible)} className="p-1 text-text-muted hover:text-accent transition-colors" title={block.isVisible ? 'Hide' : 'Show'}>
          {block.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => onDelete(block.id)} className="p-1 text-destructive hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-text-muted hover:text-accent transition-colors" title="Details">
          {expanded ? <X className="w-3.5 h-3.5" /> : <MoveDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded config form or summary */}
      {(expanded || editing) && (editing ? (
        <ConfigForm block={block} onSave={handleSave} onCancel={() => { setExpanded(false); setEditing(false); }} initialConfig={config} />
      ) : (
        <div className="px-4 py-2 border-t border-border"><p className="font-mono text-xs text-text-muted truncate">{summary}</p></div>
      )}
    </div>
  );
}

// ── Type-safe config editor form ─────────────────────────────────────────────
function ConfigForm({ block, onSave, onCancel, initialConfig }) {
  const fields = CONFIG_FIELDS[block.blockType] || [];
  const [editedConfig, setEditedConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const handleSave = async () => { setSaving(true); try { await onSave(block.id, { ...editedConfig }); } finally { setSaving(false); } };
  const updateField = (key, value) => setEditedConfig((prev) => ({ ...prev, [key]: value }));
  return (
    <div className="bg-bg border-t border-border p-4 space-y-3">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="font-mono uppercase text-xs text-text-muted">{field.label}</label>
          {field.type === 'boolean' ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editedConfig[field.key] ?? false} onChange={(e) => updateField(field.key, e.target.checked)} className="accent-accent w-4 h-4" />
              <span className="font-mono text-xs text-text">{editedConfig[field.key] ? 'Yes' : 'No'}</span>
            </label>
          ) : field.type === 'textarea' ? (
            <textarea value={editedConfig[field.key] || ''} onChange={(e) => updateField(field.key, e.target.value)} rows={3} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text font-sans focus:outline-none focus:border-accent resize-y" />
          ) : (
            <input type="text" value={editedConfig[field.key] || ''} onChange={(e) => updateField(field.key, e.target.value)} placeholder={field.placeholder} className="w-full bg-bg border border-border rounded-full px-3 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent" />
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button onClick={handleSave} disabled={saving} className="font-mono uppercase rounded-full border border-accent px-4 py-1.5 text-xs text-accent hover:bg-accent hover:text-white transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={onCancel} className="font-mono uppercase rounded-full border border-border px-4 py-1.5 text-xs text-text-muted hover:bg-surface transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ── Main Block Editor Page ───────────────────────────────────────────────────
export default function BlockEditorPage() {
  const { tenantSlug } = useParams();
  const { profile, logout } = useAuth();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [addingType, setAddingType] = useState('');
  const [activeId, setActiveId] = useState(null);

  // Drag sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

  // Fetch blocks
  useEffect(() => {
    if (!tenantSlug) return;
    api.getPageBlocks(tenantSlug).then((data) => setBlocks(Array.isArray(data.data) ? data.data : [])).catch((err) => setError(err.message || 'Failed to load blocks')).finally(() => setLoading(false));
  }, [tenantSlug]);

  // Drag end handler
  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    const newBlocks = arrayMove(blocks, oldIdx, newIdx);
    setBlocks(newBlocks);
    try {
      const items = newBlocks.map((b, i) => ({ id: b.id, sortOrder: i }));
      const res = await api.reorderPageBlocks(tenantSlug, items);
      setBlocks(Array.isArray(res.data) ? res.data : newBlocks);
    } catch (err) { setError(err.message); }
  }, [blocks, tenantSlug]);

  // Add block
  const handleAddBlock = async () => {
    if (!addingType) return;
    setError('');
    try {
      const config = DEFAULT_CONFIGS[addingType] || {};
      const res = await api.createPageBlock(tenantSlug, { blockType: addingType, config });
      setBlocks((prev) => [...prev, res.data || res]);
      setAddingType('');
      setShowAddBlock(false);
    } catch (err) { setError(err.message); }
  };

  // Delete
  const handleDelete = async (id) => {
    setError('');
    try {
      await api.deletePageBlock(tenantSlug, id);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) { setError(err.message); }
  };

  // Toggle visibility
  const handleToggleVisibility = async (id, visible) => {
    try {
      const res = await api.updatePageBlock(tenantSlug, id, { isVisible: visible });
      setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, ...(res.data || {}), isVisible: visible } : b));
    } catch (err) { setError(err.message); }
  };

  // Config edit
  const handleConfigEdit = async (id, newConfig) => {
    try {
      const res = await api.updatePageBlock(tenantSlug, id, { config: newConfig });
      setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, ...(res.data || {}), config: newConfig } : b));
    } catch (err) { setError(err.message); }
  };

  // Manual move (arrows)
  const handleMove = useCallback(async (id, direction) => {
    const idx = blocks.findIndex((b) => b.id === id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= blocks.length - 1) return;
    const newBlocks = arrayMove(blocks, idx, targetIdx);
    setBlocks(newBlocks);
    try {
      const items = newBlocks.map((b, i) => ({ id: b.id, sortOrder: i }));
      const res = await api.reorderPageBlocks(tenantSlug, items);
      setBlocks(Array.isArray(res.data) ? res.data : newBlocks);
    } catch (err) { setError(err.message); }
  }, [blocks, tenantSlug]);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading</p></div>;

  const role = profile?.role;
  const canEdit = role === 'superadmin' || role === 'admin' || role === 'manager';
  if (!canEdit) return <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6 px-6"><h1 className="font-display text-4xl text-text">Access Denied</h1><p className="font-mono uppercase text-xs text-text-muted text-center">You do not have permission to edit this page.</p></div>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id)} onDragCancel={() => setActiveId(null)}>
      <div className="h-screen flex flex-col bg-bg text-text font-sans">
        {/* Top bar */}
        <header className="border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link to={`/admin/${tenantSlug}`} className="font-mono uppercase text-xs text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Admin</Link>
            <h1 className="font-display text-xl text-text">Page Editor</h1>
            <span className="font-mono text-xs text-text-muted opacity-50 hidden sm:inline">/{tenantSlug}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/tenants/${tenantSlug}`} target="_blank" className="font-mono uppercase rounded-full border border-border px-4 py-1.5 text-xs text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors inline-flex items-center gap-1.5">
              <LivePreviewIcon className="w-3 h-3" /> Open Public Page
            </Link>
            <button onClick={() => logout()} className="font-mono uppercase rounded-full border border-border px-4 py-1.5 text-xs text-text-muted hover:bg-surface transition-colors">Logout</button>
          </div>
        </header>

        {error && <div className="px-6 py-2 bg-destructive/10 border-b border-destructive/20"><p className="font-mono text-xs text-destructive">{error}</p></div>}

        {/* Main split layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left panel — Block list */}
          <div className="w-96 flex flex-col border-r border-border shrink-0">
            {/* Add block */}
            <div className="p-4 border-b border-border space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-mono uppercase text-xs text-text-muted">{blocks.length} blocks</h2>
                <button onClick={() => setShowAddBlock(!showAddBlock)} className="font-mono uppercase rounded-full border border-border px-3 py-1 text-xs text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors inline-flex items-center gap-1.5">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {showAddBlock && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {BLOCK_TYPES.map((t) => (
                      <button key={t.value} onClick={() => setAddingType(t.value)} className={`text-left border rounded-lg px-3 py-2 transition-colors ${addingType === t.value ? 'border-accent bg-accent/5' : 'border-border hover:border-text-muted'}`}>
                        <p className="font-display text-sm text-text">{t.label}</p>
                      </button>
                    ))}
                  </div>
                  {addingType && (
                    <div className="flex gap-2">
                      <button onClick={handleAddBlock} className="flex-1 font-mono uppercase rounded-full border border-accent px-4 py-1.5 text-xs text-accent hover:bg-accent hover:text-white transition-colors">Add {BLOCK_TYPES.find((t) => t.value === addingType)?.label}</button>
                      <button onClick={() => { setAddingType(''); setShowAddBlock(false); }} className="font-mono uppercase rounded-full border border-border px-4 py-1.5 text-xs text-text-muted hover:bg-surface transition-colors">Cancel</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sortable block list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block, i) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    onEdit={handleConfigEdit}
                    onToggleVisibility={handleToggleVisibility}
                    onDelete={handleDelete}
                    onMoveUp={() => handleMove(block.id, 'up')}
                    onMoveDown={() => handleMove(block.id, 'down')}
                    isFirst={i === 0}
                    isLast={i === blocks.length - 1}
                  />
                ))}
              </SortableContext>

              {/* Drag overlay */}
              <DragOverlay dropAnimation={null}>
                {activeId ? (() => {
                  const block = blocks.find((b) => b.id === activeId);
                  if (!block) return null;
                  const typeInfo = BLOCK_TYPES.find((t) => t.value === block.blockType);
                  return <div className="border-2 border-dashed border-accent bg-accent/10 rounded-lg px-3 py-2 flex items-center gap-2"><GripVertical className="w-4 h-4 text-accent" /><span className="font-mono uppercase text-sm text-accent">{typeInfo?.label || block.blockType}</span></div>;
                })() : null}
              </DragOverlay>

              {blocks.length === 0 && !showAddBlock && (
                <div className="py-16 text-center">
                  <p className="font-mono uppercase text-sm text-text-muted">No blocks yet</p>
                  <button onClick={() => setShowAddBlock(true)} className="mt-3 font-mono uppercase rounded-full border border-border px-4 py-2 text-xs text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors inline-flex items-center gap-1.5"><Plus className="w-3 h-3" /> Add your first block</button>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t border-border shrink-0">
              <p className="font-mono text-xs text-text-muted opacity-50">Drag blocks to reorder • Click edit to configure</p>
            </div>
          </div>

          {/* Right panel — Live Preview */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-2 border-b border-border flex items-center gap-2 shrink-0">
              <Monitor className="w-4 h-4 text-text-muted" />
              <span className="font-mono uppercase text-xs text-text-muted">Live Preview</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <LivePreview blocks={blocks} />
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove, useSortable, SortableContext, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Trash2, Eye, EyeOff, ArrowLeft, GripVertical, Edit2, X,
  ArrowUp, ArrowDown, Palette, Monitor, ChevronDown, Palette as ThemeIcon,
  Type, Square, Sun, Moon,
} from 'lucide-react';
import { api } from '../api/client.js';
import { HeroBlock } from '../components/blocks/HeroBlock.jsx';
import { RoomListBlock } from '../components/blocks/RoomListBlock.jsx';
import { AboutBlock } from '../components/blocks/AboutBlock.jsx';
import { GalleryBlock } from '../components/blocks/GalleryBlock.jsx';
import { ContactBlock } from '../components/blocks/ContactBlock.jsx';
import { CTABlock } from '../components/blocks/CTABlock.jsx';
import { BookingFormBlock } from '../components/blocks/BookingFormBlock.jsx';
import { TestimonialsBlock } from '../components/blocks/TestimonialsBlock.jsx';
import { RichTextBlock } from '../components/blocks/RichTextBlock.jsx';
import { BannerCarouselBlock } from '../components/blocks/BannerCarouselBlock.jsx';
import { ThemeProvider, useTheme } from '../context/ThemeContext.jsx';

// ── Block type definitions ─────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { value: 'hero', label: 'Hero', description: 'Large header with title and CTA' },
  { value: 'banner_carousel', label: 'Banner Carousel', description: 'Auto-playing image slideshow' },
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
  banner_carousel: { title: '', slides: [{ url: '', caption: '' }, { url: '', caption: '' }], mode: 'manual', autoPlay: true, interval: 5, height: 64 },
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
  banner_carousel: [
    { key: 'title', label: 'Overlay Title (optional)', type: 'text' },
    { key: 'mode', label: 'Content Mode', type: 'select', options: ['manual', 'rooms'], default: 'manual' },
    { key: 'autoPlay', label: 'Auto-Play', type: 'boolean' },
    { key: 'interval', label: 'Interval (seconds)', type: 'number' },
    { key: 'height', label: 'Height (vh)', type: 'number' },
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

const PRESET_THEMES = {
  nothing: { name: 'Nothing', mode: 'dark', colors: { background: '#0a0a0a', surface: '#111111', text: '#E8E8E8', textMuted: '#6b7280', border: '#333333', accent: '#5B9BF6', accentHover: '#7BB3F8', destructive: '#D71921' }, fonts: { display: 'Doto, sans-serif', body: 'Space Grotesk, sans-serif', mono: 'Space Mono, monospace' }, borderRadius: '999px', buttonStyle: 'pill' },
  classic: { name: 'Classic', mode: 'light', colors: { background: '#ffffff', surface: '#f8f9fa', text: '#1a1a1a', textMuted: '#6b7280', border: '#e5e7eb', accent: '#3b82f6', accentHover: '#60a5fa', destructive: '#ef4444' }, fonts: { display: 'Georgia, serif', body: 'system-ui, sans-serif', mono: 'ui-monospace, monospace' }, borderRadius: '4px', buttonStyle: 'rounded' },
  modern: { name: 'Modern Dark', mode: 'dark', colors: { background: '#13111C', surface: '#1a1728', text: '#E4E4E7', textMuted: '#71717A', border: '#27272A', accent: '#A78BFA', accentHover: '#C4B5FD', destructive: '#F87171' }, fonts: { display: 'Inter, sans-serif', body: 'Inter, sans-serif', mono: 'JetBrains Mono, monospace' }, borderRadius: '12px', buttonStyle: 'rounded' },
  minimal: { name: 'Minimal', mode: 'dark', colors: { background: '#fafafa', surface: '#ffffff', text: '#0a0a0a', textMuted: '#a0a0a0', border: '#e0e0e0', accent: '#0a0a0a', accentHover: '#333333', destructive: '#cc3333' }, fonts: { display: 'system-ui, sans-serif', body: 'system-ui, sans-serif', mono: 'ui-monospace, monospace' }, borderRadius: '0px', buttonStyle: 'sharp' },
};

function parseConfig(block) {
  if (!block) return {};
  return typeof block.config === 'string' ? JSON.parse(block.config) : (block.config || {});
}

// ── Live Preview Renderer ─────────────────────────────────────────────────────
const PREVIEW_COMPONENTS = { hero: HeroBlock, banner_carousel: BannerCarouselBlock, room_list: RoomListBlock, about: AboutBlock, gallery: GalleryBlock, contact: ContactBlock, cta: CTABlock, testimonials: TestimonialsBlock, rich_text: RichTextBlock };

function LivePreview({ blocks, tenantSlug }) {
  const { theme, style: themeVars, loading: themeLoading } = useTheme();
  const wrapperStyle = {
    ...themeVars,
    background: themeVars?.['--bg'] ?? '#0a0a0a',
    color: themeVars?.['--text'] ?? '#E8E8E8',
  };

  if (blocks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center" style={{ background: wrapperStyle['--surface'] ?? '#111111', color: themeVars?.['--text-muted'] ?? '#6b7280' }}>
        <Monitor className="w-12 h-12 mb-4 opacity-30" />
        <p className="font-mono uppercase text-xs">No blocks yet</p>
        <p className="font-mono text-xs mt-1 opacity-50">Add blocks to see a live preview</p>
      </div>
    );
  }

  return (
    <div className="themed-content h-full overflow-y-auto bg-bg" style={wrapperStyle}>
      {blocks.map((block) => {
        if (!block.isVisible) return null;
        const Component = PREVIEW_COMPONENTS[block.blockType];
        if (!Component) return <div key={block.id} className="border-b border-border py-8 text-center font-mono text-xs text-text-muted">Unknown block: {block.blockType}</div>;
        const config = parseConfig(block);
        return <Component key={block.id} config={config} tenantSlug={tenantSlug} />;
      })}
    </div>
  );
}

// ── Theme Editor Panel ─────────────────────────────────────────────────────────
function ThemeEditorPanel({ tenantSlug }) {
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(theme);

  useEffect(() => { setLocal(theme); }, [theme]);

  const applyPreset = (key) => {
    const preset = PRESET_THEMES[key];
    const t = {
      colors: { ...theme.colors, ...preset.colors },
      fonts: { ...theme.fonts, ...preset.fonts },
      buttonStyle: preset.buttonStyle,
      borderRadius: preset.borderRadius,
      mode: preset.mode,
    };
    setLocal(t);
    applyToPreview(t);
  };

  const applyToPreview = (t) => {
    setLocal(t);
    setTheme(t);  // Update theme context live — wrapper div reads from useTheme().style
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateTheme(tenantSlug, local);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const updateColor = (key, value) => {
    const t = { ...local, colors: { ...local.colors, [key]: value } };
    setLocal(t);
    applyToPreview(t);
  };

  const updateFont = (key, value) => {
    const t = { ...local, fonts: { ...local.fonts, [key]: value } };
    setLocal(t);
    applyToPreview(t);
  };

  const colorFields = [
    { key: 'background', label: 'Background' },
    { key: 'surface', label: 'Surface' },
    { key: 'text', label: 'Text' },
    { key: 'textMuted', label: 'Text Muted' },
    { key: 'border', label: 'Border' },
    { key: 'accent', label: 'Accent' },
    { key: 'accentHover', label: 'Accent Hover' },
    { key: 'destructive', label: 'Destructive' },
  ];

  const radiusOptions = ['0px', '4px', '8px', '12px', '16px', '24px', '999px'];
  const buttonStyles = [
    { value: 'pill', label: 'Pill', preview: 'rounded-full border-2 px-4 py-1' },
    { value: 'rounded', label: 'Rounded', preview: 'rounded-lg border-2 px-4 py-1' },
    { value: 'sharp', label: 'Sharp', preview: 'border-2 px-4 py-1' },
  ];

  const toggleMode = () => {
    const newMode = local.mode === 'dark' ? 'light' : 'dark';
    const base = newMode === 'dark' ? PRESET_THEMES.modern : PRESET_THEMES.classic;
    const t = { colors: base.colors, fonts: { ...local.fonts }, buttonStyle: local.buttonStyle, borderRadius: local.borderRadius, mode: newMode };
    setLocal(t);
    applyToPreview(t);
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <span className="font-mono uppercase text-xs text-text-muted">Appearance</span>
        <button onClick={toggleMode} className="flex items-center gap-2 font-mono uppercase text-xs text-text-muted hover:text-accent transition-colors">
          {local.mode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {local.mode}
        </button>
      </div>

      {/* Presets */}
      <div>
        <span className="font-mono uppercase text-xs text-text-muted mb-2 block">Presets</span>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PRESET_THEMES).map(([key, preset]) => (
            <button key={key} onClick={() => applyPreset(key)} className="flex flex-col items-center gap-1 border border-border hover:border-accent p-2 transition-colors rounded-lg">
              <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded-full" style={{ background: preset.colors.background, border: '1px solid #fff', borderColor: preset.colors.border }} />
                <div className="w-3 h-3 rounded-full" style={{ background: preset.colors.accent }} />
                <div className="w-3 h-3 rounded-full" style={{ background: preset.colors.text }} />
              </div>
              <span className="font-mono text-xs text-text">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <span className="font-mono uppercase text-xs text-text-muted mb-2 block flex items-center gap-1"><Palette className="w-3 h-3" /> Colors</span>
        <div className="space-y-2">
          {colorFields.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-2">
              <label className="font-mono text-xs text-text-muted shrink-0">{f.label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={local.colors?.[f.key] || '#000000'} onChange={(e) => updateColor(f.key, e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
                <input type="text" value={local.colors?.[f.key] || '#000000'} onChange={(e) => updateColor(f.key, e.target.value)} className="w-24 bg-bg border border-border rounded px-2 py-1 text-xs text-text font-mono" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <span className="font-mono uppercase text-xs text-text-muted mb-2 block flex items-center gap-1"><Type className="w-3 h-3" /> Typography</span>
        <div className="space-y-2">
          {[
            { key: 'display', label: 'Display / Headings' },
            { key: 'body', label: 'Body Text' },
            { key: 'mono', label: 'Monospace' },
          ].map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="font-mono text-xs text-text-muted">{f.label}</label>
              <input type="text" value={local.fonts?.[f.key] || ''} onChange={(e) => updateFont(f.key, e.target.value)} className="w-full bg-bg border border-border rounded-full px-3 py-1.5 text-xs text-text font-mono" />
            </div>
          ))}
        </div>
      </div>

      {/* Button style */}
      <div>
        <span className="font-mono uppercase text-xs text-text-muted mb-2 block flex items-center gap-1"><Square className="w-3 h-3" /> Button Style</span>
        <div className="grid grid-cols-3 gap-2">
          {buttonStyles.map((s) => (
            <button key={s.value} onClick={() => { const t = { ...local, buttonStyle: s.value, borderRadius: s.value === 'pill' ? '999px' : s.value === 'rounded' ? '12px' : '0px' }; setLocal(t); applyToPreview(t); }} className={`border p-2 flex items-center justify-center transition-colors ${local.buttonStyle === s.value ? 'border-accent bg-accent/5' : 'border-border hover:border-text-muted'}`}>
              <span className={`border px-4 py-1 text-xs ${s.preview}`} style={{ color: local.colors?.accent, borderColor: local.colors?.accent }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Border radius */}
      <div>
        <span className="font-mono uppercase text-xs text-text-muted mb-1 block">Border Radius</span>
        <div className="flex gap-1 flex-wrap">
          {radiusOptions.map((r) => (
            <button key={r} onClick={() => { const t = { ...local, borderRadius: r }; setLocal(t); applyToPreview(t); }} className={`border px-2 py-1 text-xs font-mono transition-colors ${local.borderRadius === r ? 'border-accent bg-accent/5 text-accent' : 'border-border text-text-muted hover:border-text-muted'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving} className="w-full font-mono uppercase rounded-full border border-accent px-4 py-2 text-xs text-accent hover:bg-accent hover:text-white transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Theme'}
      </button>
    </div>
  );
}

// ── Carousel slide editor ─────────────────────────────────────────────────────
function SlideListEditor({ value = [], onChange }) {
  const updateSlide = (i, key, val) => {
    const next = [...value];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };
  const addSlide = () => onChange([...value, { url: '', caption: '' }]);
  const removeSlide = (i) => onChange(value.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      {value.map((slide, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="text" value={slide.url || ''} onChange={(e) => updateSlide(i, 'url', e.target.value)} placeholder="Image URL" className="flex-1 bg-bg border border-border rounded px-2 py-1 text-xs text-text font-mono" />
          {value.length > 1 && (
            <button onClick={() => removeSlide(i)} className="p-1 text-destructive hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
          )}
        </div>
      ))}
      <button onClick={addSlide} className="text-xs font-mono text-accent hover:text-accent/80 flex items-center gap-1"><Plus className="w-3 h-3" /> Add slide</button>
    </div>
  );
}

// ── Sortable Block Item (left panel) ─────────────────────────────────────────
function SortableBlockItem({ block, onEdit, onToggleVisibility, onDelete, onMoveUp, onMoveDown, isFirst, isLast, extraFields, slideConfigField }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const typeInfo = BLOCK_TYPES.find((t) => t.value === block.blockType || t.value === block.blockType);
  const config = parseConfig(block);

  const handleSave = async (id, newConfig) => {
    await onEdit(id, newConfig);
    setEditing(false);
  };

  // Extra field config fields
  const extraFieldsList = (extraFields || []).map((f) => ({ ...f, type: f.type || 'text' }));

  const summary = (() => {
    const fields = Object.entries(config).filter(([_, v]) => typeof v === 'string' && v && v !== '#').slice(0, 2);
    return fields.map(([_, v]) => v).join(' · ') || typeInfo?.description || block.blockType;
  })();

  // For carousel — render slide list editor or room picker
  if (editing && block.blockType === 'banner_carousel') {
    const carouselMode = config.mode || 'manual';
    return (
      <div ref={setNodeRef} style={style} className="border border-accent bg-accent/5">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-text-muted hover:text-text transition-colors"><GripVertical className="w-4 h-4" /></div>
          <span className="font-mono uppercase text-xs text-accent flex-1 truncate">{typeInfo?.label}</span>
          <button onClick={() => setEditing(false)} className="p-1 text-text-muted hover:text-accent"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="bg-bg border-t border-border p-4 space-y-3">
          <div className="space-y-2">
            <label className="font-mono text-xs text-text-muted">Title (optional)</label>
            <input type="text" value={config.title || ''} onChange={(e) => onEdit(block.id, { ...config, title: e.target.value })} className="w-full bg-bg border border-border rounded px-2 py-1 text-xs text-text font-mono" />
          </div>

          {/* Mode selector */}
          <div className="space-y-2">
            <label className="font-mono text-xs text-text-muted">Source Mode</label>
            <div className="flex gap-2">
              <button onClick={() => onEdit(block.id, { ...config, mode: 'manual' })} className={`flex-1 border px-3 py-1.5 text-xs font-mono transition-colors ${carouselMode === 'manual' ? 'border-accent text-accent bg-accent/5' : 'border-border text-text-muted hover:border-text-muted'}`}>Manual Slides</button>
              <button onClick={() => onEdit(block.id, { ...config, mode: 'rooms' })} className={`flex-1 border px-3 py-1.5 text-xs font-mono transition-colors ${carouselMode === 'rooms' ? 'border-accent text-accent bg-accent/5' : 'border-border text-text-muted hover:border-text-muted'}`}>From Rooms</button>
            </div>
          </div>

          {carouselMode === 'manual' ? (
            <SlideListEditor value={config.slides || []} onChange={(slides) => onEdit(block.id, { ...config, slides })} />
          ) : (
            <div className="space-y-2">
              <p className="font-mono text-xs text-text-muted">Uses first image from each room. Add images in Admin dashboard.</p>
            </div>
          )}

          <div className="space-y-2">
            {CONFIG_FIELDS.banner_carousel?.filter((f) => f.type === 'boolean' || f.type === 'number').map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="font-mono text-xs text-text-muted">{f.label}</label>
                {f.type === 'boolean' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={config[f.key] ?? true} onChange={(e) => onEdit(block.id, { ...config, [f.key]: e.target.checked })} className="accent-accent w-4 h-4" />
                    <span className="font-mono text-xs text-text">{config[f.key] ? 'Yes' : 'No'}</span>
                  </label>
                ) : (
                  <input type="number" value={config[f.key] || 5} onChange={(e) => onEdit(block.id, { ...config, [f.key]: Number(e.target.value) })} className="w-full bg-bg border border-border rounded px-2 py-1 text-xs text-text font-mono" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={`border transition-colors ${isDragging ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}>
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-text-muted hover:text-text transition-colors"><GripVertical className="w-4 h-4" /></div>
        <span className="font-mono uppercase text-xs text-text flex-1 truncate">{typeInfo?.label || block.blockType}</span>
        {!block.isVisible && <span className="font-mono uppercase text-xs text-text-muted bg-bg border border-border rounded-full px-1.5 py-0.5">Hidden</span>}
        <button onClick={() => onMoveUp(block.id)} disabled={isFirst} className="p-1 text-text-muted hover:text-accent disabled:opacity-20 transition-colors" title="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
        <button onClick={() => onMoveDown(block.id)} disabled={isLast} className="p-1 text-text-muted hover:text-accent disabled:opacity-20 transition-colors" title="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
        <button onClick={() => setEditing(!editing)} className={`p-1 transition-colors ${editing ? 'text-accent' : 'text-text-muted hover:text-accent'}`} title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => onToggleVisibility(block.id, !block.isVisible)} className="p-1 text-text-muted hover:text-accent transition-colors" title={block.isVisible ? 'Hide' : 'Show'}>{block.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
        <button onClick={() => onDelete(block.id)} className="p-1 text-destructive hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-text-muted hover:text-accent transition-colors" title="Details">{expanded ? <X className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</button>
      </div>

      {(expanded || editing) && (editing ? (
        <ConfigForm block={block} onSave={handleSave} onCancel={() => { setExpanded(false); setEditing(false); }} initialConfig={config} extraFields={extraFieldsList} />
      ) : (
        <div className="px-4 py-2 border-t border-border"><p className="font-mono text-xs text-text-muted truncate">{summary}</p></div>
      ))}
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
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editedConfig[field.key] ?? false} onChange={(e) => updateField(field.key, e.target.checked)} className="accent-accent w-4 h-4" /><span className="font-mono text-xs text-text">{editedConfig[field.key] ? 'Yes' : 'No'}</span></label>
          ) : field.type === 'select' ? (
            <select value={editedConfig[field.key] || field.options?.[0] || ''} onChange={(e) => updateField(field.key, e.target.value)} className="w-full bg-surface border border-border rounded-full px-3 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent">
              {(field.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
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

// ── Editor Inner (wrapped by ThemeProvider) ───────────────────────────────────
function BlockEditorInner() {
  const { tenantSlug } = useParams();
  const { profile, logout } = useAuth();
  const { theme } = useTheme();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [addingType, setAddingType] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [activeTab, setActiveTab] = useState('blocks'); // 'blocks' | 'theme'

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

  useEffect(() => {
    if (!tenantSlug) return;
    api.getPageBlocks(tenantSlug).then((data) => setBlocks(Array.isArray(data.data) ? data.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, [tenantSlug]);

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

  const handleAddBlock = async () => {
    if (!addingType) return;
    const config = DEFAULT_CONFIGS[addingType] || {};
    try { const res = await api.createPageBlock(tenantSlug, { blockType: addingType, config }); setBlocks((prev) => [...prev, res.data || res]); setAddingType(''); setShowAddBlock(false); }
    catch (err) { setError(err.message); }
  };
  const handleDelete = async (id) => { try { await api.deletePageBlock(tenantSlug, id); setBlocks((prev) => prev.filter((b) => b.id !== id)); } catch (err) { setError(err.message); } };
  const handleToggleVisibility = async (id, visible) => { try { await api.updatePageBlock(tenantSlug, id, { isVisible: visible }); setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, isVisible: visible } : b)); } catch (err) { setError(err.message); } };
  const handleConfigEdit = async (id, newConfig) => { try { await api.updatePageBlock(tenantSlug, id, { config: newConfig }); setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, config: newConfig } : b)); } catch (err) { setError(err.message); } };
  const handleMove = useCallback(async (id, direction) => {
    const idx = blocks.findIndex((b) => b.id === id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= blocks.length - 1) return;
    const newBlocks = arrayMove(blocks, idx, targetIdx);
    setBlocks(newBlocks);
    try { const res = await api.reorderPageBlocks(tenantSlug, newBlocks.map((b, i) => ({ id: b.id, sortOrder: i }))); setBlocks(Array.isArray(res.data) ? res.data : newBlocks); }
    catch (err) { setError(err.message); }
  }, [blocks, tenantSlug]);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><p className="font-mono uppercase text-sm animate-pulse">Loading</p></div>;
  const role = profile?.role;
  const canEdit = role === 'superadmin' || role === 'admin' || role === 'manager';
  if (!canEdit) return <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6 px-6"><h1 className="font-display text-4xl">Access Denied</h1><p className="font-mono uppercase text-xs text-center">You do not have permission to edit this page.</p></div>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id)} onDragCancel={() => setActiveId(null)}>
      <div className="themed-content h-screen flex flex-col" style={{ background: 'var(--bg, #0a0a0a)', color: 'var(--text, #E8E8E8)', fontFamily: 'var(--font-body, "Space Grotesk", sans-serif)' }}>
        {/* Top bar */}
        <header className="border-b px-6 py-3 flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border, #333333)' }}>
          <div className="flex items-center gap-4">
            <Link to={`/admin/${tenantSlug}`} className="font-mono uppercase text-xs opacity-50 hover:text-accent transition-colors inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Admin</Link>
            <h1 className="font-display text-xl">Page Editor</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/tenants/${tenantSlug}`} target="_blank" className="font-mono uppercase rounded-full border px-4 py-1.5 text-xs inline-flex items-center gap-1.5 hover:border-accent hover:text-accent transition-colors" style={{ borderColor: 'var(--border, #333333)' }}>
              <Monitor className="w-3 h-3" /> Open Public Page
            </Link>
            <button onClick={() => logout()} className="font-mono uppercase rounded-full border px-4 py-1.5 text-xs opacity-50 hover:bg-surface transition-colors" style={{ borderColor: 'var(--border, #333333)' }}>Logout</button>
          </div>
        </header>

        {error && <div className="px-6 py-2" style={{ background: 'var(--destructive)/10', borderBottom: '1px solid var(--destructive)/20' }}><p className="font-mono text-xs" style={{ color: 'var(--destructive, #D71921)' }}>{error}</p></div>}

        <div className="flex-1 flex min-h-0">
          {/* Left panel */}
          <div className="w-96 flex flex-col border-r shrink-0" style={{ borderColor: 'var(--border, #333333)' }}>
            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: 'var(--border, #333333)' }}>
              <button onClick={() => setActiveTab('blocks')} className={`flex-1 py-2 font-mono uppercase text-xs transition-colors inline-flex items-center justify-center gap-1.5 ${activeTab === 'blocks' ? 'text-accent border-b-2' : 'opacity-50 hover:text-accent'}`} style={{ borderColor: activeTab === 'blocks' ? 'var(--accent, #5B9BF6)' : 'transparent' }}>
                <GripVertical className="w-3.5 h-3.5" /> Blocks
              </button>
              <button onClick={() => setActiveTab('theme')} className={`flex-1 py-2 font-mono uppercase text-xs transition-colors inline-flex items-center justify-center gap-1.5 ${activeTab === 'theme' ? 'text-accent border-b-2' : 'opacity-50 hover:text-accent'}`} style={{ borderColor: activeTab === 'theme' ? 'var(--accent, #5B9BF6)' : 'transparent' }}>
                <Palette className="w-3.5 h-3.5" /> Theme
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'theme' ? (
                <div className="p-4"><ThemeEditorPanel tenantSlug={tenantSlug} /></div>
              ) : (
                <>
                  <div className="p-4 border-b" style={{ borderColor: 'var(--border, #333333)' }}>
                    <div className="flex items-center justify-between">
                      <h2 className="font-mono uppercase text-xs opacity-50">{blocks.length} blocks</h2>
                      <button onClick={() => setShowAddBlock(!showAddBlock)} className="font-mono uppercase rounded-full border px-3 py-1 text-xs inline-flex items-center gap-1.5 hover:border-accent hover:text-accent transition-colors" style={{ borderColor: 'var(--border, #333333)' }}>
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    {showAddBlock && (
                      <div className="space-y-3 mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          {BLOCK_TYPES.map((t) => (
                            <button key={t.value} onClick={() => setAddingType(t.value)} className={`text-left border rounded-lg px-3 py-2 transition-colors ${addingType === t.value ? 'border-accent bg-accent/5' : 'border-hover:border-accent'}`} style={{ borderColor: addingType === t.value ? 'var(--accent, #5B9BF6)' : 'var(--border, #333333)' }}>
                              <p className="font-display text-sm">{t.label}</p>
                            </button>
                          ))}
                        </div>
                        {addingType && (
                          <div className="flex gap-2">
                            <button onClick={handleAddBlock} className="flex-1 font-mono uppercase rounded-full border px-4 py-1.5 text-xs hover:bg-accent hover:text-white transition-colors" style={{ borderColor: 'var(--accent, #5B9BF6)', color: 'var(--accent, #5B9BF6)' }}>Add {BLOCK_TYPES.find((t) => t.value === addingType)?.label}</button>
                            <button onClick={() => { setAddingType(''); setShowAddBlock(false); }} className="font-mono uppercase rounded-full border px-4 py-1.5 text-xs opacity-50 hover:bg-surface transition-colors" style={{ borderColor: 'var(--border, #333333)' }}>Cancel</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2" style={{ background: theme.colors?.background }}>
                    <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      {blocks.map((block, i) => (
                        <SortableBlockItem key={block.id} block={block} onEdit={handleConfigEdit} onToggleVisibility={handleToggleVisibility} onDelete={handleDelete} onMoveUp={() => handleMove(block.id, 'up')} onMoveDown={() => handleMove(block.id, 'down')} isFirst={i === 0} isLast={i === blocks.length - 1} />
                      ))}
                    </SortableContext>
                    <DragOverlay dropAnimation={null}>
                      {activeId ? (() => { const b = blocks.find((x) => x.id === activeId); if (!b) return null; const t = BLOCK_TYPES.find((t) => t.value === b.blockType); return <div className="border-2 border-dashed bg-accent/10 rounded-lg px-3 py-2 flex items-center gap-2" style={{ borderColor: 'var(--accent, #5B9BF6)' }}><GripVertical className="w-4 h-4" style={{ color: 'var(--accent, #5B9BF6)' }} /><span className="font-mono uppercase text-sm" style={{ color: 'var(--accent, #5B9BF6)' }}>{t?.label || b.blockType}</span></div>; })() : null}
                    </DragOverlay>
                    {blocks.length === 0 && !showAddBlock && (
                      <div className="py-16 text-center">
                        <p className="font-mono uppercase text-sm opacity-50">No blocks yet</p>
                        <button onClick={() => setShowAddBlock(true)} className="mt-3 font-mono uppercase rounded-full border px-4 py-2 text-xs inline-flex items-center gap-1.5 hover:border-accent hover:text-accent transition-colors" style={{ borderColor: 'var(--border, #333333)' }}><Plus className="w-3 h-3" /> Add your first block</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-3 border-t shrink-0" style={{ borderColor: 'var(--border, #333333)' }}>
              <p className="font-mono text-xs opacity-30">Drag to reorder • Click edit to configure</p>
            </div>
          </div>

          {/* Right panel — Live Preview themed */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-2 border-b flex items-center gap-2 shrink-0" style={{ borderColor: 'var(--border, #333333)' }}>
              <Monitor className="w-4 h-4 opacity-50" />
              <span className="font-mono uppercase text-xs opacity-50">Live Preview — {theme.mode} mode</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <LivePreview blocks={blocks} tenantSlug={tenantSlug} />
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

// ── Main Page (with ThemeProvider) ───────────────────────────────────────────
export default function BlockEditorPage() {
  const { tenantSlug } = useParams();
  return (
    <ThemeProvider tenantSlug={tenantSlug} key={`theme-${tenantSlug}`}>
      <BlockEditorInner />
    </ThemeProvider>
  );
}

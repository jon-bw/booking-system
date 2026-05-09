import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const BLOCK_COMPONENTS = {
  hero: HeroBlock,
  room_list: RoomListBlock,
  about: AboutBlock,
  gallery: GalleryBlock,
  contact: ContactBlock,
  cta: CTABlock,
  booking_form: BookingFormBlock,
  testimonials: TestimonialsBlock,
  rich_text: RichTextBlock,
};

export default function PublicTenantPage() {
  const { tenantSlug } = useParams();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tenantSlug) return;
    api.getPublicPage(tenantSlug)
      .then((data) => {
        setBlocks(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load page');
      })
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6 px-6">
        <h1 className="font-display text-4xl text-text">Page Not Available</h1>
        <p className="font-mono uppercase text-xs text-text-muted">{error}</p>
        <Link
          to="/"
          className="font-mono uppercase rounded-full border border-border px-6 py-3 text-sm text-text hover:bg-surface transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6 px-6">
        <h1 className="font-display text-4xl text-text">Page Coming Soon</h1>
        <p className="font-mono uppercase text-xs text-text-muted">This page is currently being built.</p>
        <Link
          to="/"
          className="font-mono uppercase rounded-full border border-border px-6 py-3 text-sm text-text hover:bg-surface transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const renderBlock = (block) => {
    const Component = BLOCK_COMPONENTS[block.blockType];
    if (!Component) {
      return (
        <div key={block.id} className="border-b border-border py-16 text-center">
          <p className="font-mono uppercase text-xs text-text-muted">Unknown block type: {block.blockType}</p>
        </div>
      );
    }
    const config = typeof block.config === 'string' ? JSON.parse(block.config) : (block.config || {});
    const props = block.blockType === 'room_list' ? { config, tenantSlug } : { config };
    return <Component key={block.id} {...props} />;
  };

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      {blocks.map(renderBlock)}
    </div>
  );
}

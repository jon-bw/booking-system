import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { api } from '../api/client.js';

function formatPrice(price) {
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}k/hr`;
  return `$${price}/hr`;
}

export default function BrowsePage() {
  const { tenantSlug } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listRooms(tenantSlug)
      .then((data) => {
        setRooms(Array.isArray(data.data) ? data.data.filter((r) => !r.isDeleted) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenantSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading rooms</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center py-24 space-y-3 border border-border bg-surface">
          <p className="font-mono uppercase text-sm text-text-muted">No rooms available</p>
          <p className="font-sans text-xs text-text-muted">Check back later for updates</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="font-mono uppercase text-xs text-text-muted">
          {rooms.length} room{rooms.length !== 1 ? 's' : ''} available
        </h2>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
      <div key={room.id} className="bg-surface border border-border flex flex-col">
        {(room.images && room.images.length > 0) ? (
          <img src={room.images[0]} alt={room.name} className="w-full h-48 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="w-full h-48 bg-bg flex items-center justify-center"><p className="font-mono text-xs text-text-muted uppercase">No image</p></div>
        )}
        <div className="p-6 flex flex-col space-y-4 flex-1">
          <div className="space-y-1">
            <h3 className="font-sans text-xl font-medium text-text">{room.name}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-text-muted" />
                <span className="font-mono text-sm text-text-muted">{room.capacity}</span>
              </div>
              <span className="font-display text-lg text-accent">
                {formatPrice(room.pricePerHour)}
              </span>
            </div>
          </div>

          <Link
            to={`/${tenantSlug}/room/${room.id}`}
            className="font-mono uppercase rounded-full border border-border px-4 py-2 text-xs text-text text-center hover:bg-surface hover:border-accent hover:text-accent transition-colors mt-auto"
          >
            Book Now
          </Link>
        </div>
      </div>
        ))}
      </div>
    </main>
  );
}

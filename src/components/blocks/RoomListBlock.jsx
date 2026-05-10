import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';

export function RoomListBlock({ config = {}, tenantSlug = '' }) {
  const { title = 'Our Rooms', showPrices = true, showCapacity = true } = config;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantSlug) return;
    setLoading(true);
    api.listRooms(tenantSlug)
      .then((data) => setRooms(Array.isArray(data.data) ? data.data : []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  if (loading || !rooms || rooms.length === 0) {
    return (
      <section className="border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-4xl text-text text-center">{title}</h2>
          <p className="font-mono uppercase text-sm text-text-muted text-center mt-8">
            {loading ? 'Loading...' : 'No rooms available'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-display text-4xl text-text text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to={`/${tenantSlug}/room/${room.id}`}
              className="border border-border p-6 space-y-3 hover:border-text-muted transition-colors"
            >
              <h3 className="font-display text-2xl text-text">{room.name}</h3>
              {room.description && <p className="font-sans text-sm text-text-muted">{room.description}</p>}
              <div className="flex gap-4 font-mono text-xs text-text-muted uppercase">
                {showCapacity && <span>Cap: {room.capacity}</span>}
                {showPrices && <span>{room.pricePerHour}/hr</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

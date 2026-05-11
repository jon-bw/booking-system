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
      .then((data) => setRooms(Array.isArray(data.data) ? data.data.filter((r) => !r.isDeleted) : []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  if (loading || !rooms || rooms.length === 0) {
    return (
      <section className="border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-4xl text-center mb-12">{title}</h2>
          <p className="font-mono uppercase text-sm text-center mt-8">
            {loading ? 'Loading...' : 'No rooms available'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-display text-4xl text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to={`/${tenantSlug}/room/${room.id}`}
              className="border border-border flex flex-col hover:border-accent transition-colors group"
            >
              {/* Room image */}
              <div className="w-full h-48 overflow-hidden bg-bg">
                {room.images && room.images.length > 0 ? (
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="font-mono text-xs text-text-muted uppercase">No image</p>
                  </div>
                )}
              </div>

              {/* Room details */}
              <div className="p-6 space-y-3 flex-1">
                <h3 className="font-display text-2xl">{room.name}</h3>
                <div className="flex gap-4 font-mono text-xs uppercase text-text-muted">
                  {showCapacity && <span>Cap: {room.capacity}</span>}
                  {showPrices && <span>${room.pricePerHour}/hr</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

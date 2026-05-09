import { Link } from 'react-router-dom';

export function RoomListBlock({ config = {}, tenantSlug = '' }) {
  const { title = 'Our Rooms', rooms = [], showPrices = true, showCapacity = true } = config;

  if (!rooms || rooms.length === 0) {
    return (
      <section className="border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-4xl text-text text-center">{title}</h2>
          <p className="font-mono uppercase text-sm text-text-muted text-center mt-8">No rooms available</p>
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
              key={room.id || room.slug || room.name}
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

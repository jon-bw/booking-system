import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { api } from '../api/client.js';
import { Link } from 'react-router-dom';

function formatPrice(price) {
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}k/hr`;
  return `$${price}/hr`;
}

function toLocalISOString(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function RoomDetailPage() {
  const { tenantSlug, roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null); // true/false/null
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    api.getRoom(tenantSlug, roomId)
      .then((data) => {
        const r = data.data || data;
        setRoom(r);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenantSlug, roomId]);

  const handleCheckAvailability = async () => {
    if (!start || !end) {
      setError('Please select both start and end times');
      return;
    }
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    if (endMs <= startMs) {
      setError('End time must be after start time');
      return;
    }
    setChecking(true);
    setError('');
    setAvailable(null);
    try {
      await api.checkAvailability(tenantSlug, roomId, startMs, endMs);
      setAvailable(true);
    } catch (err) {
      setAvailable(false);
      setError(err.message || 'Timeslot is not available');
    } finally {
      setChecking(false);
    }
  };

  const handleBook = async () => {
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await api.createBooking(tenantSlug, {
        roomId,
        customerName: customerName.trim(),
        startTime: new Date(start).getTime(),
        endTime: new Date(end).getTime(),
      });
      setBooked(true);
      setAvailable(null);
    } catch (err) {
      setError(err.message || 'Booking failed — timeslot may have been taken');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading room</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="font-mono uppercase text-sm text-text-muted">Room not found</p>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      {/* Back link */}
      <Link
        to={`/${tenantSlug}`}
        className="inline-flex items-center gap-2 font-mono uppercase text-xs text-text-muted hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to rooms
      </Link>

      {/* Room info */}
      <div className="bg-surface border border-border p-8 space-y-6">
        <div>
          <h2 className="font-display text-3xl text-text">{room.name}</h2>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-text-muted" />
              <span className="font-mono text-sm text-text-muted">Up to {room.capacity}</span>
            </div>
            <span className="font-display text-2xl text-accent">
              {formatPrice(room.pricePerHour)}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-6">
          <h3 className="font-mono uppercase text-xs text-text-muted">Book this room</h3>

          {/* Date/time pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-mono uppercase text-xs text-text-muted">Start time</label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setAvailable(null);
                  setBooked(false);
                  setError('');
                }}
                className="w-full bg-surface border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono uppercase text-xs text-text-muted">End time</label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setAvailable(null);
                  setBooked(false);
                  setError('');
                }}
                className="w-full bg-surface border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Customer name */}
          <div className="space-y-2">
            <label className="font-mono uppercase text-xs text-text-muted">Your name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-surface border border-border rounded-full px-4 py-2 text-sm text-text placeholder:text-text-muted font-mono focus:outline-none focus:border-accent"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="font-mono text-xs text-destructive">{error}</p>
          )}

          {/* Success */}
          {booked && (
            <p className="font-mono text-xs text-success">Booking confirmed!</p>
          )}

          {/* Available state */}
          {available === true && !booked && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-success">Available</span>
              <button
                onClick={handleBook}
                disabled={creating}
                className="font-mono uppercase rounded-full border border-success px-6 py-2 text-xs text-success hover:bg-success hover:text-white transition-colors disabled:opacity-50"
              >
                {creating ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          )}

          {/* Check button or unavailable */}
          {available === null && !booked && (
            <button
              onClick={handleCheckAvailability}
              disabled={checking}
              className="font-mono uppercase rounded-full border border-border px-8 py-3 text-sm text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>
          )}

          {available === false && (
            <button
              onClick={handleCheckAvailability}
              disabled={checking}
              className="font-mono uppercase rounded-full border border-border px-8 py-3 text-sm text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            >
              Try Different Times
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

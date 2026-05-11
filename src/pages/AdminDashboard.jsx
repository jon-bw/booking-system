import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Users } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function formatDate(ts) {
  return new Date(ts).toLocaleString();
}

function StatusBadge({ status }) {
  const color = status === 'confirmed' ? 'text-success border-success' : 'text-amber-400 border-amber-400';
  return (
    <span className={`font-mono uppercase text-xs border rounded-full px-3 py-0.5 ${color}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const { tenantSlug } = useParams();
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'bookings' | 'users'
  const [tenant, setTenant] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '', pricePerHour: '', images: '' });
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
  const [userMessage, setUserMessage] = useState('');

  // Load tenant
  useEffect(() => {
    api.getTenant(tenantSlug)
      .then((data) => {
        setTenant(data.data || data);
      })
      .finally(() => {
        api.listRooms(tenantSlug)
          .then((data) => setRooms(Array.isArray(data.data) ? data.data : []))
          .finally(() => {
            api.listBookings(tenantSlug)
              .then((data) => setBookings(Array.isArray(data.data) ? data.data : []))
              .finally(() => {
                fetch(`/api/users`, { credentials: 'include' })
                  .then((r) => r.json())
                  .then((d) => { if (d.success) setUsers(d.data); })
                  .finally(() => setLoading(false))
                  .catch(() => setLoading(false));
              });
          });
      })
      .catch(() => setLoading(false));
  }, [tenantSlug]);

  const handleDeleteRoom = async (id) => {
    await api.deleteRoom(tenantSlug, id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddRoom = async () => {
    setError('');
    try {
      if (!newRoom.name || !newRoom.capacity || !newRoom.pricePerHour) {
        setError('All fields are required');
        return;
      }
      const images = newRoom.images
        ? newRoom.images.split('\n').map((u) => u.trim()).filter(Boolean)
        : [];
      const created = await api.createRoom(tenantSlug, {
        name: newRoom.name,
        capacity: parseInt(newRoom.capacity, 10),
        pricePerHour: parseInt(newRoom.pricePerHour, 10),
        images,
      });
      setRooms((prev) => [...prev, created.data || created]);
      setNewRoom({ name: '', capacity: '', pricePerHour: '', images: '' });
      setShowAddRoom(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await api.deleteBooking(tenantSlug, id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddUser = async () => {
    setUserMessage('');
    setError('');
    try {
      if (!newUser.email || !newUser.password) {
        setError('Email and password are required');
        return;
      }
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          tenantId: tenant?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create user');
      } else {
        setUserMessage('User created successfully');
        setUsers((prev) => [...prev, data.data]);
        setNewUser({ email: '', password: '', role: 'user' });
        setShowAddUser(false);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const roomMap = new Map();
  rooms.forEach((r) => roomMap.set(r.id, r.name));

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6">
        <h1 className="font-display text-4xl text-text">Tenant Not Found</h1>
        <Link to="/" className="font-mono uppercase rounded-full border border-border px-6 py-3 text-sm text-text hover:bg-surface transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to={`/${tenantSlug}`}
                className="font-mono uppercase text-xs text-text-muted hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-3 h-3 inline mr-1" />
                Browse
              </Link>
            </div>
            <h1 className="font-display text-3xl text-text mt-2">{tenant.name} — Admin</h1>
            <p className="font-mono text-xs text-text-muted mt-1">/{tenant.slug}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-text-muted capitalize">{profile?.role}</span>
            <button
              onClick={logout}
              className="font-mono uppercase text-xs border border-border rounded-full px-4 py-2 hover:bg-surface transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-4 flex gap-2">
          {/* Tabs */}
            <button
              onClick={() => setActiveTab('rooms')}
              className={`font-mono uppercase rounded-full border px-5 py-2 text-xs transition-colors ${
                activeTab === 'rooms'
                  ? 'border-accent text-accent'
                  : 'border-border text-text hover:bg-surface hover:text-accent'
              }`}
            >
              Rooms
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`font-mono uppercase rounded-full border px-5 py-2 text-xs transition-colors ${
                activeTab === 'bookings'
                  ? 'border-accent text-accent'
                  : 'border-border text-text hover:bg-surface hover:text-accent'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`font-mono uppercase rounded-full border px-5 py-2 text-xs transition-colors ${
                activeTab === 'users'
                  ? 'border-accent text-accent'
                  : 'border-border text-text hover:bg-surface hover:text-accent'
              }`}
            >
              Users
            </button>
          </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <p className="font-mono text-xs text-destructive">{error}</p>
        </div>
      )}
      {userMessage && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <p className="font-mono text-xs text-green-500">{userMessage}</p>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ═══ ROOMS TAB ═══ */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-mono uppercase text-xs text-text-muted">
                {rooms.length} room{rooms.length !== 1 ? 's' : ''}
              </h2>
              <button
                onClick={() => setShowAddRoom(!showAddRoom)}
                className="font-mono uppercase rounded-full border border-border px-4 py-2 text-xs text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-3 h-3" />
                Add Room
              </button>
            </div>

            {/* Add room form */}
            {showAddRoom && (
              <div className="bg-surface border border-border p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-xs text-text-muted">Name</label>
                    <input
                      type="text"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      placeholder="Room name"
                      className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-xs text-text-muted">Capacity</label>
                    <input
                      type="number"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                      placeholder="0"
                      className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-xs text-text-muted">Price/hr</label>
                    <input
                      type="number"
                      value={newRoom.pricePerHour}
                      onChange={(e) => setNewRoom({ ...newRoom, pricePerHour: e.target.value })}
                      placeholder="0"
                      className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-mono uppercase text-xs text-text-muted">Images (one URL per line)</label>
                  <textarea
                    value={newRoom.images}
                    onChange={(e) => setNewRoom({ ...newRoom, images: e.target.value })}
                    placeholder="https://example.com/room-photo-1.jpg&#10;https://example.com/room-photo-2.jpg"
                    rows={3}
                    className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent resize-y"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddRoom}
                    className="font-mono uppercase rounded-full border border-accent px-6 py-2 text-xs text-accent hover:bg-accent hover:text-white transition-colors"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={() => setShowAddRoom(false)}
                    className="font-mono uppercase rounded-full border border-border px-6 py-2 text-xs text-text hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Rooms table */}
            <div className="bg-surface border border-border">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 font-mono text-xs uppercase text-text-muted border-b border-border">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Capacity</div>
                <div className="col-span-2">Price/Hr</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Actions</div>
              </div>

              {rooms.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="font-mono uppercase text-sm text-text-muted">No rooms</p>
                </div>
              ) : (
                rooms.map((room, i) => (
                  <div
                    key={room.id}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 ${
                      i !== rooms.length - 1 ? 'border-b border-border' : ''
                    } ${room.isDeleted ? 'opacity-40' : ''}`}
                  >
                    <div className="col-span-5">
                      <p className="text-text font-medium">{room.name}</p>
                      <p className="sm:hidden font-mono text-xs text-text-muted mt-1">Cap: {room.capacity} · {room.pricePerHour}/hr</p>
                    </div>
                    <div className="col-span-2 hidden sm:flex items-center">
                      <span className="font-mono text-sm text-text-muted">{room.capacity}</span>
                    </div>
                    <div className="col-span-2 hidden sm:flex items-center">
                      <span className="font-mono text-sm text-text">{room.pricePerHour}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span
                        className={`font-mono uppercase text-xs ${
                          room.isDeleted ? 'text-destructive' : 'text-success'
                        }`}
                      >
                        {room.isDeleted ? 'Deleted' : 'Active'}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        disabled={room.isDeleted}
                        className="font-mono uppercase rounded-full border px-3 py-1 text-xs text-destructive border-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ═══ BOOKINGS TAB ═══ */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="font-mono uppercase text-xs text-text-muted">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </h2>

            <div className="bg-surface border border-border">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 font-mono text-xs uppercase text-text-muted border-b border-border">
                <div className="col-span-3">Customer</div>
                <div className="col-span-3">Room</div>
                <div className="col-span-2">Start</div>
                <div className="col-span-2">End</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1"></div>
              </div>

              {bookings.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="font-mono uppercase text-sm text-text-muted">No bookings</p>
                </div>
              ) : (
                bookings.map((booking, i) => (
                  <div
                    key={booking.id}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 ${
                      i !== bookings.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="col-span-3">
                      <p className="text-text font-medium">{booking.customerName}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="font-mono text-sm text-text-muted">{roomMap.get(booking.roomId) || 'Unknown'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="sm:hidden font-mono uppercase text-xs text-text-muted mb-1">Start</p>
                      <p className="font-mono text-xs text-text">{formatDate(booking.startTime)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="sm:hidden font-mono uppercase text-xs text-text-muted mb-1">End</p>
                      <p className="font-mono text-xs text-text">{formatDate(booking.endTime)}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-1 flex items-center">
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="font-mono uppercase rounded-full border border-destructive px-3 py-1 text-xs text-destructive hover:bg-destructive hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ═══ USERS TAB ═══ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-mono uppercase text-xs text-text-muted">
                {users.length} user{users.length !== 1 ? 's' : ''}
              </h2>
              {profile?.role === 'admin' && (
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="font-mono uppercase rounded-full border border-border px-4 py-2 text-xs text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Add User
                </button>
              )}
            </div>

            {/* Add user form */}
            {showAddUser && profile?.role === 'admin' && (
              <div className="bg-surface border border-border p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-xs text-text-muted">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-xs text-text-muted">Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-xs text-text-muted">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddUser}
                    className="font-mono uppercase rounded-full border border-accent px-6 py-2 text-xs text-accent hover:bg-accent hover:text-white transition-colors"
                  >
                    Create User
                  </button>
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="font-mono uppercase rounded-full border border-border px-6 py-2 text-xs text-text hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Users table */}
            <div className="bg-surface border border-border">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 font-mono text-xs uppercase text-text-muted border-b border-border">
                <div className="col-span-4">User ID</div>
                <div className="col-span-4">Role</div>
                <div className="col-span-4">Tenant</div>
              </div>

              {users.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="font-mono uppercase text-sm text-text-muted">No users</p>
                </div>
              ) : (
                users.map((u, i) => (
                  <div
                    key={u.userId}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 ${
                      i !== users.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="col-span-4">
                      <p className="text-text font-medium font-mono text-sm">{u.userId}</p>
                    </div>
                    <div className="col-span-4">
                      <span className="font-mono text-sm text-text-muted capitalize">{u.role}</span>
                    </div>
                    <div className="col-span-4">
                      <span className="font-mono text-sm text-text-muted">{u.tenantId ?? '-'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

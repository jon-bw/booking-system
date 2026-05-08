import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowRight, Users, Calendar, DoorOpen, Settings } from 'lucide-react';
import { api } from '../api/client.js';
import { useTenant } from '../context/TenantContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function TenantDashboard() {
  const { tenantSlug } = useParams();
  const { tenant } = useTenant();
  const { profile, isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch rooms and bookings
  useEffect(() => {
    if (!tenantSlug) return;
    setLoading(true);

    Promise.all([
      api.listRooms(tenantSlug),
      api.listBookings(tenantSlug),
    ])
      .then(([roomsData, bookingsData]) => {
        setRooms(Array.isArray(roomsData.data) ? roomsData.data : []);
        setBookings(Array.isArray(bookingsData.data) ? bookingsData.data : []);
      })
      .catch(() => {
        setRooms([]);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  // Fetch users if authenticated and has admin/manager/superadmin role
  useEffect(() => {
    if (!isAuthenticated || !tenant?.id) return;
    if (!['superadmin', 'admin', 'manager'].includes(profile?.role)) return;

    fetch('/api/users', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          // Filter to users belonging to this tenant
          const tenantUsers = d.data.filter((u) => u.tenantId === tenant.id);
          setUsers(tenantUsers);
        }
      })
      .catch(() => setUsers([]));
  }, [isAuthenticated, tenant?.id, profile?.role]);

  const activeRooms = useMemo(() => rooms.filter((r) => !r.isDeleted), [rooms]);

  const todayStart = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }, []);

  const todayEnd = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return now.getTime();
  }, []);

  const nowTs = useMemo(() => Date.now(), []);

  const bookingsToday = useMemo(() => {
    return bookings.filter(
      (b) => b.startTime >= todayStart && b.startTime <= todayEnd
    );
  }, [bookings, todayStart, todayEnd]);

  const availableNow = useMemo(() => {
    const bookedRoomIds = new Set(
      bookings
        .filter(
          (b) =>
            b.status === 'confirmed' &&
            b.startTime <= nowTs &&
            b.endTime > nowTs
        )
        .map((b) => b.roomId)
    );
    return activeRooms.filter((r) => !bookedRoomIds.has(r.id));
  }, [activeRooms, bookings, nowTs]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 5);
  }, [bookings]);

  const roomMap = useMemo(() => {
    const map = new Map();
    rooms.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [rooms]);

  const canManage = ['superadmin', 'admin', 'manager'].includes(profile?.role);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="font-sans text-2xl md:text-3xl text-text">
              Dashboard
            </div>
            <div className="font-mono text-xs text-text-muted mt-1">
              {tenant?.name ?? tenantSlug} — {activeRooms.length} room{activeRooms.length !== 1 ? 's' : ''}
            </div>
          </div>
          {canManage && (
            <Link
              to={`/admin/${tenantSlug}`}
              className="inline-flex items-center gap-2 bg-accent text-white font-mono text-xs uppercase rounded-full px-5 py-2.5 hover:opacity-90 transition-opacity self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              New Room
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="md:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <div className="font-mono text-xs text-text-muted uppercase">Bookings today</div>
                </div>
                <div className="font-display text-4xl text-text">{bookingsToday.length}</div>
              </div>
              <div className="bg-surface border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <DoorOpen className="w-4 h-4 text-text-muted" />
                  <div className="font-mono text-xs text-text-muted uppercase">Available now</div>
                </div>
                <div className="font-display text-4xl text-text">{availableNow.length}</div>
              </div>
            </div>

            {/* Recent bookings */}
            <div className="bg-surface border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-text-muted uppercase">Recent bookings</div>
                <Link
                  to={`/${tenantSlug}`}
                  className="font-mono text-xs text-accent hover:underline"
                >
                  View all
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <p className="text-text-muted text-sm py-4">No bookings yet.</p>
              ) : (
                <div className="space-y-1">
                  {recentBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="min-w-0">
                        <span className="text-sm text-text truncate block">
                          {roomMap.get(b.roomId) || 'Unknown room'}
                        </span>
                        <span className="font-mono text-xs text-text-muted">
                          {b.customerName} · {formatDateShort(b.startTime)} {formatTime(b.startTime)}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-xs uppercase shrink-0 ml-4 ${
                          b.status === 'confirmed' ? 'text-success' : 'text-amber-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available rooms now */}
            {availableNow.length > 0 && (
              <div className="bg-surface border border-border p-5 space-y-4">
                <div className="font-mono text-xs text-text-muted uppercase">
                  Available right now
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableNow.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1.5 bg-bg border border-border rounded-full px-3 py-1.5 text-sm text-text"
                    >
                      <DoorOpen className="w-3.5 h-3.5 text-success" />
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team */}
            <div className="bg-surface border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-text-muted" />
                <div className="font-mono text-xs text-text-muted uppercase">Team</div>
              </div>

              {users.length === 0 ? (
                <p className="text-text-muted text-sm">
                  {isAuthenticated
                    ? 'No team members found.'
                    : 'Sign in to see team members.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {users.slice(0, 6).map((u) => (
                    <div key={u.userId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-mono text-xs text-accent shrink-0">
                        {(u.name || u.userId || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-text truncate">
                          {u.name || u.userId.slice(0, 8)}
                        </div>
                        <div className="font-mono text-xs text-text-muted capitalize">
                          {u.role}
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.length > 6 && (
                    <p className="font-mono text-xs text-text-muted pt-1">
                      +{users.length - 6} more
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-surface border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-text-muted" />
                <div className="font-mono text-xs text-text-muted uppercase">Quick Actions</div>
              </div>
              <div className="space-y-2">
                <Link
                  to={`/${tenantSlug}`}
                  className="flex items-center justify-between text-sm text-text hover:text-accent transition-colors py-1.5"
                >
                  Browse rooms
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {canManage && (
                  <Link
                    to={`/admin/${tenantSlug}`}
                    className="flex items-center justify-between text-sm text-text hover:text-accent transition-colors py-1.5"
                  >
                    Manage rooms
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {canManage && (
                  <Link
                    to={`/admin/${tenantSlug}`}
                    className="flex items-center justify-between text-sm text-text hover:text-accent transition-colors py-1.5"
                  >
                    View bookings
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <Link
                  to="/login"
                  className="flex items-center justify-between text-sm text-text hover:text-accent transition-colors py-1.5"
                >
                  {isAuthenticated ? 'Account settings' : 'Sign in'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

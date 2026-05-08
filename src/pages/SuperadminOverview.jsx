import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  DoorOpen,
  Calendar,
  Users,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SuperadminOverview() {
  const { user, logout } = useAuth();

  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [tenantStats, setTenantStats] = useState({}); // { [tenantId]: { rooms, bookings } }
  const [loading, setLoading] = useState(true);

  // Fetch all tenants and users
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/tenants', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/users', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([tenantsData, usersData]) => {
        const tList = tenantsData.success ? tenantsData.data : [];
        const uList = usersData.success ? usersData.data : [];
        setTenants(tList);
        setUsers(uList);

        // Fetch rooms + bookings for each tenant in parallel
        const fetches = tList.map(async (t) => {
          try {
            const [roomsRes, bookingsRes] = await Promise.all([
              fetch(`/api/tenants/${t.slug}/rooms`, { credentials: 'include' }).then((r) =>
                r.json()
              ),
              fetch(`/api/tenants/${t.slug}/bookings`, { credentials: 'include' }).then((r) =>
                r.json()
              ),
            ]);
            return {
              tenantId: t.id,
              rooms: roomsRes.success ? roomsRes.data : [],
              bookings: bookingsRes.success ? bookingsRes.data : [],
            };
          } catch {
            return { tenantId: t.id, rooms: [], bookings: [] };
          }
        });

        Promise.all(fetches).then((results) => {
          const stats = {};
          results.forEach((r) => {
            stats[r.tenantId] = { rooms: r.rooms, bookings: r.bookings };
          });
          setTenantStats(stats);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
  }, []);

  const totalRooms = useMemo(() => {
    return Object.values(tenantStats).reduce(
      (sum, s) => sum + (s.rooms?.filter((r) => !r.isDeleted).length || 0),
      0
    );
  }, [tenantStats]);

  const totalBookings = useMemo(() => {
    return Object.values(tenantStats).reduce(
      (sum, s) => sum + (s.bookings?.length || 0),
      0
    );
  }, [tenantStats]);

  const allBookings = useMemo(() => {
    const list = [];
    Object.entries(tenantStats).forEach(([tenantId, s]) => {
      const tenantName = tenants.find((t) => String(t.id) === tenantId)?.name || 'Unknown';
      (s.bookings || []).forEach((b) => {
        list.push({ ...b, tenantName, tenantId: Number(tenantId) });
      });
    });
    return list.sort((a, b) => b.startTime - a.startTime);
  }, [tenantStats, tenants]);

  const recentBookings = useMemo(() => allBookings.slice(0, 8), [allBookings]);

  const roleCounts = useMemo(() => {
    const counts = { superadmin: 0, admin: 0, manager: 0, user: 0 };
    users.forEach((u) => {
      if (counts[u.role] !== undefined) counts[u.role]++;
    });
    return counts;
  }, [users]);

  const roomMapPerTenant = useMemo(() => {
    const map = {};
    Object.entries(tenantStats).forEach(([tid, s]) => {
      const m = new Map();
      (s.rooms || []).forEach((r) => m.set(r.id, r.name));
      map[tid] = m;
    });
    return map;
  }, [tenantStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Link
              to="/superadmin"
              className="font-mono uppercase text-xs text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Superadmin
            </Link>
            <h1 className="font-display text-3xl md:text-4xl text-text mt-2">System Overview</h1>
            <p className="font-mono text-xs text-text-muted mt-1">
              Aggregated view across all tenants
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-text-muted">{user?.email}</span>
            <button
              onClick={logout}
              className="font-mono uppercase text-xs border border-border rounded-full px-4 py-2 hover:bg-surface transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs text-text-muted uppercase">Tenants</span>
            </div>
            <div className="font-display text-4xl text-text">{tenants.length}</div>
          </div>
          <div className="bg-surface border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <DoorOpen className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs text-text-muted uppercase">Rooms</span>
            </div>
            <div className="font-display text-4xl text-text">{totalRooms}</div>
          </div>
          <div className="bg-surface border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs text-text-muted uppercase">Bookings</span>
            </div>
            <div className="font-display text-4xl text-text">{totalBookings}</div>
          </div>
          <div className="bg-surface border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs text-text-muted uppercase">Users</span>
            </div>
            <div className="font-display text-4xl text-text">{users.length}</div>
          </div>
        </div>

        {/* Tenants Detail */}
        <div className="bg-surface border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-sans text-lg font-medium text-text">Tenants</h2>
            <span className="font-mono text-xs text-text-muted">{tenants.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border font-mono text-xs uppercase text-text-muted">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3 text-right">Rooms</th>
                  <th className="px-6 py-3 text-right">Bookings</th>
                  <th className="px-6 py-3 text-right">Users</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => {
                  const stats = tenantStats[t.id] || { rooms: [], bookings: [] };
                  const activeRooms = stats.rooms.filter((r) => !r.isDeleted).length;
                  const tenantUsers = users.filter((u) => u.tenantId === t.id).length;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border/50 hover:bg-bg/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-text font-medium">{t.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-text-muted">/{t.slug}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-sm text-text">{activeRooms}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-sm text-text">{stats.bookings.length}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-sm text-text">{tenantUsers}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/${t.slug}`}
                            className="font-mono text-xs text-accent hover:underline"
                          >
                            Browse
                          </Link>
                          <Link
                            to={`/${t.slug}/dashboard`}
                            className="font-mono text-xs text-accent hover:underline"
                          >
                            Dashboard
                          </Link>
                          <Link
                            to={`/admin/${t.slug}`}
                            className="font-mono text-xs text-accent hover:underline"
                          >
                            Admin
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {tenants.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-text-muted font-mono text-sm" colSpan={6}>
                      No tenants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-surface border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <h2 className="font-sans text-lg font-medium text-text">Recent Bookings</h2>
              </div>
              <span className="font-mono text-xs text-text-muted">
                Across all tenants
              </span>
            </div>

            <div className="divide-y divide-border">
              {recentBookings.length === 0 ? (
                <div className="px-6 py-8 text-text-muted text-sm">No bookings yet.</div>
              ) : (
                recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-bg/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-text truncate">
                        {(roomMapPerTenant[b.tenantId]?.get(b.roomId)) || 'Unknown room'}
                      </div>
                      <div className="font-mono text-xs text-text-muted mt-0.5">
                        {b.customerName} · {b.tenantName}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="font-mono text-xs text-text">{formatDate(b.startTime)}</div>
                      <div
                        className={`font-mono text-xs uppercase mt-0.5 ${
                          b.status === 'confirmed' ? 'text-success' : 'text-amber-400'
                        }`}
                      >
                        {b.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar: Users + Roles */}
          <div className="space-y-6">
            {/* Role Distribution */}
            <div className="bg-surface border border-border p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-accent" />
                <h2 className="font-sans text-base font-medium text-text">User Roles</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(roleCounts).map(([role, count]) => (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs uppercase text-text-muted capitalize">
                        {role}
                      </span>
                      <span className="font-mono text-xs text-text">{count}</span>
                    </div>
                    <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{
                          width:
                            users.length > 0 ? `${(count / users.length) * 100}%` : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Nav */}
            <div className="bg-surface border border-border p-5">
              <h2 className="font-sans text-base font-medium text-text mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  to="/superadmin"
                  className="flex items-center justify-between text-sm text-text hover:text-accent transition-colors py-1.5"
                >
                  Superadmin Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/home"
                  className="flex items-center justify-between text-sm text-text hover:text-accent transition-colors py-1.5"
                >
                  Tenant Directory
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

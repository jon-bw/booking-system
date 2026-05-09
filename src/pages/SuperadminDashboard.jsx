import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  DoorOpen,
  Calendar,
  Users,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus,
  Trash2,
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

export default function SuperadminDashboard() {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'dashboard'

  // ── Shared data ──
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [tenantStats, setTenantStats] = useState({});
  const [loading, setLoading] = useState(true);

  // ── Dashboard-only state ──
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Create tenant state
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantOwnerId, setTenantOwnerId] = useState('');
  const [tenantError, setTenantError] = useState('');
  const [tenantMessage, setTenantMessage] = useState('');

  // Fetch all tenants and users
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/users', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/tenants', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([usersData, tenantsData]) => {
        const uList = usersData.success ? usersData.data : [];
        const tList = tenantsData.success ? tenantsData.data : [];
        setUsers(uList);
        setTenants(tList);

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, role, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to create user');
    } else {
      setMessage('User created successfully');
      setName('');
      setEmail('');
      setPassword('');
      setUsers((prev) => [...prev, data.data]);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setTenantError('');
    setTenantMessage('');

    if (!tenantName || !tenantSlug) {
      setTenantError('Name and slug are required');
      return;
    }

    const body = { name: tenantName, slug: tenantSlug };
    if (tenantOwnerId) body.ownerId = tenantOwnerId;

    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setTenantError(data.error || 'Failed to create tenant');
    } else {
      setTenantMessage('Tenant created successfully');
      setTenantName('');
      setTenantSlug('');
      setTenantOwnerId('');
      setTenants((prev) => [...prev, data.data]);
    }
  };

  const adminUsers = useMemo(() => {
    return users.filter((u) => u.role === 'admin');
  }, [users]);

  const userNameMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.userId, u.name || u.email || u.userId));
    return map;
  }, [users]);

  // ── Overview computed ──
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
            <h1 className="font-display text-3xl md:text-4xl text-text">Superadmin</h1>
            <p className="font-mono text-xs text-text-muted mt-1">
              System management & overview
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

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 pb-4 flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`font-mono uppercase rounded-full border px-5 py-2 text-xs transition-colors ${
              activeTab === 'overview'
                ? 'border-accent text-accent'
                : 'border-border text-text hover:bg-surface hover:text-accent'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`font-mono uppercase rounded-full border px-5 py-2 text-xs transition-colors ${
              activeTab === 'dashboard'
                ? 'border-accent text-accent'
                : 'border-border text-text hover:bg-surface hover:text-accent'
            }`}
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* ═══════════════════════════════════════
            OVERVIEW TAB
        ═══════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
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
                            <span className="font-mono text-sm text-text">
                              {stats.bookings.length}
                            </span>
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
                  <span className="font-mono text-xs text-text-muted">Across all tenants</span>
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
                            {roomMapPerTenant[b.tenantId]?.get(b.roomId) || 'Unknown room'}
                          </div>
                          <div className="font-mono text-xs text-text-muted mt-0.5">
                            {b.customerName} · {b.tenantName}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="font-mono text-xs text-text">
                            {formatDate(b.startTime)}
                          </div>
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

              {/* Sidebar */}
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
          </>
        )}

        {/* ═══════════════════════════════════════
            DASHBOARD TAB
        ═══════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Create Tenant */}
            <section className="bg-surface border border-border p-6 space-y-4">
              <h2 className="font-mono uppercase text-sm text-text-muted">Create Tenant</h2>
              {tenantError && <p className="text-red-500 font-mono text-sm">{tenantError}</p>}
              {tenantMessage && <p className="text-green-500 font-mono text-sm">{tenantMessage}</p>}
              <form onSubmit={handleCreateTenant} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Tenant name"
                  value={tenantName}
                  onChange={(e) => {
                    setTenantName(e.target.value);
                    setTenantSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                    );
                  }}
                  className="bg-bg border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
                  required
                />
                <input
                  type="text"
                  placeholder="slug"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  className="bg-bg border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent font-mono text-sm"
                  required
                />
                <select
                  value={tenantOwnerId}
                  onChange={(e) => setTenantOwnerId(e.target.value)}
                  className="bg-bg border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
                >
                  <option value="">No owner (optional)</option>
                  {adminUsers.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.name || u.email || u.userId.slice(0, 12)}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-accent text-white font-mono uppercase text-sm rounded-full py-2 hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create
                </button>
              </form>
            </section>

            {/* Create User */}
            <section className="bg-surface border border-border p-6 space-y-4">
              <h2 className="font-mono uppercase text-sm text-text-muted">Create User</h2>
              {error && <p className="text-red-500 font-mono text-sm">{error}</p>}
              {message && <p className="text-green-500 font-mono text-sm">{message}</p>}
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-bg border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-bg border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-bg border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
                  required
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-bg border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
                >
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  className="bg-accent text-white font-mono uppercase text-sm rounded-full py-2 hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create
                </button>
              </form>
            </section>

            {/* Users */}
            <section className="bg-surface border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-mono uppercase text-sm text-text-muted">Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Tenant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.userId} className="border-b border-border/50">
                        <td className="px-6 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-text">{u.name || '—'}</span>
                            <span className="font-mono text-xs text-text-muted">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 capitalize">{u.role}</td>
                        <td className="px-6 py-3">{u.tenantId ?? '-'}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td className="px-6 py-8 text-text-muted" colSpan={3}>
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Tenants */}
            <section className="bg-surface border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-mono uppercase text-sm text-text-muted">Tenants</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Slug</th>
                      <th className="px-6 py-3">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => (
                      <tr key={t.id} className="border-b border-border/50">
                        <td className="px-6 py-3">{t.name}</td>
                        <td className="px-6 py-3">{t.slug}</td>
                        <td className="px-6 py-3">
                          {t.ownerId ? userNameMap.get(t.ownerId) || t.ownerId : '-'}
                        </td>
                      </tr>
                    ))}
                    {tenants.length === 0 && (
                      <tr>
                        <td className="px-6 py-8 text-text-muted" colSpan={3}>
                          No tenants found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

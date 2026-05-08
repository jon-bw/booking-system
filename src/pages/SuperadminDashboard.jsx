import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SuperadminDashboard() {
  const { user, profile, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/users', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsers(d.data); });
    fetch('/api/tenants', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setTenants(d.data); });
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to create user');
    } else {
      setMessage('User created successfully');
      setEmail('');
      setPassword('');
      setUsers((prev) => [...prev, data.data]);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl">Superadmin Dashboard</h1>
            <Link
              to="/superadmin/overview"
              className="font-mono text-xs text-accent hover:underline mt-1 inline-block"
            >
              View System Overview →
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-text-muted">{user?.email}</span>
            <button
              onClick={logout}
              className="font-mono uppercase text-xs border border-border rounded-full px-4 py-2 hover:bg-surface transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <section className="border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-mono uppercase text-sm text-text-muted">Create User</h2>
          {error && <p className="text-red-500 font-mono text-sm">{error}</p>}
          {message && <p className="text-green-500 font-mono text-sm">{message}</p>}
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-surface border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
            >
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-accent text-white font-mono uppercase text-sm rounded-full py-2 hover:opacity-90 transition-opacity"
            >
              Create
            </button>
          </form>
        </section>

        <section className="border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-mono uppercase text-sm text-text-muted">Users</h2>
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="pb-2">User ID</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Tenant</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId} className="border-b border-border/50">
                  <td className="py-2">{u.userId}</td>
                  <td className="py-2">{u.role}</td>
                  <td className="py-2">{u.tenantId ?? '-'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td className="py-4 text-text-muted" colSpan={3}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-mono uppercase text-sm text-text-muted">Tenants</h2>
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="pb-2">Name</th>
                <th className="pb-2">Slug</th>
                <th className="pb-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-border/50">
                  <td className="py-2">{t.name}</td>
                  <td className="py-2">{t.slug}</td>
                  <td className="py-2">{t.ownerId ?? '-'}</td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr><td className="py-4 text-text-muted" colSpan={3}>No tenants found</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

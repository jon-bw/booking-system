import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Search } from 'lucide-react';

export default function HomePage() {
  const { profile, isAuthenticated } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.listTenants()
      .then((data) => {
        setTenants(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tenants.filter((t) => {
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="font-display text-4xl text-text">Booking System</h1>
          <p className="font-mono uppercase text-xs text-text-muted mt-2">
            {isAuthenticated && profile?.role !== 'user'
              ? profile?.role === 'superadmin'
                ? 'All tenants (superadmin)'
                : 'Your tenants'
              : 'Select a tenant to continue'}
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-full pl-10 pr-4 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent font-sans"
          />
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <p className="font-mono uppercase text-sm text-text-muted animate-pulse">Loading</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <p className="font-mono uppercase text-sm text-text-muted">No tenants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tenant) => (
              <Link
                key={tenant.id}
                to={`/${tenant.slug}/dashboard`}
                className="group block bg-surface border border-border hover:border-accent transition-colors p-6 space-y-3"
              >
                <h2 className="font-sans text-lg font-medium text-text group-hover:text-accent transition-colors">
                  {tenant.name}
                </h2>
                <p className="font-mono text-xs text-text-muted truncate">
                  /{tenant.slug}
                </p>
                {tenant.color && (
                  <div
                    className="w-8 h-1 rounded-full mt-2"
                    style={{ backgroundColor: tenant.color }}
                  />
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

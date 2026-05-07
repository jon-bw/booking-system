import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext.jsx';

export default function TenantLayout() {
  const { tenant, loading, tenantSlug } = useTenant();
  const navigate = useNavigate();

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
        <p className="font-mono uppercase text-xs text-text-muted">
          No tenant with slug &quot;{tenantSlug}&quot;
        </p>
        <button
          onClick={() => navigate('/')}
          className="font-mono uppercase rounded-full border border-border px-6 py-3 text-sm text-text hover:bg-surface transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      {/* Tenant Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-text">{tenant.name}</h1>
            <p className="font-mono text-xs text-text-muted mt-1">/{tenant.slug}</p>
          </div>
          <nav className="flex gap-3">
            <Link
              to={`/${tenant.slug}`}
              className="font-mono uppercase rounded-full border border-border px-5 py-2 text-xs text-text hover:bg-surface hover:text-accent transition-colors"
            >
              Browse
            </Link>
            <Link
              to={`/admin/${tenant.slug}`}
              className="font-mono uppercase rounded-full border border-border px-5 py-2 text-xs text-text hover:bg-surface hover:text-accent transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Outlet */}
      <Outlet />
    </div>
  );
}

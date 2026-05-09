import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { TenantProvider, useTenant } from './context/TenantContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import TenantLayout from './pages/TenantLayout.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import RoomDetailPage from './pages/RoomDetailPage.jsx';
import TenantDashboard from './pages/TenantDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import SuperadminDashboard from './pages/SuperadminDashboard.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PublicTenantPage from './pages/PublicTenantPage.jsx';
import BlockEditorPage from './pages/BlockEditorPage.jsx';

function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6">
      <h1 className="font-display text-8xl text-accent">404</h1>
      <p className="font-mono uppercase text-text-muted text-sm">Page Not Found</p>
      <a
        href="/"
        className="font-mono uppercase rounded-full border border-border px-6 py-3 text-sm text-text hover:bg-surface transition-colors"
      >
        Return
      </a>
    </div>
  );
}

function SuperadminGuard({ children }) {
  const { profile, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted font-mono">Loading...</div>;
  if (profile?.role !== 'superadmin') return <Navigate to="/login" replace />;
  return children;
}

function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted font-mono">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function TenantAdminGuard({ children }) {
  const { profile, isLoading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();

  if (authLoading || tenantLoading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted font-mono">Loading...</div>;
  }

  // superadmin can access any tenant
  if (profile?.role === 'superadmin') return children;

  // admin/manager can only access their own tenant
  if ((profile?.role === 'admin' || profile?.role === 'manager') && tenant && profile?.tenantId === tenant.id) {
    return children;
  }

  // everyone else is redirected
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/superadmin"
            element={
              <SuperadminGuard>
                <SuperadminDashboard />
              </SuperadminGuard>
            }
          />
          <Route
            path="/:tenantSlug"
            element={
              <TenantProvider>
                <TenantLayout />
              </TenantProvider>
            }
          >
            <Route index element={<BrowsePage />} />
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="room/:roomId" element={<RoomDetailPage />} />
          </Route>
          <Route
            path="/admin/:tenantSlug"
            element={
              <TenantProvider>
                <AuthGuard>
                  <TenantAdminGuard>
                    <AdminDashboard />
                  </TenantAdminGuard>
                </AuthGuard>
              </TenantProvider>
            }
          />
          <Route
            path="/tenants/:tenantSlug"
            element={
              <TenantProvider>
                <PublicTenantPage />
              </TenantProvider>
            }
          />
          <Route
            path="/tenants/:tenantSlug/blocks"
            element={
              <TenantProvider>
                <AuthGuard>
                  <BlockEditorPage />
                </AuthGuard>
              </TenantProvider>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import HomePage from './pages/HomePage.jsx';
import TenantLayout from './pages/TenantLayout.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import RoomDetailPage from './pages/RoomDetailPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-6">
      <h1 className="font-display text-8xl text-accent">404</h1>
      <p className="font-mono uppercase text-text-muted text-sm">Page Not Found</p>
      <a
        href="/"
        className="font-mono uppercase rounded-full border border-border px-6 py-3 text-sm text-text hover:bg-surface transition-colors"
      >
        Return Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/:tenantSlug"
          element={
            <TenantProvider>
              <TenantLayout />
            </TenantProvider>
          }
        >
          <Route index element={<BrowsePage />} />
          <Route path="room/:roomId" element={<RoomDetailPage />} />
        </Route>
        <Route path="/admin/:tenantSlug" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

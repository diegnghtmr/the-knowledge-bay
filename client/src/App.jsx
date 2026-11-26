import { createElement, lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BodyClassManager from './components/layout/BodyClassManager';
import RouteErrorBoundary from './components/layout/RouteErrorBoundary';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Landing from './pages/Landing.jsx';
import Terms from './pages/Terms.jsx';

const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const UserProfileViewPage = lazy(() => import('./pages/profile/UserProfileViewPage'));
const ChatPage = lazy(() => import('./pages/chat/ChatPage'));
const HelpRequestPage = lazy(() => import('./pages/HelpRequestPage'));
const PublishContentPage = lazy(() => import('./pages/PublishContentPage'));
const StudyGroupsPage = lazy(() => import('./pages/StudyGroupsPage'));

const moderatorRoutes = [
  ['/users-dashboard', lazy(() => import('./pages/UserDashboardPage'))],
  ['/content-dashboard', lazy(() => import('./pages/ContentDashboardPage'))],
  ['/affinity-graph', lazy(() => import('./pages/AffinityGraphPage'))],
  ['/admin/analytics', lazy(() => import('./pages/admin/DashboardAnalyticsPage'))],
  ['/admin/interests', lazy(() => import('./pages/admin/InterestManagementPage'))],
  ['/admin/help-requests', lazy(() => import('./pages/admin/HelpRequestsPage'))],
  ['/admin/stats', lazy(() => import('./pages/admin/AdminDashboardStatsPage'))],
];

function RouteLoading() {
  return <p role="status" className="p-6 text-center text-(--deep-sea)">Cargando...</p>;
}

export default function App() {
  const { status, isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  const home = isAuthenticated ? '/' : '/landing';

  if (status === 'checking') return <RouteLoading />;
  if (status === 'unavailable') {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center text-(--deep-sea)">
        <p role="alert">No pudimos verificar tu sesión.</p>
        <button type="button" className="underline" onClick={() => window.location.reload()}>Reintentar</button>
      </main>
    );
  }

  return (
    <>
      <BodyClassManager />
      <RouteErrorBoundary locationKey={location.key} home={home}>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/terms" element={<Terms />} />
            {isAuthenticated ? (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/user/:userId" element={<UserProfileViewPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/study-groups" element={<StudyGroupsPage />} />
                <Route path="/help-request" element={<HelpRequestPage />} />
                <Route path="/publish-content" element={<PublishContentPage />} />
                {moderatorRoutes.map(([path, Page]) => (
                  <Route key={path} path={path} element={userRole === 'moderator' ? createElement(Page) : <Navigate to="/" replace />} />
                ))}
              </>
            ) : (
              <>
                <Route path="/register" element={<Landing />} />
                <Route path="/register/steps" element={<Landing />} />
                <Route path="/login" element={<Landing />} />
                <Route path="/landing" element={<Landing />} />
              </>
            )}
            <Route path="*" element={<Navigate to={home} replace />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </>
  );
}

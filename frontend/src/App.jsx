import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppShell     from './components/AppShell';

// Role dashboards & pages
import Dashboard    from './pages/Dashboard';
import CasesPage    from './pages/CasesPage';
import CaseDetail   from './pages/CaseDetail';
import FileCase     from './pages/FileCase';
import AffidavitGen from './pages/AffidavitGen';
import HearingsPage from './pages/HearingsPage';
import DocumentsPage from './pages/DocumentsPage';
import UsersPage    from './pages/UsersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AssignPage   from './pages/AssignPage';
import ChatPage     from './pages/ChatPage';
import ProfilePage  from './pages/ProfilePage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="profile"    element={<ProfilePage />} />
        <Route path="chat"       element={<ChatPage />} />
        <Route path="hearings"   element={<HearingsPage />} />
        <Route path="documents"  element={<DocumentsPage />} />

        {/* User routes */}
        <Route path="affidavit" element={<ProtectedRoute roles={['user']}><AffidavitGen /></ProtectedRoute>} />
        <Route path="file-case" element={<ProtectedRoute roles={['user']}><FileCase /></ProtectedRoute>} />
        <Route path="my-cases"  element={<ProtectedRoute roles={['user']}><CasesPage /></ProtectedRoute>} />

        {/* Judge routes */}
        <Route path="assigned-cases" element={<ProtectedRoute roles={['judge']}><CasesPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="cases"     element={<ProtectedRoute roles={['admin']}><CasesPage /></ProtectedRoute>} />
        <Route path="users"     element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="assign"    element={<ProtectedRoute roles={['admin']}><AssignPage /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute roles={['admin']}><AnalyticsPage /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="cases/:id" element={<CaseDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const EditorPage = lazy(() => import('@/pages/EditorPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const UserCenterPage = lazy(() => import('@/pages/UserCenterPage'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('smartdraw-token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLoader() {
  return (
    <div className="h-screen bg-editor-bg flex items-center justify-center">
      <div className="text-editor-textMuted text-sm">加载中...</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<AppLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/editor/:diagramId" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/user" element={<PrivateRoute><UserCenterPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

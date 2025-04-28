import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ChatWindowPage from './pages/ChatWindowPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Layout from './components/Layout/Layout';
// Removed AdminDashboardPage import
import EditProfilePage from './pages/EditProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPlansPage from './pages/AdminPlansPage';
// Removed AdminModelsPage import
import AdminBrandingPage from './pages/AdminBrandingPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import TailwindCustomizerPage from './pages/TailwindCustomizerPage';
import PlansPage from './pages/PlansPage';
import AdminSubscriptionsPage from './pages/AdminSubscriptionsPage';
import AdminLLMPage from './pages/AdminLLMPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AppProvider>
      <Routes>
        {/* Set LandingPage as the default route */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Routes that use the Layout */}
        <Route element={<Layout />}> {/* Use a layout route */}
          <Route path="/chat" element={<ChatWindowPage />} /> {/* CORRIGIDO: Chat page agora está em /chat */}
					<Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/planos" element={<PlansPage />} />
					{/* Removed Admin Dashboard Route */}
					<Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/plans" element={<AdminPlansPage />} />
          {/* Removed Admin Models Route */}
          <Route path="/admin/branding" element={<AdminBrandingPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/tailwind" element={<TailwindCustomizerPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/llm" element={<AdminLLMPage />} />
        </Route>

        {/* Fallback route - redirects to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}

export default App;

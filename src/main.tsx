import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard, Ingredients, Dishes, MenuEngineering, FixedCosts } from './pages/Views';
import { EventsList, EventEditor, PublicMenu } from './pages/Events';
import { Settings } from './pages/Settings';
import { OrdersManager } from './pages/OrdersManager';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { SuperadminDashboard } from './pages/SuperadminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { useStore } from './store/useStore';
import './index.css';

function Root() {
  const { user } = useAuthStore();
  const { fetchCompanyData } = useStore();

  React.useEffect(() => {
    if (user && user.role === 'company') {
      fetchCompanyData();
    }
  }, [user, fetchCompanyData]);

  return (
    <Routes>
      {/* 1. SECCIÓN PÚBLICA: Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. LOGIN: Si ya está logueado, lo mandamos al dashboard automáticamente */}
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : <Login />
      } />

      {/* 3. SECCIÓN PRIVADA: Todo dentro de ProtectedRoute y MainLayout */}
      {/* Quitamos el path="/app" para que las rutas sean directas (/ingredients, /events, etc) */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* Dashboard Dinámico */}
        <Route path="/dashboard" element={
          user?.role === 'superadmin'
            ? <SuperadminDashboard />
            : <Dashboard />
        } />

        {/* Rutas de Gestión */}
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/dishes" element={<Dishes />} />
        <Route path="/fixed-costs" element={<FixedCosts />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventEditor />} />
        <Route path="/menu-engineering" element={<MenuEngineering />} />
        <Route path="/orders" element={<OrdersManager />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* 4. MENÚ PÚBLICO: Para los clientes finales (no requiere login) */}
      <Route path="/menu/:id" element={<PublicMenu />} />

      {/* 5. FALLBACK: Si la ruta no existe o algo falla */}
      <Route path="*" element={
        <Navigate to={user ? "/dashboard" : "/"} replace />
      } />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);
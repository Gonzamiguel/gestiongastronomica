import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard, Ingredients, Dishes, MenuEngineering, FixedCosts } from './pages/Views';
import { EventsList, EventEditor, PublicMenu } from './pages/Events';
import { Settings } from './pages/Settings';
import { OrdersManager } from './pages/OrdersManager';
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
      {/* Ruta de Login - Pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas Privadas Protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* ENRUTAMIENTO POR ROL EN LA RAÍZ */}
        <Route index element={
          user?.role === 'superadmin' 
            ? <SuperadminDashboard /> 
            : <Dashboard />
        } />
        
        {/* Rutas exclusivas de Empresa (vistas operativas) */}
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="dishes" element={<Dishes />} />
        <Route path="fixed-costs" element={<FixedCosts />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/:id" element={<EventEditor />} />
        <Route path="menu-engineering" element={<MenuEngineering />} />
        <Route path="orders" element={<OrdersManager />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Vista Pública (Checkout) - No requiere login de admin */}
      <Route path="/menu/:id" element={<PublicMenu />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
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

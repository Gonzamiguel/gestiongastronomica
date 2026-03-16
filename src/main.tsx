import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard, Ingredients, Dishes, MenuEngineering, FixedCosts } from './pages/Views';
import { EventsList, EventEditor, PublicMenu } from './pages/Events';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="dishes" element={<Dishes />} />
          <Route path="fixed-costs" element={<FixedCosts />} />
          <Route path="events" element={<EventsList />} />
          <Route path="events/:id" element={<EventEditor />} />
          <Route path="menu-engineering" element={<MenuEngineering />} />
        </Route>
        {/* Public view with no Sidebar */}
        <Route path="/menu/:id" element={<PublicMenu />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

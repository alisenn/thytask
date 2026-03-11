import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { LocationsPage } from './pages/Locations';
import { TransportationsPage } from './pages/Transportations';
import { RoutesPage } from './pages/Routes';
import { UnauthorizedPage } from './pages/Unauthorized';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/routes" replace />} />
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/locations" element={<LocationsPage />} />
                  <Route path="/transportations" element={<TransportationsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/routes" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;

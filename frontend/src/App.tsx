import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { LocationsPage } from './pages/Locations';
import { TransportationsPage } from './pages/Transportations';
import { RoutesPage } from './pages/Routes';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/routes" replace />} />
              <Route path="/routes" element={<RoutesPage />} />

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/transportations" element={<TransportationsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/routes" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

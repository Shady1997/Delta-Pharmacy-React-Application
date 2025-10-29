import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './pages/auth/LoginScreen';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import ProductsScreen from './pages/products/ProductsScreen';
import OrdersScreen from './pages/orders/OrdersScreen';
import PrescriptionsScreen from './pages/prescriptions/PrescriptionsScreen';
import SupportScreen from './pages/support/SupportScreen';
import ChatScreen from './pages/chat/ChatScreen';
import AnalyticsScreen from './pages/analytics/AnalyticsScreen';
import NotificationsScreen from './pages/notifications/NotificationsScreen';
import UsersScreen from './pages/users/UsersScreen';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - User:', user, 'Roles:', roles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    console.log('ProtectedRoute - User role not authorized, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  console.log('App - User:', user, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <LoginScreen />} 
      />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductsScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/prescriptions" element={<PrescriptionsScreen />} />
        <Route path="/support" element={<SupportScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute roles={['ADMIN', 'PHARMACIST']}>
              <AnalyticsScreen />
            </ProtectedRoute>
          } 
        />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UsersScreen />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch all - redirect to login or home */}
      <Route 
        path="*" 
        element={<Navigate to={user ? "/" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default App;
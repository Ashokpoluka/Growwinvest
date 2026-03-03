import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layout/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import Activity from './pages/Activity';
import Warehouses from './pages/Warehouses';
import Users from './pages/Users';
import Automation from './pages/Automation';
import Predictions from './pages/Predictions';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-[#00d09c]">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-[#00d09c]">Loading...</div>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e1e1e', color: '#fff', border: '1px solid #333' }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/activity" element={<AdminRoute><Activity /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/automation" element={<AdminRoute><Automation /></AdminRoute>} />
          <Route path="/predictions" element={<AdminRoute><Predictions /></AdminRoute>} />
          <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

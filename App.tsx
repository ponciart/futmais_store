import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import NewProduct from './pages/NewProduct';
import Suppliers from './pages/Suppliers';
import Financial from './pages/Financial';
import Logistics from './pages/Logistics';
import Orders from './pages/Orders';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para proteger rotas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-background-dark">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="pos" element={<POS />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="new-product" element={<NewProduct />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="financial" element={<Financial />} />
              <Route path="logistics" element={<Logistics />} />
              <Route path="orders" element={<Orders />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;
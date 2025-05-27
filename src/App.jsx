import React from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignInForm from './components/SignInForm';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ApplicationConfigurationPage from './pages/ApplicationConfigurationPage';
import ApplicationStatusPage from './pages/ApplicationStatusPage';
import Bridge from './pages/Bridge';
import TestResult from './pages/TestResult';
import User from './pages/User';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SignInForm />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard Routes */}
          <Route index element={<DashboardPage />} />
          <Route path="app-config" element={<ApplicationConfigurationPage />} />
          <Route path="app-status" element={<ApplicationStatusPage />} />
          <Route path="bridge" element={<Bridge />} />
          <Route path="test-results" element={<TestResult />} />
          <Route path="users" element={<User />} />
          <Route path="facilities" element={<div>Facilities Page</div>} />
          <Route path="audit-logs" element={<div>Audit Logs Page</div>} />
          <Route path="test-formats" element={<div>Test Formats Page</div>} />
          <Route path="patients-medical" element={<div>Patients Medical Page</div>} />
          <Route path="roles-permission" element={<div>Roles and Permission Page</div>} />
          <Route path="strip-transaction" element={<div>Strip Transaction Page</div>} />
          <Route path="product" element={<div>Product Page</div>} />
        </Route>

        {/* Catch all route - Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

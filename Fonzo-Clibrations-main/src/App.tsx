import './App.css'
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthChecker } from './hooks/useAuthChecker'
import Layout from './components/app/layout'

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/landing'))
const Login = lazy(() => import('./pages/login'))
const ResetPassword = lazy(() => import('./pages/reset-password'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const JobOrders = lazy(() => import('./pages/jobOrders'))
const WorkAssign = lazy(() => import('./pages/workAssign'))
const InventorySupplies = lazy(() => import('./pages/inventorySupplies'))
const Suppliers = lazy(() => import('./pages/suppliers'))
const Mechanics = lazy(() => import('./pages/mechanics'))
const AppointmentScheduling = lazy(() => import('./pages/appointmentScheduling'))
const Customers = lazy(() => import('./pages/customers'))
const UserManagement = lazy(() => import('./pages/userManagement'))
const ActivityLogs = lazy(() => import('./pages/activityLogs'))
const Settings = lazy(() => import('./pages/settings'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg text-gray-600">Loading...</div>
  </div>
)

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isLoading, isAuthenticated } = useAuthChecker();

  if (isLoading) return <p>Loading...</p>;
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.JSX.Element }) {
  const { isLoading, isAuthenticated } = useAuthChecker();

  if (isLoading) return <p>Loading...</p>;
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/job-orders"
          element={
            <PrivateRoute>
              <JobOrders />
            </PrivateRoute>
          }
        />
             <Route
          path="/work-assign"
          element={
            <PrivateRoute>
              <WorkAssign />
            </PrivateRoute>
          }
        />
             <Route
          path="/inventory-supplies"
          element={
            <PrivateRoute>
              <InventorySupplies />
            </PrivateRoute>
          }
        />
             <Route
          path="/suppliers"
          element={
            <PrivateRoute>
              <Suppliers />
            </PrivateRoute>
          }
        />
             <Route
          path="/mechanics"
          element={
            <PrivateRoute>
              <Mechanics />
            </PrivateRoute>
          }
        />
             <Route
          path="/appointment-scheduling"
          element={
            <PrivateRoute>
              <AppointmentScheduling />
            </PrivateRoute>
          }
        />
             <Route
          path="/customers"
          element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          }
        />
             <Route
          path="/user-management"
          element={
            <PrivateRoute>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/activity-logs"
          element={
            <PrivateRoute>
              <ActivityLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default App;

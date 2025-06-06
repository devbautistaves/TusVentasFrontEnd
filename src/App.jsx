"use client"

import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import Layout from "./components/Layout"
import ErrorBoundary from "./components/ErrorBoundary"

// Pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import SalesForm from "./pages/SalesForm"
import SalesHistory from "./pages/SalesHistory"
import Profile from "./pages/Profile"
import AdminDashboard from "./pages/AdminDashboard"
import NotFound from "./pages/NotFound"
import GuidesPage from "./pages/GuidesPage"
import "./App.css"

function App() {
  console.log("App component rendering")

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Default redirect */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* User routes */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="sales/new" element={<SalesForm />} />
                <Route path="sales/history" element={<SalesHistory />} />
                <Route path="profile" element={<Profile />} />
                <Route path="guides" element={<GuidesPage />} />

                {/* Admin routes */}
                <Route
                  path="admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/users"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/plans"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/sales"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

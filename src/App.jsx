import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import SalesForm from "./pages/SalesForm"
import SalesHistory from "./pages/SalesHistory"
import AdminDashboard from "./pages/AdminDashboard"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import Layout from "./components/Layout"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import "./App.css"
import Training from "./pages/Training"
import AdminTraining from "./pages/AdminTraining"
import Chat from "./pages/Chat"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sales/new" element={<SalesForm />} />
            <Route path="sales/history" element={<SalesHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="training" element={<Training />} />
            <Route path="chat" element={<Chat />} />

            {/* Admin Routes */}
            <Route
              path="admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="admin/training" element={<AdminTraining />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

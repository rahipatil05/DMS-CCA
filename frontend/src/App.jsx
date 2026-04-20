import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from './pages/auth/Auth.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Chat from './pages/Chat.jsx'
import Analytics from './pages/Analytics.jsx'
import AdminPanel from './pages/admin/AdminPanel.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060b13]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/User"
          element={
            <ProtectedRoute requiredRole="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRole="user">
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:agentId"
          element={
            <ProtectedRoute requiredRole="user">
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-all */}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#060b13] gap-4">
              <p className="text-6xl">🤖</p>
              <h1 className="text-3xl font-bold text-white">404 — Page Not Found</h1>
              <p className="text-gray-400">The page you're looking for doesn't exist.</p>
              <a href="/" className="mt-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
                Go Home
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App


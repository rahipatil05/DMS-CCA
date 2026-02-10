import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from './pages/auth/Auth.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Chat from './pages/Chat.jsx'
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

        {/* Protected Routes - Require Authentication and Specific Role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Auth />
            </ProtectedRoute>
          }
        />
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
          path="/chat/:agentId"
          element={
            <ProtectedRoute requiredRole="user">
              <Chat />
            </ProtectedRoute>
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


import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protected Route Component - Restricts access based on authentication and role
export default function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, userRole } = useAuth();

    // If not authenticated, redirect to auth page
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    // If a specific role is required and user doesn't have it, redirect to home
    if (requiredRole && userRole !== requiredRole) {
        // Redirect based on their actual role
        if (userRole === "admin") {
            return <Navigate to="/admin" replace />;
        } else if (userRole === "user") {
            return <Navigate to="/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // User is authenticated and has the correct role
    return children;
}

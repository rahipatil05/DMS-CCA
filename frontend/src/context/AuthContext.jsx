import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import apiFetch from "@/lib/api";

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await apiFetch("/api/auth/check-auth");

            if (res.ok) {
                const data = await res.json();
                setAuthUser(data);
            } else {
                setAuthUser(null);
            }
        } catch (error) {
            console.log("Error in checkAuth:", error);
            setAuthUser(null);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (user) => {
        setAuthUser(user);
    };

    const logout = () => {
        setAuthUser(null);
        // Clear local storage as well for safety since we're transitioning
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        localStorage.removeItem("jwt");
    };

    return (
        <AuthContext.Provider
            value={{
                authUser,
                isCheckingAuth,
                checkAuth,
                setAuthUser,
                login,
                logout,
                isAuthenticated: !!authUser,
                userRole: authUser?.role || null,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

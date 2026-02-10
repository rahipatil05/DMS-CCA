// Auth utility functions
export const getStoredUser = () => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error parsing stored user:", error);
        return null;
    }
};

export const getStoredUserRole = () => {
    return localStorage.getItem("userRole") || null;
};

export const isAuthenticated = () => {
    return !!getStoredUser();
};

export const isUserRole = () => {
    return getStoredUserRole() === "user";
};

export const isAdminRole = () => {
    return getStoredUserRole() === "admin";
};

export const clearAuthData = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
};

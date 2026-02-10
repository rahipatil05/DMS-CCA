// hooks/useAuthSubmit.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useAuthSubmit(login) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submitAuth = async (mode, formData) => {
    if (loading) return;

    /* ---------- Frontend Validation ---------- */
    if (!formData.email || !formData.password) {
      return setError("Email and password are required");
    }

    if (mode === "register") {
      if (!formData.fullName) {
        return setError("Full name is required");
      }

      if (formData.password !== formData.confirmPassword) {
        return setError("Passwords do not match");
      }
    }

    try {
      setLoading(true);
      setError("");

      const endpoint =
        mode === "login"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/auth/signup";

      const payload =
        mode === "login"
          ? { email: formData.email, password: formData.password }
          : { fullName: formData.fullName, email: formData.email, password: formData.password };

      let res;
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
      } catch (fetchErr) {
        // Network error or CORS issue
        console.error("Network error:", fetchErr);
        throw new Error("Cannot connect to server. Please ensure backend is running on port 5000 and frontend is on port 5173.");
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server response invalid");
      }

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Debug: Log the response data
      console.log("Auth response data:", data);
      console.log("User role:", data?.user?.role);

      // Update global auth state instead of localStorage
      if (data.user) {
        // We still keep the user object in localStorage for basic non-sensitive UI persistence 
        // but the role and actual auth will be verified by the backend
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Updated user data in localStorage (non-sensitive)");

        // Sync with AuthContext
        if (login) {
          login(data.user);
        }
      }

      // Strict role-based navigation after successful login/signup
      const role = data?.user?.role;
      toast.success(mode === "login" ? "Logged in successfully" : "Account created successfully");

      // Reload or navigate as usual - the AuthContext will pick up the new session on the next mount/check
      if (role === "user") {
        navigate("/dashboard");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { submitAuth, loading, error };
}

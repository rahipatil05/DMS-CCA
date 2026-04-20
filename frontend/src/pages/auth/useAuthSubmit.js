// hooks/useAuthSubmit.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiFetch from "@/lib/api";

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
          ? "/api/auth/login"
          : "/api/auth/signup";

      const payload =
        mode === "login"
          ? { email: formData.email, password: formData.password }
          : { fullName: formData.fullName, email: formData.email, password: formData.password };

      let res;
      try {
        res = await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(payload)
        });
      } catch (fetchErr) {
        // Network error or CORS issue
        console.error("Network error:", fetchErr);
        throw new Error("Cannot connect to server. Please check that the backend is running.");
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

      // Update global auth state
      if (data.user) {
        // Keep user object in localStorage for basic non-sensitive UI persistence.
        // Actual auth is verified by the backend JWT on every request.
        localStorage.setItem("user", JSON.stringify(data.user));
        
        if (data.token) {
          localStorage.setItem("jwt", data.token);
        }

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

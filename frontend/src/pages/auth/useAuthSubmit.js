// hooks/useAuthSubmit.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthSubmit() {
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

      // Navigate after successful login/signup
      const role = data?.user?.role;
      navigate("/"); // change if admin/user paths differ

    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { submitAuth, loading, error };
}

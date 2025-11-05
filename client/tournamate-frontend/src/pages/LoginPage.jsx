import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import AuthContext from "../context/AuthContext";

function LoginPage() {
  const [fields, setFields] = useState({ email: "", password: "" });
  const { loginAction } = useContext(AuthContext);
  const navigate = useNavigate();

  // small helper to show toasts and auto-remove them
  const showToast = (text, { type = "success", duration = 3000, id = null } = {}) => {
    const toastId = id || `toast-${type}-${Date.now()}`;
    // remove existing with same id if present
    const existing = document.getElementById(toastId);
    if (existing) existing.remove();

    const div = document.createElement("div");
    div.id = toastId;
    div.className =
      `fixed top-4 right-4 z-50 rounded-lg px-6 py-3 shadow-lg animate-slideIn ` +
      (type === "success"
        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
        : "bg-gradient-to-r from-red-600 to-rose-600 text-white");
    div.style.pointerEvents = "auto";
    div.innerHTML = text;
    document.body.appendChild(div);

    // remove after duration
    setTimeout(() => {
      div.classList.add("opacity-0", "transition", "duration-300");
      setTimeout(() => {
        div.remove();
      }, 300);
    }, duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      // parse body safely
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.msg || "Failed to login");
      }

      // store token & call login handler
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (typeof loginAction === "function") {
        loginAction(data);
      }

      // success toast (auto-removed)
      showToast("✓ Login successful! Redirecting...", { type: "success", duration: 1500, id: "login-success" });

      // navigate after a short delay so toast is visible briefly
      setTimeout(() => {
        navigate("/tournaments");
      }, 900);
    } catch (error) {
      // show error toast (auto-removed)
      showToast(`✗ ${error.message}`, { type: "error", duration: 3500, id: "login-error" });
      console.error("Login error:", error);
    }
  };

  return (
    <AuthForm
      formType="Login"
      handleSubmit={handleSubmit}
      fields={fields}
      setFields={setFields}
      submitText="Sign In"
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Sign Up"
    />
  );
}

export default LoginPage;

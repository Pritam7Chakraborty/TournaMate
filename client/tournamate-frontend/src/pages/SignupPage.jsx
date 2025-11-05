import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

function SignupPage() {
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  // same lightweight toast helper as in LoginPage
  const showToast = (text, { type = "success", duration = 3000, id = null } = {}) => {
    const toastId = id || `toast-${type}-${Date.now()}`;
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

    setTimeout(() => {
      div.classList.add("opacity-0", "transition", "duration-300");
      setTimeout(() => div.remove(), 300);
    }, duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.msg || "Failed to register");
      }

      // success toast and redirect to login
      showToast("✓ Registration successful! Redirecting to login...", { type: "success", duration: 1800, id: "signup-success" });

      setTimeout(() => {
        navigate("/login");
      }, 1400);
    } catch (error) {
      // show error toast
      showToast(`✗ ${error.message}`, { type: "error", duration: 3500, id: "signup-error" });
      console.error("Signup error:", error);
    }
  };

  return (
    <AuthForm
      formType="Sign Up"
      handleSubmit={handleSubmit}
      fields={fields}
      setFields={setFields}
      submitText="Create Account"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Login"
    />
  );
}

export default SignupPage;

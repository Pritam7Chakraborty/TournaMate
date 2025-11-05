import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useToast } from "../components/toast/useToast.jsx";

function SignupPage() {
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { showToast } = useToast();

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

      showToast("✓ Registration successful! Redirecting to login...", { type: "success", duration: 1800, id: "signup-success" });

      setTimeout(() => {
        navigate("/login");
      }, 1400);
    } catch (error) {
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
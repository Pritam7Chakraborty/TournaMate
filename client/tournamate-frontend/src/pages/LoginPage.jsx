import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import AuthContext from "../context/AuthContext";
import { useToast } from "../components/toast/useToast.jsx";

function LoginPage() {
  const [fields, setFields] = useState({ email: "", password: "" });
  const { loginAction } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.msg || "Failed to login");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (typeof loginAction === "function") {
        loginAction(data);
      }

      showToast("✓ Login successful! Redirecting...", { type: "success", duration: 1500, id: "login-success" });

      setTimeout(() => {
        navigate("/tournaments");
      }, 900);
    } catch (error) {
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
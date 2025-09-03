// src/pages/SignupPage.jsx
import { useState } from "react";
import AuthForm from "../components/AuthForm";

function SignupPage() {
  const [fields, setFields] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to register");
      }

      alert("Registration successful! Please log in.");
    } catch (error) {
      alert(error.message);
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

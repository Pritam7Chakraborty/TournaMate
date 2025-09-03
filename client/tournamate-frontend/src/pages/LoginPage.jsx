// src/pages/LoginPage.jsx
import { useState } from "react";
import AuthForm from "../components/AuthForm";

function LoginPage() {
  const [fields, setFields] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      // First, get the data from the response
      const data = await response.json();

      // THEN, check if the request was successful
      if (!response.ok) {
        // If not okay, the 'data' object will have a 'msg' property we can use
        throw new Error(data.msg || "Failed to login");
      }

      localStorage.setItem("token", data.token);
      alert("Login successful!");
    } catch (error) {
      // The catch block will now receive the correct error message
      alert(error.message);
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

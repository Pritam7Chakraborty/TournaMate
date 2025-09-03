// src/components/AuthForm.jsx
import { Link } from "react-router-dom";

function AuthForm({
  formType,
  handleSubmit,
  fields,
  setFields,
  submitText,
  footerText,
  footerLink,
  footerLinkText,
}) {
  const handleChange = (e) => {
    setFields((prevFields) => ({
      ...prevFields,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-md w-full mx-auto mt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {formType}
        </h2>

        {/* Render fields based on formType */}
        {formType === "Sign Up" && (
          <div className="mb-4">
            <label
              className="block text-gray-300 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              name="name"
              type="text"
              value={fields.name || ""}
              onChange={handleChange}
              required
              className="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        )}
        <div className="mb-4">
          <label
            className="block text-gray-300 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            name="email"
            type="email"
            value={fields.email || ""}
            onChange={handleChange}
            required
            className="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-300 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            name="password"
            type="password"
            value={fields.password || ""}
            onChange={handleChange}
            required
            className="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <button
          className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full text-lg"
          type="submit"
        >
          {submitText}
        </button>

        {/* --- Google Login Button --- */}
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        <button
          type="button"
          className="bg-white hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google icon"
            className="w-6 h-6 mr-3"
          />
          Continue with Google
        </button>
        {/* We'll add the Google Login logic later */}
      </form>
      <p className="text-center text-gray-400 text-sm">
        {footerText}{" "}
        <Link
          to={footerLink}
          className="font-bold text-pink-400 hover:text-pink-300"
        >
          {footerLinkText}
        </Link>
      </p>
    </div>
  );
}

export default AuthForm;

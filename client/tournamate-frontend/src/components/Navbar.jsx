// src/components/Navbar.jsx
import { useContext } from "react";
import { Link, NavLink } from "react-router-dom"; // <-- Import NavLink
import AuthContext from "../context/AuthContext";

function Navbar() {
  const { user, logoutAction } = useContext(AuthContext);

  // This function will now be used by your NavLinks
  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'text-pink-400 font-bold' : 'text-gray-300 hover:text-white';

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link to="/" className="text-xl font-bold text-pink-500">
        TournaMate 🏆
      </Link>
      <ul className="flex items-center gap-6">
        <li>
          {/* Use NavLink for "active" styling and to prevent page reloads */}
          <NavLink to="/" className={getNavLinkClass} end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/tournaments" className={getNavLinkClass}>
            My Tournaments
          </NavLink>
        </li>

        {/* --- This is the new conditional logic --- */}
        {user ? (
          // If user IS logged in
          <li>
            <button
              onClick={logoutAction}
              className="bg-pink-600 hover:bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Sign Out
            </button>
          </li>
        ) : (
          // If user is NOT logged in
          <>
            <li>
              <NavLink to="/login" className={getNavLinkClass}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Sign Up
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
export default Navbar;
// src/components/Navbar.jsx
import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { FaTrophy, FaBars, FaTimes, FaSignOutAlt, FaUser } from "react-icons/fa";

function Navbar() {
  const { user, logoutAction } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavLinkClass = ({ isActive }) =>
    `relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
      isActive
        ? "text-pink-400 bg-pink-500/10"
        : "text-gray-300 hover:text-white hover:bg-white/5"
    }`;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-white/10 backdrop-blur-lg shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transform transition-all hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FaTrophy className="text-white text-lg" />
              </div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              TournaMate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={getNavLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/tournaments" className={getNavLinkClass}>
              My Tournaments
            </NavLink>

            {/* Auth Section */}
            <div className="ml-4 flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <FaUser className="text-white text-xs" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">{user.name}</span>
                  </div>
                  <button
                    onClick={logoutAction}
                    className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all transform hover:scale-105"
                  >
                    <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:scale-105 animate-gradient bg-[length:200%_auto]"
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-2 bg-gray-900/50 backdrop-blur-lg border-t border-white/10">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? "text-pink-400 bg-pink-500/10"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`
            }
            end
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/tournaments"
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? "text-pink-400 bg-pink-500/10"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            My Tournaments
          </NavLink>

          <div className="pt-4 border-t border-white/10 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <FaUser className="text-white text-xs" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logoutAction();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all"
                >
                  <FaSignOutAlt />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="block text-center text-gray-300 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-white/5 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="block text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
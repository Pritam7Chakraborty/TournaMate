import { Link } from "react-router-dom";
function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link to="/" className="text-xl font-bold text-pink-500">
        TournaMate
      </Link>
      <ul className="flex items-center gap-6">
        <li>
          <a href="/" className="hover:text-indigo-400">
            Home
          </a>
        </li>
        <li>
          <a href="/tournaments" className="hover:text-indigo-400">
            My Tournaments
          </a>
        </li>
        <li>
          <a
            href="/login"
            className="bg-indigo-600 hover:text-pink-300 px-4 py-2 rounded-md font-medium"
          >
            Login
          </a>
        </li>
      </ul>
    </nav>
  );
}
export default Navbar;

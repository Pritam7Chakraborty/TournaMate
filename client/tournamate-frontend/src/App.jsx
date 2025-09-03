import { Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TournamentDashboardPage from "./pages/TournamentDashboardPage.jsx";
import TournamentDetailPage from "./pages/TournamentDetailPage.jsx";
import SignupPage from './pages/SignupPage';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="bg-gray-900 min-h-screen">
        <Navbar />
        <main className="container mx-auto p-6">
          <Outlet />
        </main>
      </div>
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route
          path="tournaments/:tournamentId"
          element={<TournamentDetailPage />}
        />
        <Route path="tournaments" element={<TournamentDashboardPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} /> 
      </Route>
    </Routes>
  );
}

export default AppRoutes;

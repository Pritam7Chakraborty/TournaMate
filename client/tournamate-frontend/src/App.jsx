import { Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TournamentDashboardPage from "./pages/TournamentDashboardPage.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <Navbar />

        <main>
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
        <Route path="tournaments" element={<TournamentDashboardPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

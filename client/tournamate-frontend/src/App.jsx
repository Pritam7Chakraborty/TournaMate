import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TournamentDashboardPage from "./pages/TournamentDashboardPage.jsx";
import TournamentDetailPage from "./pages/TournamentDetailPage.jsx";
import SignupPage from './pages/SignupPage';
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // <-- 1. Import the guard

function App() {

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
        {/* --- Public Routes --- */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} /> 

        {/* --- Protected Routes --- */}
        <Route
          path="tournaments/:tournamentId"
          element={
            <ProtectedRoute> {/* <-- 2. Wrap the route */}
              <TournamentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="tournaments" 
          element={
            <ProtectedRoute> {/* <-- 3. Wrap this route too */}
              <TournamentDashboardPage />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

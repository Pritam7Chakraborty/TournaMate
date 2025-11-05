// src/pages/TournamentDashboardPage.jsx
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiPost, apiDelete } from "../utils/api";
import CreateTournamentModal from "../components/CreateTournamentModal";
import AuthContext from "../context/AuthContext";
import {
  FaTrophy,
  FaPlus,
  FaTrash,
  FaUsers,
  FaCalendar,
  FaFire,
} from "react-icons/fa";

function TournamentDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logoutAction, user } = useContext(AuthContext || {});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const data = await api("/tournaments");
        setTournaments(data);
      } catch (err) {
        if (
          err.message.includes("Token is not valid") ||
          err.message.includes("No token, authorization denied")
        ) {
          // backend telling us token is bad — force logout
          if (logoutAction) logoutAction();
          return;
        }
        console.error("Failed to fetch tournaments:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTournaments();
  }, [logoutAction]);

  const handleAddTournament = async (tournamentData) => {
    try {
      const newTournamentFromDB = await apiPost("/tournaments", tournamentData);
      setTournaments((currentTournaments) => [
        newTournamentFromDB,
        ...currentTournaments,
      ]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create tournament:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (e, tournamentId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this tournament?")) {
      return;
    }

    setDeletingId(tournamentId);
    try {
      await apiDelete(`/tournaments/${tournamentId}`);
      setTournaments((currentTournaments) =>
        currentTournaments.filter((t) => t._id !== tournamentId)
      );
    } catch (err) {
      console.error("Failed to delete tournament: ", err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // navigation guard: if user not logged in, redirect to /login
  const handleNavigate = (e, tournamentId) => {
    // Prevent Link's default navigation so we can decide.
    if (e && e.preventDefault) e.preventDefault();

    // Determine logged-in state:
    // Prefer AuthContext's `user` if available, otherwise fallback to token presence in localStorage.
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const isLoggedIn = Boolean(user) || Boolean(token);

    if (!isLoggedIn) {
      // redirect to login
      navigate("/login");
      return;
    }

    // user logged in -> go to tournament
    navigate(`/tournaments/${tournamentId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center">
            <FaTrophy className="text-red-400 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
            Oops! Something went wrong
          </h2>
          <p className="text-lg text-red-300 mb-2">Error: {error}</p>
          <p className="text-gray-400">Please try logging out and back in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header Section */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl -z-10"></div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-2xl">
          <div>
            <h2 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <FaTrophy className="text-white text-xl" />
              </div>
              My Tournaments
            </h2>
            <p className="text-gray-400 ml-15 text-sm">Manage and track your competitions</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:scale-105 flex items-center gap-2 animate-gradient bg-[length:200%_auto]"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
            Create Tournament
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl animate-pulse"
            >
              <div className="h-8 bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-4 border-dashed border-pink-500/30 flex items-center justify-center animate-pulse">
              <FaTrophy className="text-pink-400 text-5xl" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <FaPlus className="text-white text-xl" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">No tournaments yet</h3>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            Create your first tournament to start managing teams, schedules, and matches!
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all transform hover:scale-105 flex items-center gap-2 animate-gradient bg-[length:200%_auto]"
          >
            <FaPlus />
            Create Your First Tournament
          </button>
        </div>
      ) : (
        /* Tournament Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament, index) => {
            const isDeleting = deletingId === tournament._id;

            return (
              <Link
                key={tournament._id}
                to={`/tournaments/${tournament._id}`}
                onClick={(e) => handleNavigate(e, tournament._id)}
                className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-pink-500/50 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 rounded-2xl"></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                        <FaTrophy className="text-white text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-pink-400 transition-colors">
                          {tournament.name}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, tournament._id)}
                      disabled={isDeleting}
                      className={`
                        p-2 rounded-lg transition-all
                        ${isDeleting
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500"
                        }
                        group/delete
                      `}
                    >
                      <FaTrash
                        className={`text-sm transition-all
                        ${isDeleting ? "text-gray-500 animate-pulse" : "text-red-400 group-hover/delete:text-white group-hover/delete:scale-110"}
                      `}
                      />
                    </button>
                  </div>

                  {/* Tournament Details */}
                  <div className="space-y-3">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                        <FaFire className="text-blue-400 text-xs" />
                      </div>
                      <span className="text-sm font-medium text-blue-300">{tournament.type}</span>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                        <FaUsers className="text-purple-400 text-xs" />
                      </div>
                      <span className="text-sm text-gray-300">{tournament.participants?.length || 0} Teams</span>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                        <FaCalendar className="text-green-400 text-xs" />
                      </div>
                      <span className="text-sm text-gray-400">{new Date(tournament.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Bottom Accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl"></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Tournament Modal */}
      {isModalOpen && (
        <CreateTournamentModal onClose={() => setIsModalOpen(false)} onTournamentCreate={handleAddTournament} />
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default TournamentDashboardPage;

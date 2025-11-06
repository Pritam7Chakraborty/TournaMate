// src/pages/TournamentDashboardPage.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaClock,
  FaCheckCircle,
  FaPlayCircle,
  FaChartLine,
  FaCog,
  FaShare,
  FaCopy,
  FaExclamationTriangle,
} from "react-icons/fa";

function TournamentDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [copiedTournamentId, setCopiedTournamentId] = useState(null);
  const { logoutAction, user } = useContext(AuthContext || {});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const data = await api("/tournaments");
        setTournaments(data);
        setFilteredTournaments(data);
      } catch (err) {
        if (
          err.message &&
          (err.message.includes("Token is not valid") ||
            err.message.includes("No token, authorization denied"))
        ) {
          if (logoutAction) logoutAction();
          return;
        }
        console.error("Failed to fetch tournaments:", err);
        setError(err.message || "Failed to fetch tournaments");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTournaments();
  }, [logoutAction]);

  // Filter and sort tournaments
  useEffect(() => {
    let result = [...tournaments];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(tournament =>
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      result = result.filter(tournament => tournament.type === filterType);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name":
          return a.name.localeCompare(b.name);
        case "participants":
          return (b.participants?.length || 0) - (a.participants?.length || 0);
        default:
          return 0;
      }
    });

    setFilteredTournaments(result);
  }, [tournaments, searchTerm, filterType, sortBy]);

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
      alert(`Error: ${err.message || err}`);
    }
  };

  const handleDelete = async (e, tournamentId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this tournament? This action cannot be undone.")) {
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
      alert(`Error: ${err.message || err}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = async (e, tournamentId) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/tournaments/${tournamentId}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this tournament!',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedTournamentId(tournamentId);
        setTimeout(() => setCopiedTournamentId(null), 2000);
      }
    } catch{
      // Fallback to clipboard if share fails or is cancelled
      await navigator.clipboard.writeText(shareUrl);
      setCopiedTournamentId(tournamentId);
      setTimeout(() => setCopiedTournamentId(null), 2000);
    }
  };

  const getTournamentStatus = (tournament) => {
    if (!tournament.schedule || tournament.schedule.length === 0) {
      return { status: 'setup', label: 'Setup', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: FaCog };
    }
    
    const completedMatches = tournament.schedule.filter(match => match.status === 'Completed').length;
    const totalMatches = tournament.schedule.length;
    
    if (completedMatches === 0) {
      return { status: 'ready', label: 'Ready', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: FaPlayCircle };
    } else if (completedMatches === totalMatches) {
      return { status: 'completed', label: 'Completed', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: FaCheckCircle };
    } else {
      return { status: 'in-progress', label: 'In Progress', color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: FaClock };
    }
  };

  const getTournamentStats = (tournament) => {
    const stats = {
      matches: tournament.schedule?.length || 0,
      completed: tournament.schedule?.filter(m => m.status === 'Completed').length || 0,
      participants: tournament.participants?.length || 0,
      groups: tournament.groups?.length || 0
    };
    
    stats.progress = stats.matches > 0 ? Math.round((stats.completed / stats.matches) * 100) : 0;
    
    return stats;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'League':
        return <FaUsers className="text-blue-400" />;
      case 'Knockout':
        return <FaTrophy className="text-amber-400" />;
      case 'League + Knockout':
        return <FaChartLine className="text-purple-400" />;
      default:
        return <FaFire className="text-pink-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'League':
        return 'from-blue-500 to-cyan-500';
      case 'Knockout':
        return 'from-amber-500 to-yellow-500';
      case 'League + Knockout':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Navigation guard: if not logged in, redirect to /login; otherwise go to tournament.
  const handleNavigate = (e, tournamentId) => {
    if (e && e.preventDefault) e.preventDefault();

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const isLoggedIn = Boolean(user) || Boolean(token);

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    navigate(`/tournaments/${tournamentId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center">
            <FaExclamationTriangle className="text-red-400 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
            Oops! Something went wrong
          </h2>
          <p className="text-lg text-red-300 mb-2">Error: {error}</p>
          <p className="text-gray-400 mb-6">Please try logging out and back in.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            Try Again
          </button>
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
          <div className="flex-1">
            <h2 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <FaTrophy className="text-white text-xl" />
              </div>
              My Tournaments
            </h2>
            <p className="text-gray-400 ml-15 text-sm">
              Manage and track your competitions • {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''}
            </p>
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

      {/* Search and Filter Section */}
      <div className="mb-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition-colors appearance-none"
            >
              <option value="all">All Types</option>
              <option value="League">League</option>
              <option value="Knockout">Knockout</option>
              <option value="League + Knockout">League + Knockout</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <FaCog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition-colors appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="participants">Most Participants</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl animate-pulse"
            >
              <div className="h-8 bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-20 bg-gray-700 rounded-lg mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-4 border-dashed border-pink-500/30 flex items-center justify-center animate-pulse">
              <FaTrophy className="text-pink-400 text-5xl" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <FaPlus className="text-white text-xl" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            {searchTerm || filterType !== 'all' ? 'No tournaments found' : 'No tournaments yet'}
          </h3>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Create your first tournament to start managing teams, schedules, and matches!'
            }
          </p>

          {(searchTerm || filterType !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all transform hover:scale-105 flex items-center gap-2 animate-gradient bg-[length:200%_auto]"
            >
              <FaPlus />
              Create Your First Tournament
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament, index) => {
            const isDeleting = deletingId === tournament._id;
            const status = getTournamentStatus(tournament);
            const stats = getTournamentStats(tournament);
            const StatusIcon = status.icon;

            return (
              <div
                key={tournament._id}
                role="button"
                tabIndex={0}
                onClick={(e) => handleNavigate(e, tournament._id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleNavigate(e, tournament._id);
                }}
                className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-pink-500/50 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 rounded-2xl"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(tournament.type)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        {getTypeIcon(tournament.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-pink-400 transition-colors">
                          {tournament.name}
                        </h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="text-xs" />
                          {status.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleShare(e, tournament._id)}
                        className={`p-2 rounded-lg transition-all bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 group/share`}
                      >
                        {copiedTournamentId === tournament._id ? (
                          <FaCheckCircle className="text-green-400 text-sm" />
                        ) : (
                          <FaShare className="text-blue-400 group-hover/share:text-white text-sm" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, tournament._id)}
                        disabled={isDeleting}
                        className={`p-2 rounded-lg transition-all ${
                          isDeleting
                            ? "bg-gray-700 cursor-not-allowed"
                            : "bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500"
                        } group/delete`}
                      >
                        <FaTrash
                          className={`text-sm transition-all ${
                            isDeleting
                              ? "text-gray-500 animate-pulse"
                              : "text-red-400 group-hover/delete:text-white group-hover/delete:scale-110"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">{stats.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stats.progress}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-white font-bold">{stats.participants}</div>
                        <div className="text-gray-400 text-xs">Teams</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-white font-bold">{stats.matches}</div>
                        <div className="text-gray-400 text-xs">Matches</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-white font-bold">{stats.groups}</div>
                        <div className="text-gray-400 text-xs">Groups</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <FaCalendar className="text-xs" />
                      {new Date(tournament.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm font-medium group-hover:text-pink-400 transition-colors">
                      <FaEye className="text-xs" />
                      View Tournament
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl"></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Tournament Modal */}
      {isModalOpen && (
        <CreateTournamentModal
          onClose={() => setIsModalOpen(false)}
          onTournamentCreate={handleAddTournament}
        />
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
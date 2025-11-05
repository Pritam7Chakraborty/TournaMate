import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { api, apiPost, apiDelete } from "../utils/api";
import CreateTournamentModal from "../components/CreateTournamentModal";
import AuthContext from "../context/AuthContext";

function TournamentDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [error, setError] = useState(null);
  const { logoutAction } = useContext(AuthContext);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setError(null);
        const data = await api("/tournaments");
        setTournaments(data);
      } catch (err) {
        if (
          err.message.includes("Token is not valid") ||
          err.message.includes("No token, authorization denied")
        ) {
          logoutAction();
          return;
        }
        console.error("Failed to fetch tournaments:", err);
        setError(err.message);
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
    try {
      await apiDelete(`/tournaments/${tournamentId}`);
      setTournaments((currentTournaments) =>
        currentTournaments.filter((t) => t._id !== tournamentId)
      );
    } catch (err) {
      console.error("Failed to delete tournament: ", err);
      alert(`Error: ${err.message}`);
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-400 p-8">
        <h2 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h2>
        <p className="text-lg">Error: {error}</p>
        <p className="mt-4 text-gray-400">
          Please try logging out and back in.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-pink-500">My Tournaments</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white hover:text-pink-300 px-4 py-2 rounded-md font-medium"
        >
          + Create Tournament
        </button>
      </div>

      <div className="mt-4">
        {tournaments.length === 0 ? (
          <p className="text-gray-500">
            No tournaments yet. Create one to get started!
          </p>
        ) : (
          tournaments.map((tournament) => (
            <Link
              key={tournament._id}
              to={`/tournaments/${tournament._id}`}
              className="block bg-white/10 hover:bg-white/20 p-4 rounded-lg shadow mb-2 text-white transition-all duration-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg text-white">
                    {tournament.name}
                  </p>
                  <p className="text-sm text-gray-400">{tournament.type}</p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, tournament._id)}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
      {isModalOpen && (
        <CreateTournamentModal
          onClose={() => setIsModalOpen(false)}
          onTournamentCreate={handleAddTournament}
        />
      )}
    </div>
  );
}

export default TournamentDashboardPage;

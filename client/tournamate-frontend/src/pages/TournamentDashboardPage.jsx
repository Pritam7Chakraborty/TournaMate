import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CreateTournamentModal from "../components/CreateTournamentModal";

function TournamentDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/tournaments");
        const data = await response.json();
        setTournaments(data);
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      }
    };
    fetchTournaments();
  }, []);

  const handleAddTournament = async (tournamentData) => {
    try {
      const response = await fetch("http://localhost:3000/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tournamentData),
      });
      const newTournamentFromDB = await response.json();

      setTournaments((currentTournaments) => [
        newTournamentFromDB,
        ...currentTournaments,
      ]);
    } catch (error) {
      console.error("Failed to create tournament:", error);
    }
  };

  const handleDelete = async (e, tournamentId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this tournament?")) {
      return;
    }
    try {
      await fetch(`http://localhost:3000/api/tournaments/${tournamentId}`, {
        method: "DELETE",
      });
      setTournaments((currentTournaments) =>
        currentTournaments.filter((t) => t._id !== tournamentId)
      );
    } catch (error) {
      console.error("Failed to delete tournament: ", error);
    }
  };

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
              className="block bg-white/10 hover:bg-white/20 p-4 rounded-lg shadow mb-2 text-white"
            >
              <div className="flex justify-between items-center">
                <p className="font-bold text-white">{tournament.name}</p>
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

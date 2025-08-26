import { useState } from "react";
import { Link } from "react-router-dom";
import CreateTournamentModal from "../components/CreateTournamentModal";

function TournamentDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tournaments, setTournaments] = useState([]);
  const handleAddTournament = (tournamentName) => {
    const newTournament = {
      id: Date.now(),
      name: tournamentName,
    };
    setTournaments([...tournaments, newTournament]);
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
            key={tournament.id}
            className="block bg-white/10 hover:bg-white/20 p-4 rounded-lg shadow mb-2 text-white"
          >
            <p className="font-bold">{tournament.name}</p>
          </Link>
        ))
      )}
      </div>
      {isModalOpen && (
        <CreateTournamentModal onClose={() => setIsModalOpen(false)} 
        onTournamentCreate={handleAddTournament}
        />
      )}
    </div>
  );
}

export default TournamentDashboardPage;

import { useState } from "react";
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
    <div className="container mx-auto p-6">
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
          <div
            key={tournament.id}
            className="bg-white p-4 rounded-lg shadow mb-2"
          >
            <p className="font-bold">{tournament.name}</p>
          </div>
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

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CreateTournamentModal from "../components/CreateTournamentModal";

function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/api/tournaments/${tournamentId}`
        );
        if (!response.ok) {
          throw new Error("Tournament not found");
        }
        const data = await response.json();
        setTournament(data);
      } catch (error) {
        console.error("Failed to fetch tournament:", error);
        setTournament(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  const handleUpdateTournament = async (tournamentData) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/tournaments/${tournamentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tournamentData),
        }
      );
      const updatedTournament = await response.json();
      setTournament(updatedTournament);
    } catch (error) {
      console.error("Failed to update tournament:", error);
    }
  };

  if (loading) {
    return <p className="text-white text-center mt-8">Loading...</p>;
  }

  if (!tournament) {
    return (
      <p className="text-red-500 text-center mt-8">Tournament not found.</p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-4xl font-bold text-pink-500">{tournament.name}</h2>
        {/* Tweak 1: Added Type Badge */}
        <span className="bg-pink-500/20 text-pink-400 text-xs font-bold px-2.5 py-1 rounded-full">
          {tournament.type}
        </span>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded"
        >
          Edit
        </button>
      </div>

      {/* Tweak 2: Moved Date Up */}
      <p className="text-sm text-gray-400 mb-6">
        Created on: {new Date(tournament.createdAt).toLocaleDateString()}
      </p>
      
      <div className="bg-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-3">Participants</h3>
        {tournament.participants.length > 0 ? (
          <ul className="list-disc list-inside text-gray-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {tournament.participants.map((participant, index) => (
              <li key={index}>{participant}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No participants have been added yet.</p>
        )}
      </div>

      {isEditModalOpen && (
        <CreateTournamentModal
          onClose={() => setIsEditModalOpen(false)}
          onTournamentCreate={handleUpdateTournament}
          isEditMode={true}
          initialData={tournament}
        />
      )}
    </div>
  );
}
export default TournamentDetailPage;
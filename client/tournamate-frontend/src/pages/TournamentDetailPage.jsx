import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CreateTournamentModal from '../components/CreateTournamentModal';

function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true); // Start loading
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
        setTournament(null); // Clear any old data
      } finally {
        setLoading(false); // Stop loading, whether success or fail
      }
    };

    fetchTournament();
  }, [tournamentId]); // Re-run this effect if the ID in the URL changes

  const handleUpdateTournament = async (newName) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tournaments/${tournamentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });
      const updatedTournament = await response.json();
      
      // Update the state on the page with the new data
      setTournament(updatedTournament);

    } catch (error) {
      console.error('Failed to update tournament:', error);
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
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold text-pink-500">{tournament.name}</h2>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded"
        >
          Edit
        </button>
      </div>
      <p className="mt-4 text-white">
        Created on: {new Date(tournament.createdAt).toLocaleDateString()}
      </p>
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

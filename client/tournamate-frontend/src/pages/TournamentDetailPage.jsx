import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CreateTournamentModal from "../components/CreateTournamentModal";
import StandingsTable from "../components/StandingsTable";
import ScheduleView from "../components/ScheduleView";
import StatsView from "../components/StatsView";

function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");

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
  const handleGenerateSchedule = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/tournaments/${tournamentId}/generate-schedule`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || "Failed to generate schedule");
      }
      const updatedTournament = await response.json();
      // Update the state with the tournament that now includes the schedule
      setTournament(updatedTournament);
    } catch (error) {
      console.error("Schedule generation error:", error);
      alert(error.message);
    }
  };
  const handleScoreUpdate = async (matchId, matchScores) => {
    if (matchScores?.home === undefined || matchScores?.away === undefined) {
      alert("Please enter both scores.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/tournaments/${tournamentId}/matches/${matchId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homeScore: Number(matchScores.home),
            awayScore: Number(matchScores.away),
          }),
        }
      );
      const updatedTournament = await response.json();
      setTournament(updatedTournament); // Refresh the page with the updated schedule
      setScores({}); // Clear the temporary scores state
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  const handleResetSchedule = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset the schedule? All scores will be lost."
      )
    ) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/tournaments/${tournamentId}/reset-schedule`,
        {
          method: "POST",
        }
      );
      const updatedTournament = await response.json();
      setTournament(updatedTournament); // Refresh state with the empty schedule
    } catch (error) {
      console.error("Failed to reset schedule:", error);
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
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-4xl font-bold text-pink-500">{tournament.name}</h2>
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

      <p className="text-sm text-gray-400 mb-6">
        Created on: {new Date(tournament.createdAt).toLocaleDateString()}
      </p>
      {/*  Participants section  */}
      <div className="bg-white/10 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold text-white mb-3">Participants</h3>
        {tournament.participants?.length > 0 ? (
          <ul className="list-disc list-inside text-gray-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {tournament.participants.map((participant, index) => (
              <li key={index}>{participant}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No participants have been added yet.</p>
        )}
      </div>
      {/* Sub-navigation bar */}
      <div className="mb-6 border-b-2 border-gray-700">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "schedule"
                ? "border-b-2 border-pink-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "table"
                ? "border-b-2 border-pink-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-2 px-4 text-sm font-bold ${
              activeTab === "stats"
                ? "border-b-2 border-pink-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Stats
          </button>
        </nav>
      </div>

      {/* Shedule Section */}
      <div>
        {activeTab === "schedule" && (
          <ScheduleView
            schedule={tournament.schedule}
            onGenerateSchedule={handleGenerateSchedule}
            onScoreUpdate={handleScoreUpdate}
            onResetSchedule={handleResetSchedule}
          />
        )}
        {activeTab === "table" && tournament.type.includes("League") && (
          <StandingsTable
            participants={tournament.participants}
            schedule={tournament.schedule}
          />
        )}
        {activeTab === "stats" && (
          <StatsView
            participants={tournament.participants}
            schedule={tournament.schedule}
          />
        )}
      </div>

      {/* Modal Rendering */}
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

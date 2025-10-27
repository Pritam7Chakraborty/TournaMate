// src/pages/TournamentDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api, apiPost, apiPut } from "../utils/api";
import {
  FaSpinner,
  FaUser,
  FaEdit,
  FaListUl,
  FaTable,
  FaChartBar,
} from "react-icons/fa";
import UpdateScoreModal from "../components/UpdateScoreModal";
import LeagueTable from "../components/LeagueTable";
import TournamentStats from "../components/TournamentStats";

function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // --- State for the active tab ---
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'table', 'stats'

  // --- Fetch Tournament Data ---
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api(`/tournaments/${tournamentId}`);
        setTournament(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentId]);

  // --- Generate/Reset Handlers ---
  const handleGenerateSchedule = async () => {
    try {
      const updatedTournament = await apiPost(
        `/tournaments/${tournamentId}/generate-schedule`
      );
      setTournament(updatedTournament);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResetSchedule = async () => {
    if (!window.confirm("Are you sure you want to reset the schedule? All match data will be lost.")) {
      return;
    }
    try {
      const updatedTournament = await apiPost(
        `/tournaments/${tournamentId}/reset-schedule`
      );
      setTournament(updatedTournament);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // --- Modal Handlers ---
  const openModal = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  const handleSaveScore = async (homeScore, awayScore) => {
    if (!selectedMatch) return;
    try {
      const updatedTournament = await apiPut(
        `/tournaments/${tournamentId}/matches/${selectedMatch._id}`,
        { homeScore, awayScore }
      );
      setTournament(updatedTournament);
      closeModal();
    } catch (err) {
      console.error("Error updating score:", err);
      alert(`Error: ${err.message}`);
    }
  };

  // --- Loading, Error, and Not Found Checks ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-pink-500 text-4xl" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-400 p-8">
        <h2 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h2>
        <p className="text-lg">Error: {error}</p>
        <Link to="/tournaments" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
          &larr; Back to all tournaments
        </Link>
      </div>
    );
  }
  if (!tournament) {
    return <div>Tournament not found.</div>;
  }

  // --- Helper for Tab Styling ---
  const getTabClass = (tabName) => {
    const base =
      "flex items-center gap-2 font-medium py-3 px-5 rounded-t-lg transition-all";
    if (tabName === activeTab) {
      return `${base} bg-white/10 text-pink-400 border-b-2 border-pink-400`;
    }
    return `${base} text-gray-400 hover:bg-white/5 hover:text-gray-200`;
  };

  // --- Main Page Content ---
  return (
    <div>
      {/* --- Header --- */}
      <Link
        to="/tournaments"
        className="text-pink-400 hover:text-pink-300 mb-4 inline-block"
      >
        &larr; Back to all tournaments
      </Link>
      <h2 className="text-4xl font-bold text-white mb-2">{tournament.name}</h2>
      <p className="text-lg text-gray-400 mb-6">
        Type:{" "}
        <span className="font-semibold text-gray-200">{tournament.type}</span> |
        Legs:{" "}
        <span className="font-semibold text-gray-200">{tournament.legs}</span>
      </p>

      {/* --- MINI-NAVBAR (TABS) --- */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={getTabClass("overview")}
          onClick={() => setActiveTab("overview")}
        >
          <FaListUl /> Overview
        </button>

        {tournament.type.includes("League") &&
          tournament.schedule.length > 0 && (
            <>
              <button
                className={getTabClass("table")}
                onClick={() => setActiveTab("table")}
              >
                <FaTable /> Table
              </button>
              <button
                className={getTabClass("stats")}
                onClick={() => setActiveTab("stats")}
              >
                <FaChartBar /> Stats
              </button>
            </>
          )}
      </div>

      {/* --- CONDITIONAL CONTENT FOR TABS --- */}

      {/* --- Tab 1: Overview (Participants + Schedule) --- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Participant Block */}
          <div className="md:col-span-1 bg-white/10 p-6 rounded-lg shadow self-start">
            <h3 className="text-2xl font-bold text-white mb-4">Participants</h3>
            <div className="flex flex-wrap gap-2">
              {tournament.participants.map((p, i) => (
                <div key={i} className="bg-indigo-600/50 border border-indigo-500 text-gray-100 text-sm font-medium px-3 py-1.5 rounded-full flex items-center">
                  <FaUser className="mr-2 text-indigo-300" /> {p}
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Block */}
          <div className="md:col-span-2 bg-white/10 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Schedule</h3>
              {tournament.schedule.length === 0 ? (
                <button
                  onClick={handleGenerateSchedule}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
                >
                  Generate Schedule
                </button>
              ) : (
                <button
                  onClick={handleResetSchedule}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded"
                >
                  Reset Schedule
                </button>
              )}
            </div>

            {tournament.schedule.length > 0 ? (
              <div className="space-y-3">
                {tournament.schedule.map((match) => (
                  <div key={match._id} className="bg-gray-800 p-4 rounded-lg">
                    <span className="text-xs text-pink-400 font-medium">Round {match.round}</span>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mt-2">
                      <p className="text-lg text-white font-semibold text-right">
                        {match.homeParticipant}
                      </p>
                      {match.status === "Completed" ? (
                        <p className="text-2xl font-bold text-white text-center">
                          {match.homeScore} - {match.awayScore}
                        </p>
                      ) : (
                        <span className="text-sm text-yellow-400 text-center">Pending</span>
                      )}
                      <p className="text-lg text-white font-semibold text-left">
                        {match.awayParticipant}
                      </p>
                    </div>
                    <div className="text-center mt-3">
                      <button
                        onClick={() => openModal(match)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-center mx-auto"
                      >
                        <FaEdit className="mr-1" />
                        Update Score
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                Click "Generate Schedule" to create fixtures.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Tab 2: League Table --- */}
      {activeTab === "table" && (
        <div>
          <LeagueTable
            participants={tournament.participants}
            schedule={tournament.schedule}
          />
        </div>
      )}

      {/* --- Tab 3: Stats --- */}
      {activeTab === "stats" && (
        <div className="bg-white/10 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-white mb-4">
            Tournament Stats
          </h3>
          <TournamentStats
            participants={tournament.participants}
            schedule={tournament.schedule}
          />
        </div>
      )}

      {/* --- Modal (renders at the bottom) --- */}
      {isModalOpen && selectedMatch && (
        <UpdateScoreModal
          match={selectedMatch}
          onSave={handleSaveScore}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default TournamentDetailPage;
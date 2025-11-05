import { useState, useEffect, useMemo, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { api, apiPost, apiPut } from "../utils/api";
import {
  FaSpinner,
  FaUser,
  FaEdit,
  FaListUl,
  FaTable,
  FaChartBar,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import UpdateScoreModal from "../components/UpdateScoreModal";
import LeagueTable from "../components/LeagueTable";
import TournamentStats from "../components/TournamentStats";
import KnockoutBracket from "../components/KnockoutBracket";
import AuthContext from "../context/AuthContext";

function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [openRounds, setOpenRounds] = useState({});
  const { logoutAction } = useContext(AuthContext);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId || tournamentId === "undefined") {
        setError("Invalid tournament ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await api(`/tournaments/${tournamentId}`);
        setTournament(data);
        if (data.schedule.length > 0) {
          const firstRound = data.schedule.sort(
            (a, b) => a.matchNumber - b.matchNumber
          )[0].round;
          setOpenRounds({ [firstRound]: true });
        }
      } catch (err) {
        if (
          err.message.includes("Token is not valid") ||
          err.message.includes("No token, authorization denied")
        ) {
          logoutAction();
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentId, logoutAction]);

  const handleGenerateSchedule = async () => {
    if (!tournament) return;
    let endpoint = "";
    if (tournament.type.includes("League")) {
      endpoint = `/tournaments/${tournamentId}/generate-schedule`;
    } else if (tournament.type === "Knockout") {
      endpoint = `/tournaments/${tournamentId}/generate-knockout`;
    } else {
      alert("Schedule generation for 'League + Knockout' not yet supported.");
      return;
    }
    try {
      const updatedTournament = await apiPost(endpoint);
      setTournament(updatedTournament);
      if (updatedTournament.schedule.length > 0) {
        const firstRound = updatedTournament.schedule.sort(
          (a, b) => a.matchNumber - b.matchNumber
        )[0].round;
        setOpenRounds({ [firstRound]: true });
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResetSchedule = async () => {
    if (!window.confirm("Are you sure? All match data will be lost.")) {
      return;
    }
    try {
      const updatedTournament = await apiPost(
        `/tournaments/${tournamentId}/reset-schedule`
      );
      setTournament(updatedTournament);
      setOpenRounds({});
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const openModal = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  const handleSaveScore = async (
    homeScore,
    awayScore,
    homePenaltyScore,
    awayPenaltyScore
  ) => {
    if (!selectedMatch) return;
    try {
      const updatedTournament = await apiPut(
        `/tournaments/${tournamentId}/matches/${selectedMatch._id}`,
        { homeScore, awayScore, homePenaltyScore, awayPenaltyScore }
      );
      setTournament(updatedTournament);
      closeModal();
    } catch (err) {
      console.error("Error updating score:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const toggleRound = (round) => {
    setOpenRounds((prev) => ({
      ...prev,
      [round]: !prev[round],
    }));
  };

  const groupedSchedule = useMemo(() => {
    if (!tournament || !tournament.type.includes("League")) return {};
    return tournament.schedule.reduce((acc, match) => {
      const round = match.round;
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    }, {});
  }, [tournament]);

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
        <Link
          to="/tournaments"
          className="text-pink-400 hover:text-pink-300 mt-4 inline-block"
        >
          &larr; Back to all tournaments
        </Link>
      </div>
    );
  }
  if (!tournament) {
    return <div>Tournament not found.</div>;
  }

  const getTabClass = (tabName) => {
    const base =
      "flex items-center gap-2 font-medium py-3 px-5 rounded-t-lg transition-all";
    if (tabName === activeTab) {
      return `${base} bg-white/10 text-pink-400 border-b-2 border-pink-400`;
    }
    return `${base} text-gray-400 hover:bg-white/5 hover:text-gray-200`;
  };

  const isLeague = tournament.type.includes("League");
  const isKnockout = tournament.type === "Knockout";

  return (
    <div>
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
        {isKnockout && (
          <>
            {" "}
            | Stage:{" "}
            <span className="font-semibold text-gray-200">
              {tournament.koStartStage === 4
                ? "Semi-Finals"
                : tournament.koStartStage === 8
                ? "Quarter-Finals"
                : `Round of ${tournament.koStartStage}`}
            </span>
          </>
        )}
      </p>

      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
        <button
          className={getTabClass("overview")}
          onClick={() => setActiveTab("overview")}
        >
          <FaListUl /> Overview
        </button>
        {isLeague && tournament.schedule.length > 0 && (
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

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white/10 p-6 rounded-lg shadow self-start">
            <h3 className="text-2xl font-bold text-white mb-4">Participants</h3>
            <div className="flex flex-wrap gap-2">
              {tournament.participants.map((p, i) => (
                <div
                  key={i}
                  className="bg-indigo-600/50 border border-indigo-500 text-gray-100 text-sm font-medium px-3 py-1.5 rounded-full flex items-center"
                >
                  <FaUser className="mr-2 text-indigo-300" /> {p}
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 bg-white/10 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">
                {isKnockout ? "Bracket" : "Schedule"}
              </h3>
              {tournament.schedule.length === 0 ? (
                <button
                  onClick={handleGenerateSchedule}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
                >
                  Generate {isKnockout ? "Bracket" : "Schedule"}
                </button>
              ) : (
                <button
                  onClick={handleResetSchedule}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded"
                >
                  Reset
                </button>
              )}
            </div>
            {tournament.schedule.length > 0 ? (
              isKnockout ? (
                <KnockoutBracket
                  schedule={tournament.schedule}
                  onOpenModal={openModal}
                />
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedSchedule).map(([round, matches]) => {
                    const isOpen = openRounds[round];
                    return (
                      <div
                        key={round}
                        className="bg-gray-800 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleRound(round)}
                          className="flex justify-between items-center w-full p-4 bg-gray-700/50 hover:bg-gray-700"
                        >
                          <span className="text-lg text-pink-400 font-medium">
                            Round {round}
                          </span>
                          {isOpen ? (
                            <FaChevronUp className="text-gray-400" />
                          ) : (
                            <FaChevronDown className="text-gray-400" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="space-y-3 p-4">
                            {matches.map((match) => (
                              <div
                                key={match._id}
                                className="bg-gray-900/50 p-4 rounded-lg"
                              >
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                  <p className="text-lg text-white font-semibold text-right">
                                    {match.homeParticipant}
                                  </p>
                                  {match.status === "Completed" ? (
                                    <p className="text-2xl font-bold text-white text-center">
                                      {match.homeScore} - {match.awayScore}
                                      {match.homePenaltyScore !== null && (
                                        <span className="text-xs block text-yellow-400">
                                          ({match.homePenaltyScore} -{" "}
                                          {match.awayPenaltyScore}p)
                                        </span>
                                      )}
                                    </p>
                                  ) : (
                                    <span className="text-sm text-yellow-400 text-center">
                                      {match.status}
                                    </span>
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <p className="text-gray-400">
                Click "Generate" to create{" "}
                {isKnockout ? "the bracket" : "fixtures"}.
              </p>
            )}
          </div>
        </div>
      )}
      {activeTab === "table" && isLeague && (
        <div>
          <LeagueTable
            participants={tournament.participants}
            schedule={tournament.schedule}
          />
        </div>
      )}
      {activeTab === "stats" && isLeague && (
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

// src/pages/TournamentDetailPage.jsx
import { useState, useEffect, useMemo, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  FaArrowRight,
  FaTrophy,
} from "react-icons/fa";
import UpdateScoreModal from "../components/UpdateScoreModal";
import LeagueTable from "../components/LeagueTable";
import TournamentStats from "../components/TournamentStats";
import KnockoutBracket from "../components/KnockoutBracket";
import AuthContext from "../context/AuthContext";
import ChampionModal from "../components/ChampionModal";

function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [openRounds, setOpenRounds] = useState({});
  const { logoutAction, user } = useContext(AuthContext || {});
  const [champion, setChampion] = useState(null);
  const navigate = useNavigate();

  // client-side guard: redirect away if not logged in (defensive)
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!user && !token) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

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

        if (data?.schedule && data.schedule.length > 0) {
          const firstKey =
            data.schedule
              .slice()
              .sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0))[0]
              .group || data.schedule[0].round;
          setOpenRounds({ [firstKey]: true });
        }
      } catch (err) {
        if (
          err?.message &&
          (err.message.includes("Token is not valid") ||
            err.message.includes("No token, authorization denied"))
        ) {
          if (logoutAction) logoutAction();
          return;
        }
        setError(err.message || "Failed to fetch tournament");
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentId, logoutAction]);

  // ----- Improved champion detection + clinch detection -----
  useEffect(() => {
    if (
      !tournament ||
      !tournament.schedule ||
      tournament.schedule.length === 0
    ) {
      setChampion(null);
      return;
    }

    // compute standings + clinch status for a league/group
    const computeStandingsAndClinch = (participants = [], schedule = []) => {
      // base stats
      const stats = (participants || []).map((p) => ({
        name: p,
        MP: 0,
        W: 0,
        D: 0,
        L: 0,
        GF: 0,
        GA: 0,
        GD: 0,
        Pts: 0,
      }));

      const completed = (schedule || []).filter(
        (m) => m.status === "Completed"
      );

      // fill stats from completed matches
      for (const m of completed) {
        const home = stats.find((s) => s.name === m.homeParticipant);
        const away = stats.find((s) => s.name === m.awayParticipant);
        if (!home || !away) continue;

        const hs = Number(m.homeScore || 0);
        const as = Number(m.awayScore || 0);

        home.MP++;
        away.MP++;
        home.GF += hs;
        home.GA += as;
        away.GF += as;
        away.GA += hs;

        if (hs > as) {
          home.W++;
          away.L++;
          home.Pts += 3;
        } else if (as > hs) {
          away.W++;
          home.L++;
          away.Pts += 3;
        } else {
          home.D++;
          away.D++;
          home.Pts += 1;
          away.Pts += 1;
        }

        home.GD = home.GF - home.GA;
        away.GD = away.GF - away.GA;
      }

      // h2h calculator for blocks of tied teams
      const h2hFor = (teams, matches) => {
        const map = {};
        teams.forEach(
          (t) => (map[t.name] = { name: t.name, Pts: 0, GF: 0, GA: 0, GD: 0 })
        );
        const names = teams.map((t) => t.name);

        for (const m of matches) {
          if (
            names.includes(m.homeParticipant) &&
            names.includes(m.awayParticipant)
          ) {
            const h = map[m.homeParticipant];
            const a = map[m.awayParticipant];
            const hs = Number(m.homeScore || 0);
            const as = Number(m.awayScore || 0);
            h.GF += hs;
            h.GA += as;
            a.GF += as;
            a.GA += hs;
            if (hs > as) h.Pts += 3;
            else if (as > hs) a.Pts += 3;
            else {
              h.Pts += 1;
              a.Pts += 1;
            }
          }
        }
        Object.values(map).forEach((x) => (x.GD = x.GF - x.GA));
        return map;
      };

      // initial sort by Pts then name (name as stable fallback)
      stats.sort((a, b) => {
        if (a.Pts !== b.Pts) return b.Pts - a.Pts;
        return a.name.localeCompare(b.name);
      });

      // resolve tied blocks using H2H then GD then GF then name
      const resolved = [];
      for (let i = 0; i < stats.length; ) {
        const block = [stats[i]];
        let j = i + 1;
        while (j < stats.length && stats[j].Pts === stats[i].Pts) {
          block.push(stats[j]);
          j++;
        }

        if (block.length > 1) {
          const h2h = h2hFor(block, completed);
          block.forEach((t) => {
            const h = h2h[t.name] || { Pts: 0, GD: 0, GF: 0 };
            t._h2hPts = h.Pts;
            t._h2hGD = h.GD;
            t._h2hGF = h.GF;
          });

          block.sort((x, y) => {
            if (x._h2hPts !== y._h2hPts) return y._h2hPts - x._h2hPts;
            if (x._h2hGD !== y._h2hGD) return y._h2hGD - x._h2hGD;
            if (x._h2hGF !== y._h2hGF) return y._h2hGF - x._h2hGF;
            if (x.GD !== y.GD) return y.GD - x.GD;
            if (x.GF !== y.GF) return y.GF - x.GF;
            return x.name.localeCompare(y.name);
          });

          // cleanup temp props
          block.forEach((t) => {
            delete t._h2hPts;
            delete t._h2hGD;
            delete t._h2hGF;
          });
        }

        resolved.push(...block);
        i = j;
      }

      // count remaining matches per team (for conservative clinch)
      const remaining = {};
      (participants || []).forEach((p) => (remaining[p] = 0));
      for (const m of schedule) {
        if (m.status === "Completed") continue;
        if (
          m.homeParticipant &&
          Object.prototype.hasOwnProperty.call(remaining, m.homeParticipant)
        )
          remaining[m.homeParticipant]++;
        if (
          m.awayParticipant &&
          Object.prototype.hasOwnProperty.call(remaining, m.awayParticipant)
        )
          remaining[m.awayParticipant]++;
      }
      const remainingMaxPts = {};
      Object.keys(remaining).forEach(
        (k) => (remainingMaxPts[k] = remaining[k] * 3)
      );

      // conservative clinch detection:
      // team t is clinched if no other team can equal or surpass its points even if those teams win all remaining matches
      const clinched = {};
      for (const t of resolved) {
        let canBeCaught = false;
        for (const o of resolved) {
          if (o.name === t.name) continue;
          if (o.Pts + (remainingMaxPts[o.name] || 0) >= t.Pts) {
            // potential to catch (ties handled by tie-breakers — we conservatively assume they could win tie-breaks)
            canBeCaught = true;
            break;
          }
        }
        clinched[t.name] = !canBeCaught;
      }

      return { standings: resolved, remaining, remainingMaxPts, clinched };
    };

    const tType = String(tournament.type || "").trim();

    // 1) Knockout: detect final properly (lowest round number among non-group matches)
    if (
      tType === "Knockout" ||
      (tType === "League + Knockout" &&
        (!tournament.groups || tournament.groups.length === 0))
    ) {
      const koMatches = tournament.schedule.filter((m) => !m.group);
      if (koMatches.length > 0) {
        const roundNumbers = koMatches
          .map((m) => Number(m.round || Infinity))
          .filter((r) => Number.isFinite(r));
        if (roundNumbers.length > 0) {
          const finalRound = Math.min(...roundNumbers);
          const finalMatch = koMatches.find(
            (m) => Number(m.round) === finalRound && m.winner
          );
          if (finalMatch && finalMatch.winner) {
            if (!finalMatch._championShown) {
              setChampion({ name: finalMatch.winner, type: tType });
              finalMatch._championShown = true;
            }
            return;
          }
        }
      }
    }

    // 2) League or League+Knockout with groups: compute standings and only show champion when
    //    - pure league: top team is mathematically clinched OR all matches complete
    //    - league+knockout: we don't show overall champion until KO winner exists (handled above). For group winners, the advance-winners route will handle it.
    if (tType === "League" || tType === "League + Knockout") {
      const groupsExist = tournament.groups && tournament.groups.length > 0;
      if (!groupsExist) {
        // pure league
        const calc = computeStandingsAndClinch(
          tournament.participants || [],
          tournament.schedule || []
        );
        const top = calc.standings[0];
        if (!top) {
          setChampion(null);
          return;
        }
        const allComplete = (tournament.schedule || []).every(
          (m) => m.status === "Completed"
        );
        if (calc.clinched[top.name] || allComplete) {
          // announce champion once (flag on object so we don't repeatedly pop)
          if (!top._championShown) {
            setChampion({ name: top.name, type: tType });
            top._championShown = true;
          }
          return;
        }
        setChampion(null);
        return;
      } else {
        // League + Knockout with groups -> do not show overall champion until KO final.
        // If you want group-level clinch badges, that is handled in LeagueTable component.
        setChampion(null);
        return;
      }
    }

    // fallback: no champion
    setChampion(null);
  }, [tournament]);

  const handleGenerateSchedule = async () => {
    if (!tournament) return;
    let endpoint = "";

    const t = String(tournament.type || "").toLowerCase();

    if (t.includes("league")) {
      endpoint = `/tournaments/${tournamentId}/generate-schedule`;
    } else if (t.includes("knockout")) {
      endpoint = `/tournaments/${tournamentId}/generate-knockout`;
    } else {
      alert("Invalid tournament type.");
      return;
    }

    try {
      let payload = undefined;

      // For league tournaments without groups, send numGroups
      if (
        endpoint.includes("generate-schedule") &&
        (!tournament.groups || tournament.groups.length === 0)
      ) {
        // Check if numGroups exists and is valid
        if (tournament.numGroups && tournament.numGroups > 0) {
          payload = { numGroups: tournament.numGroups };
        } else {
          // If no numGroups, ask user or default to 1 (single league)
          const numGroups = prompt(
            "Enter number of groups (or leave empty for single league):",
            ""
          );
          if (numGroups && parseInt(numGroups) > 0) {
            payload = { numGroups: parseInt(numGroups) };
          }
          // If empty/cancelled, payload stays undefined (single league)
        }
      }

      const updatedTournament = payload
        ? await apiPost(endpoint, payload)
        : await apiPost(endpoint);

      setTournament(updatedTournament);
      if (updatedTournament.schedule && updatedTournament.schedule.length > 0) {
        const firstKey =
          updatedTournament.schedule
            .slice()
            .sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0))[0]
            .group || updatedTournament.schedule[0].round;
        setOpenRounds({ [firstKey]: true });
      }
    } catch (err) {
      alert(`Error: ${err.message || err}`);
      console.error("[handleGenerateSchedule] error:", err);
    }
  };

  const handleResetSchedule = async () => {
    if (
      !window.confirm("Are you sure? This will delete all matches AND groups.")
    ) {
      return;
    }
    try {
      const updatedTournament = await apiPost(
        `/tournaments/${tournamentId}/reset-schedule`
      );
      setTournament(updatedTournament);
      setOpenRounds({});
    } catch (err) {
      alert(`Error: ${err.message || err}`);
    }
  };

  const openModal = (match) => {
    setSelectedMatch({ ...match, isKnockoutMatch: !match.group });
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
      alert(`Error: ${err.message || err}`);
    }
  };

  const toggleRound = (roundKey) => {
    setOpenRounds((prev) => ({ ...prev, [roundKey]: !prev[roundKey] }));
  };

  const handleAdvanceWinners = async () => {
    if (
      !window.confirm(
        "Are you sure you want to end the group stage and advance winners? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      const updatedTournament = await apiPost(
        `/tournaments/${tournamentId}/advance-winners`
      );
      setTournament(updatedTournament);
      setActiveTab("overview");
    } catch (err) {
      alert(`Error: ${err.message || err}`);
    }
  };

  const groupedSchedule = useMemo(() => {
    if (!tournament) return {};
    return tournament.schedule.reduce((acc, match) => {
      const key = match.group || `round-${match.round}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(match);
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
      "flex items-center gap-2 font-medium py-3 px-5 rounded-t-lg transition-all whitespace-nowrap";
    if (tabName === activeTab) {
      return `${base} bg-white/10 text-pink-400 border-b-2 border-pink-400`;
    }
    return `${base} text-gray-400 hover:bg-white/5 hover:text-gray-200`;
  };

  const isLeagueOnly = tournament.type === "League";
  const isKnockoutOnly = tournament.type === "Knockout";
  const isLeagueKO = tournament.type === "League + Knockout";

  const isGroupPhase =
    isLeagueKO && tournament.groups && tournament.groups.length > 0;
  const isKnockoutPhase =
    isKnockoutOnly ||
    (isLeagueKO &&
      (!tournament.groups || tournament.groups.length === 0) &&
      tournament.schedule.length > 0);

  const allGroupMatchesComplete =
    isGroupPhase &&
    tournament.schedule.length > 0 &&
    tournament.schedule.every((m) => m.status === "Completed");

  const groupNames = Array.from(
    { length: (tournament.groups && tournament.groups.length) || 0 },
    (_, i) => `Group ${String.fromCharCode(65 + i)}`
  );

  return (
    <div className="min-h-screen pb-8">
      <Link
        to="/tournaments"
        className="text-pink-400 hover:text-pink-300 mb-4 inline-block transition-colors"
      >
        &larr; Back to all tournaments
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <FaTrophy className="text-yellow-400 text-3xl" />
          <h2 className="text-4xl font-bold text-white">{tournament.name}</h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 px-4 py-2 rounded-full font-medium">
            {tournament.type}
          </span>
          <span className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full font-medium">
            {tournament.legs} Leg{tournament.legs > 1 ? "s" : ""}
          </span>
          {isKnockoutPhase && (
            <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-full font-medium">
              {tournament.koStartStage === 4
                ? "Semi-Finals"
                : tournament.koStartStage === 8
                ? "Quarter-Finals"
                : `Round of ${tournament.koStartStage}`}
            </span>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
        <button
          className={getTabClass("overview")}
          onClick={() => setActiveTab("overview")}
        >
          <FaListUl /> {isGroupPhase ? "Groups & Schedule" : "Overview"}
        </button>
        {(isLeagueOnly || isGroupPhase) && tournament.schedule.length > 0 && (
          <>
            <button
              className={getTabClass("table")}
              onClick={() => setActiveTab("table")}
            >
              <FaTable /> {isGroupPhase ? "Group Tables" : "Table"}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl self-start">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaUser className="text-pink-400" />
              {isGroupPhase ? "Groups" : "Participants"}
            </h3>
            {isGroupPhase ? (
              <div className="space-y-4">
                {tournament.groups.map((group, index) => (
                  <div
                    key={index}
                    className="bg-black/20 rounded-xl p-4 border border-white/10"
                  >
                    <h4 className="text-lg font-semibold text-pink-400 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      {groupNames[index]}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {group.map((p, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border border-indigo-400/30 text-gray-100 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                        >
                          <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></div>
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tournament.participants.map((p, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border border-indigo-400/30 text-gray-100 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                  >
                    <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></div>
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {isKnockoutPhase ? (
                  <>
                    <FaTrophy className="text-yellow-400" />
                    Knockout Bracket
                  </>
                ) : (
                  <>
                    <FaListUl className="text-pink-400" />
                    Schedule
                  </>
                )}
              </h3>
              {tournament.schedule.length === 0 ? (
                <button
                  onClick={handleGenerateSchedule}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Generate {isKnockoutPhase ? "Bracket" : "Schedule"}
                </button>
              ) : (
                <button
                  onClick={handleResetSchedule}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Reset
                </button>
              )}
            </div>

            {tournament.schedule.length > 0 ? (
              isKnockoutPhase ? (
                <KnockoutBracket
                  schedule={tournament.schedule}
                  onOpenModal={openModal}
                />
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedSchedule).map(([key, matches]) => {
                    const isOpen = openRounds[key];
                    const title = isGroupPhase
                      ? key
                      : `Round ${key.split("-")[1] || key}`;
                    return (
                      <div
                        key={key}
                        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl overflow-hidden border border-white/10 shadow-lg"
                      >
                        <button
                          onClick={() => toggleRound(key)}
                          className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 hover:from-gray-700/50 hover:to-gray-800/50 transition-all"
                        >
                          <span className="text-lg text-pink-400 font-bold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm">
                              {matches.length}
                            </div>
                            {title}
                          </span>
                          {isOpen ? (
                            <FaChevronUp className="text-gray-400 text-lg" />
                          ) : (
                            <FaChevronDown className="text-gray-400 text-lg" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="space-y-3 p-4">
                            {matches.map((match) => (
                              <div
                                key={match._id}
                                className="bg-gradient-to-br from-gray-900/70 to-black/70 p-5 rounded-xl border border-white/10 shadow-xl hover:shadow-2xl transition-all hover:border-pink-500/30"
                              >
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-lg text-white font-bold mb-1">
                                      {match.homeParticipant}
                                    </p>
                                    {match.status === "Completed" &&
                                      match.winner ===
                                        match.homeParticipant && (
                                        <span className="text-xs text-yellow-400 font-medium">
                                          Winner
                                        </span>
                                      )}
                                  </div>

                                  {match.status === "Completed" ? (
                                    <div className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 border border-pink-500/50 rounded-xl px-6 py-3 shadow-lg">
                                      <p className="text-3xl font-black text-white text-center tracking-wider">
                                        {match.homeScore} - {match.awayScore}
                                      </p>
                                      {match.homePenaltyScore !== null && (
                                        <p className="text-xs text-yellow-300 text-center mt-1 font-semibold">
                                          Penalties: {match.homePenaltyScore} -{" "}
                                          {match.awayPenaltyScore}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl px-6 py-3">
                                      <span className="text-sm text-yellow-300 font-bold text-center block">
                                        {match.status}
                                      </span>
                                    </div>
                                  )}

                                  <div className="text-left">
                                    <p className="text-lg text-white font-bold mb-1">
                                      {match.awayParticipant}
                                    </p>
                                    {match.status === "Completed" &&
                                      match.winner ===
                                        match.awayParticipant && (
                                        <span className="text-xs text-yellow-400 font-medium">
                                          Winner
                                        </span>
                                      )}
                                  </div>
                                </div>
                                <div className="text-center mt-4">
                                  <button
                                    onClick={() => openModal(match)}
                                    className="text-xs text-indigo-300 hover:text-indigo-200 font-medium flex items-center justify-center mx-auto gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 px-4 py-2 rounded-lg border border-indigo-500/30 transition-all"
                                  >
                                    <FaEdit /> Update Score
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
              <div className="text-center py-16 px-4">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-dashed border-gray-600">
                  <p className="text-gray-400 text-lg">
                    Click "Generate" to create{" "}
                    {isKnockoutPhase ? "the bracket" : "fixtures"}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "table" && (isLeagueOnly || isGroupPhase) && (
        <div className="space-y-8">
          {isLeagueOnly && (
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl">
              <LeagueTable
                participants={tournament.participants}
                schedule={tournament.schedule}
              />
            </div>
          )}
          {isGroupPhase &&
            groupNames.map((groupName, index) => (
              <div
                key={groupName}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl"
              >
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  {groupName}
                </h3>
                <LeagueTable
                  participants={tournament.groups[index]}
                  schedule={tournament.schedule}
                  groupName={groupName}
                />
              </div>
            ))}
          {allGroupMatchesComplete && (
            <div className="mt-8 text-center">
              <button
                onClick={handleAdvanceWinners}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl text-lg flex items-center justify-center mx-auto gap-3 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <FaTrophy className="text-xl" /> Advance to Knockout Stage{" "}
                <FaArrowRight className="text-xl" />
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "stats" && (isLeagueOnly || isGroupPhase) && (
        <div className="space-y-8">
          {isLeagueOnly && (
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaChartBar className="text-pink-400" /> Tournament Stats
              </h3>
              <TournamentStats
                participants={tournament.participants}
                schedule={tournament.schedule.filter((m) => m.group === null)}
              />
            </div>
          )}
          {isGroupPhase &&
            groupNames.map((groupName, index) => (
              <div
                key={groupName}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  {groupName} Stats
                </h3>
                <TournamentStats
                  participants={tournament.groups[index]}
                  schedule={tournament.schedule.filter(
                    (m) => m.group === groupName
                  )}
                />
              </div>
            ))}
        </div>
      )}

      {isModalOpen && selectedMatch && (
        <UpdateScoreModal
          match={selectedMatch}
          isKnockoutMatch={selectedMatch.isKnockoutMatch}
          onSave={handleSaveScore}
          onClose={closeModal}
        />
      )}

      {champion && (
        <ChampionModal
          name={champion.name}
          type={champion.type}
          onClose={() => setChampion(null)}
          autoCloseMs={10000}
        />
      )}
    </div>
  );
}

export default TournamentDetailPage;

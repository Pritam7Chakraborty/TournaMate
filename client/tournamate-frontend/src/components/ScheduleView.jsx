// src/components/ScheduleView.jsx
import { useState } from "react";
import {
  FaCalendar,
  FaTrash,
  FaPlus,
  FaSave,
  FaCrosshairs,
} from "react-icons/fa";

function ScheduleView({
  schedule = [],
  onGenerateSchedule,
  onScoreUpdate,
  onResetSchedule,
}) {
  const [scores, setScores] = useState({});

  const handleScoreChange = (matchId, key, value) => {
    setScores((prevScores) => ({
      ...prevScores,
      [matchId]: {
        ...(prevScores[matchId] || {}),
        [key]: value,
      },
    }));
  };

  const handleSaveClick = (match) => {
    const matchId = match._id;
    const matchScores = scores[matchId] || {};

    if (
      matchScores.home === undefined ||
      matchScores.home === "" ||
      matchScores.away === undefined ||
      matchScores.away === ""
    ) {
      alert("Please enter both full-time scores.");
      return;
    }

    const home = Number(matchScores.home);
    const away = Number(matchScores.away);
    const isKnockout = !match.group;

    if (isKnockout && home === away) {
      const hp = matchScores.homePen !== undefined ? matchScores.homePen : null;
      const ap = matchScores.awayPen !== undefined ? matchScores.awayPen : null;
      if (hp === null || hp === "" || ap === null || ap === "") {
        alert("Draw in knockout match — please enter penalty shootout scores.");
        return;
      }
      onScoreUpdate(matchId, {
        homeScore: home,
        awayScore: away,
        homePenaltyScore: Number(hp),
        awayPenaltyScore: Number(ap),
      });
    } else {
      onScoreUpdate(matchId, {
        homeScore: home,
        awayScore: away,
        homePenaltyScore: null,
        awayPenaltyScore: null,
      });
    }

    setScores((prev) => {
      const copy = { ...prev };
      delete copy[matchId];
      return copy;
    });
  };

  const rounds = schedule.reduce((acc, match) => {
    (acc[match.round] = acc[match.round] || []).push(match);
    return acc;
  }, {});

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
            <FaCalendar className="text-white" />
          </div>
          Schedule
        </h3>

        <div className="flex items-center gap-3">
          {schedule?.length > 0 && (
            <button
              onClick={onResetSchedule}
              className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all transform hover:scale-105"
            >
              <FaTrash className="group-hover:rotate-12 transition-transform" />
              Reset
            </button>
          )}
          <button
            onClick={onGenerateSchedule}
            className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all transform hover:scale-105"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform" />
            Generate
          </button>
        </div>
      </div>

      {schedule?.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(rounds).map(([roundNumber, matches]) => (
            <div key={roundNumber} className="space-y-3">
              {/* Round Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">{roundNumber}</span>
                </div>
                <h4 className="text-lg font-bold text-blue-400">
                  Match Day {roundNumber}
                </h4>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
              </div>

              {/* Matches */}
              <div className="space-y-3">
                {matches.map((match) => {
                  const local = scores[match._id] || {};
                  const isKnockout = !match.group;
                  const homeVal = local.home ?? "";
                  const awayVal = local.away ?? "";
                  const isDraw =
                    homeVal !== "" &&
                    awayVal !== "" &&
                    Number(homeVal) === Number(awayVal);

                  return (
                    <div
                      key={match._id}
                      className="bg-gradient-to-br from-gray-900/70 to-black/70 p-5 rounded-xl border border-white/10 shadow-xl hover:shadow-2xl transition-all hover:border-pink-500/30"
                    >
                      {/* Match Info */}
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-4">
                        <div className="text-right">
                          <span className="text-lg font-bold text-white">
                            {match.homeParticipant}
                          </span>
                        </div>

                        {match.status === "Completed" ? (
                          <div className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 border border-pink-500/50 rounded-xl px-6 py-3 shadow-lg">
                            <p className="text-3xl font-black text-white text-center">
                              {match.homeScore} - {match.awayScore}
                            </p>
                            {match.homePenaltyScore !== null && (
                              <p className="text-xs text-yellow-300 text-center mt-1 font-semibold">
                                Pens: {match.homePenaltyScore} -{" "}
                                {match.awayPenaltyScore}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            {/* Main Score Inputs */}
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                value={homeVal}
                                onChange={(e) =>
                                  handleScoreChange(
                                    match._id,
                                    "home",
                                    e.target.value
                                  )
                                }
                                className="w-16 h-16 text-center text-2xl font-bold bg-gray-800 border-2 border-pink-500/30 focus:border-pink-500 rounded-xl text-white outline-none transition-all focus:ring-4 focus:ring-pink-500/20"
                                min="0"
                                placeholder="0"
                              />
                              <span className="text-2xl text-gray-400 font-bold">
                                :
                              </span>
                              <input
                                type="number"
                                value={awayVal}
                                onChange={(e) =>
                                  handleScoreChange(
                                    match._id,
                                    "away",
                                    e.target.value
                                  )
                                }
                                className="w-16 h-16 text-center text-2xl font-bold bg-gray-800 border-2 border-purple-500/30 focus:border-purple-500 rounded-xl text-white outline-none transition-all focus:ring-4 focus:ring-purple-500/20"
                                min="0"
                                placeholder="0"
                              />
                            </div>

                            {/* Penalty Inputs (Knockout Draw) */}
                            {isKnockout && isDraw && (
                              <div className="w-full animate-slideDown">
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                                  <p className="text-xs text-yellow-400 font-bold mb-2 flex items-center justify-center gap-2">
                                    <FaCrosshairs />
                                    Penalty Shootout Required
                                  </p>
                                  <div className="flex items-center justify-center gap-3">
                                    <input
                                      type="number"
                                      placeholder="Pens"
                                      value={local.homePen ?? ""}
                                      onChange={(e) =>
                                        handleScoreChange(
                                          match._id,
                                          "homePen",
                                          e.target.value
                                        )
                                      }
                                      className="w-14 h-12 text-center text-lg font-bold bg-gray-800 border-2 border-yellow-500/40 focus:border-yellow-500 rounded-lg text-yellow-300 outline-none transition-all focus:ring-4 focus:ring-yellow-500/20"
                                      min="0"
                                    />
                                    <span className="text-yellow-400 font-bold">
                                      :
                                    </span>
                                    <input
                                      type="number"
                                      placeholder="Pens"
                                      value={local.awayPen ?? ""}
                                      onChange={(e) =>
                                        handleScoreChange(
                                          match._id,
                                          "awayPen",
                                          e.target.value
                                        )
                                      }
                                      className="w-14 h-12 text-center text-lg font-bold bg-gray-800 border-2 border-yellow-500/40 focus:border-yellow-500 rounded-lg text-yellow-300 outline-none transition-all focus:ring-4 focus:ring-yellow-500/20"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-left">
                          <span className="text-lg font-bold text-white">
                            {match.awayParticipant}
                          </span>
                        </div>
                      </div>

                      {/* Save Button */}
                      {match.status !== "Completed" && (
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleSaveClick(match)}
                            className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                          >
                            <FaSave className="group-hover:scale-110 transition-transform" />
                            Save Score
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-dashed border-gray-700 flex items-center justify-center">
            <FaCalendar className="text-gray-600 text-4xl" />
          </div>
          <p className="text-gray-400 text-lg mb-6">
            No schedule has been generated yet.
          </p>
          <button
            onClick={onGenerateSchedule}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <FaPlus />
            Generate Schedule
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ScheduleView;

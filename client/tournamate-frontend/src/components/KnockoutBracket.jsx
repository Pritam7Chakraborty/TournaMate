import React, { useMemo } from "react";
import { FaEdit, FaTrophy, FaMedal } from "react-icons/fa";

const KnockoutBracket = ({ schedule, onOpenModal }) => {
  const bracketRounds = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];

    const roundMap = {};
    schedule.forEach((match) => {
      if (!roundMap[match.round]) {
        roundMap[match.round] = [];
      }
      roundMap[match.round].push(match);
    });

    const rounds = Object.entries(roundMap)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([roundNum, matches]) => ({
        roundNum: Number(roundNum),
        matches: matches.sort((a, b) => a.matchNumber - b.matchNumber),
      }));

    return rounds;
  }, [schedule]);

  const getRoundName = (roundNum) => {
    if (roundNum === 2) return "Final";
    if (roundNum === 4) return "Semi-Finals";
    if (roundNum === 8) return "Quarter-Finals";
    return `Round of ${roundNum}`;
  };

  const getTeamClasses = (match, isHome) => {
    const participant = isHome ? match.homeParticipant : match.awayParticipant;
    const isWinner = match.winner === participant;
    const isTBD = participant === "TBD";
    const isBYE = participant === "BYE";

    if (isTBD) {
      return "bg-gray-800/50 text-gray-500 border-gray-700";
    }
    if (isBYE) {
      return "bg-gray-800/30 text-gray-600 border-gray-700";
    }
    if (isWinner) {
      return "bg-gradient-to-r from-yellow-600/30 to-amber-600/30 text-yellow-200 border-yellow-500/50 font-bold shadow-lg shadow-yellow-500/20";
    }
    if (match.status === "Completed") {
      return "bg-gray-800/70 text-gray-400 border-gray-700";
    }
    return "bg-gradient-to-r from-indigo-900/40 to-purple-900/40 text-white border-indigo-500/30";
  };

  const getScoreClasses = (match, isHome) => {
    const score = isHome ? match.homeScore : match.awayScore;
    const participant = isHome ? match.homeParticipant : match.awayParticipant;
    const isWinner = match.winner === participant;

    if (match.status !== "Completed" || score === null) {
      return "text-gray-600";
    }
    if (isWinner) {
      return "text-yellow-300 font-black";
    }
    return "text-gray-400 font-medium";
  };

  return (
    <div className="relative">
      {/* Mobile Warning */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-300 text-center">
          💡 Scroll horizontally to view the full bracket
        </p>
      </div>

      {/* Bracket Container */}
      <div className="overflow-x-auto pb-6">
        <div className="inline-flex gap-8 min-w-max px-4">
          {bracketRounds.map((round, roundIndex) => (
            <div key={round.roundNum} className="flex flex-col justify-center gap-6 min-w-[280px]">
              {/* Round Header */}
              <div className="text-center mb-4 sticky top-0 z-10 bg-gray-900/90 backdrop-blur-sm py-3 rounded-xl border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {round.roundNum === 2 && <FaTrophy className="text-yellow-400 text-xl" />}
                  {round.roundNum === 4 && <FaMedal className="text-amber-400 text-lg" />}
                  <h3 className="text-xl font-bold text-pink-400">
                    {getRoundName(round.roundNum)}
                  </h3>
                </div>
                <p className="text-xs text-gray-400">
                  {round.matches.length} {round.matches.length === 1 ? "Match" : "Matches"}
                </p>
              </div>

              {/* Matches */}
              <div 
                className="flex flex-col gap-6"
                style={{ 
                  marginTop: roundIndex > 0 ? `${Math.pow(2, roundIndex - 1) * 80}px` : '0',
                }}
              >
                {round.matches.map((match) => (
                  <div
                    key={match._id || match.matchNumber}
                    className="relative"
                    style={{
                      marginBottom: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 80}px` : '0',
                    }}
                  >
                    {/* Match Card */}
                    <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl hover:shadow-pink-500/20 transition-all hover:border-pink-500/30">
                      {/* Match Number Badge */}
                      <div className="bg-gradient-to-r from-pink-600/30 to-purple-600/30 px-4 py-2 text-center border-b border-white/10">
                        <span className="text-xs font-bold text-pink-300">
                          Match #{match.matchNumber}
                        </span>
                      </div>

                      {/* Teams */}
                      <div className="p-3 space-y-2">
                        {/* Home Team */}
                        <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${getTeamClasses(match, true)}`}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {match.winner === match.homeParticipant && match.status === "Completed" && (
                              <FaTrophy className="text-yellow-400 text-sm flex-shrink-0" />
                            )}
                            <span className="text-sm font-semibold truncate">
                              {match.homeParticipant}
                            </span>
                          </div>
                          {match.status === "Completed" && match.homeScore !== null && (
                            <span className={`text-2xl ml-3 flex-shrink-0 ${getScoreClasses(match, true)}`}>
                              {match.homeScore}
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${getTeamClasses(match, false)}`}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {match.winner === match.awayParticipant && match.status === "Completed" && (
                              <FaTrophy className="text-yellow-400 text-sm flex-shrink-0" />
                            )}
                            <span className="text-sm font-semibold truncate">
                              {match.awayParticipant}
                            </span>
                          </div>
                          {match.status === "Completed" && match.awayScore !== null && (
                            <span className={`text-2xl ml-3 flex-shrink-0 ${getScoreClasses(match, false)}`}>
                              {match.awayScore}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Penalty Shootout */}
                      {match.homePenaltyScore !== null && match.awayPenaltyScore !== null && (
                        <div className="px-4 py-2 bg-yellow-600/20 border-t border-yellow-500/30">
                          <p className="text-xs text-yellow-300 text-center font-semibold">
                            Penalties: {match.homePenaltyScore} - {match.awayPenaltyScore}
                          </p>
                        </div>
                      )}

                      {/* Status & Actions */}
                      <div className="px-4 py-3 bg-black/30 border-t border-white/10">
                        {match.status === "Completed" ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              Completed
                            </span>
                            {match.homeParticipant !== "TBD" && match.awayParticipant !== "TBD" && 
                             match.homeParticipant !== "BYE" && match.awayParticipant !== "BYE" && (
                              <button
                                onClick={() => onOpenModal(match)}
                                className="text-xs text-indigo-300 hover:text-indigo-200 font-medium flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/30 px-3 py-1 rounded-lg border border-indigo-500/30 transition-all"
                              >
                                <FaEdit className="text-xs" />
                                Edit
                              </button>
                            )}
                          </div>
                        ) : match.status === "Pending" ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-yellow-400 flex items-center gap-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                              Pending
                            </span>
                            {match.homeParticipant !== "TBD" && match.awayParticipant !== "TBD" && 
                             match.homeParticipant !== "BYE" && match.awayParticipant !== "BYE" && (
                              <button
                                onClick={() => onOpenModal(match)}
                                className="text-xs text-pink-300 hover:text-pink-200 font-medium flex items-center gap-1 bg-pink-600/20 hover:bg-pink-600/30 px-3 py-1.5 rounded-lg border border-pink-500/30 transition-all"
                              >
                                <FaEdit className="text-xs" />
                                Set Score
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            {match.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Connection Line to Next Round */}
                    {roundIndex < bracketRounds.length - 1 && (
                      <div className="absolute top-1/2 -right-8 w-8 h-0.5 bg-gradient-to-r from-pink-500/50 to-purple-500/50"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Champion Display */}
      {bracketRounds.length > 0 && bracketRounds[bracketRounds.length - 1].matches[0]?.winner && (
        <div className="mt-8 text-center">
          <div className="inline-block bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-2 border-yellow-500/50 rounded-2xl p-8 shadow-2xl shadow-yellow-500/20">
            <div className="flex flex-col items-center gap-3">
              <FaTrophy className="text-yellow-400 text-5xl animate-bounce" />
              <h3 className="text-2xl font-black text-white">CHAMPION</h3>
              <p className="text-3xl font-black text-yellow-300">
                {bracketRounds[bracketRounds.length - 1].matches[0].winner}
              </p>
              <div className="mt-2 flex gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnockoutBracket;
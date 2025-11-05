// src/components/LeagueTable.jsx
import { useMemo } from "react";
import { FaTrophy, FaMedal } from "react-icons/fa";

function FormBadge({ result }) {
  const baseClass =
    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-lg transition-transform hover:scale-110";
  if (result === "W")
    return <div className={`${baseClass} bg-gradient-to-br from-green-500 to-emerald-600 text-white`}>W</div>;
  if (result === "D")
    return <div className={`${baseClass} bg-gradient-to-br from-gray-500 to-gray-600 text-white`}>D</div>;
  if (result === "L")
    return <div className={`${baseClass} bg-gradient-to-br from-red-500 to-rose-600 text-white`}>L</div>;
  return null;
}

function LeagueTable({ participants, schedule, groupName = null }) {
  const standings = useMemo(() => {
    const tableParticipants = groupName ? participants : participants;
    const tableSchedule = groupName
      ? schedule.filter((m) => m.group === groupName)
      : schedule.filter((m) => m.group === null);

    const stats = tableParticipants.map((p) => ({
      name: p,
      MP: 0,
      W: 0,
      D: 0,
      L: 0,
      GF: 0,
      GA: 0,
      GD: 0,
      Pts: 0,
      form: [],
    }));

    const completedMatches = tableSchedule
      .filter((m) => m.status === "Completed")
      .sort((a, b) => a.round - b.round);

    for (const match of completedMatches) {
      const homeTeam = stats.find((s) => s.name === match.homeParticipant);
      const awayTeam = stats.find((s) => s.name === match.awayParticipant);
      if (!homeTeam || !awayTeam) continue;

      homeTeam.MP++;
      awayTeam.MP++;
      homeTeam.GF += match.homeScore || 0;
      homeTeam.GA += match.awayScore || 0;
      awayTeam.GF += match.awayScore || 0;
      awayTeam.GA += match.homeScore || 0;
      homeTeam.GD = homeTeam.GF - homeTeam.GA;
      awayTeam.GD = awayTeam.GF - awayTeam.GA;

      if (match.homeScore > match.awayScore) {
        homeTeam.W++;
        homeTeam.Pts += 3;
        homeTeam.form.push("W");
        awayTeam.L++;
        awayTeam.form.push("L");
      } else if (match.homeScore < match.awayScore) {
        awayTeam.W++;
        awayTeam.Pts += 3;
        awayTeam.form.push("W");
        homeTeam.L++;
        homeTeam.form.push("L");
      } else {
        homeTeam.D++;
        awayTeam.D++;
        homeTeam.Pts += 1;
        awayTeam.Pts += 1;
        homeTeam.form.push("D");
        awayTeam.form.push("D");
      }
    }

    const getH2HStats = (teams) => {
      const h2hStats = {};
      teams.forEach((t) => {
        h2hStats[t.name] = { name: t.name, Pts: 0, GD: 0, GF: 0 };
      });
      const teamNames = teams.map((t) => t.name);

      for (const match of completedMatches) {
        if (
          teamNames.includes(match.homeParticipant) &&
          teamNames.includes(match.awayParticipant)
        ) {
          const home = h2hStats[match.homeParticipant];
          const away = h2hStats[match.awayParticipant];

          home.GF += match.homeScore || 0;
          home.GA += match.awayScore || 0;
          away.GF += match.awayScore || 0;
          away.GA += match.homeScore || 0;

          if (match.homeScore > match.awayScore) home.Pts += 3;
          else if (match.homeScore < match.awayScore) away.Pts += 3;
          else {
            home.Pts += 1;
            away.Pts += 1;
          }
        }
      }
      Object.values(h2hStats).forEach((s) => {
        s.GD = s.GF - s.GA;
      });
      return h2hStats;
    };

    stats.sort((a, b) => {
      if (a.Pts !== b.Pts) return b.Pts - a.Pts;
      const tiedTeams = stats.filter((team) => team.Pts === a.Pts);
      const h2hStats = getH2HStats(tiedTeams);
      const a_h2h = h2hStats[a.name];
      const b_h2h = h2hStats[b.name];
      if (a_h2h.Pts !== b_h2h.Pts) return b_h2h.Pts - a_h2h.Pts;
      if (a_h2h.GD !== b_h2h.GD) return b_h2h.GD - a_h2h.GD;
      if (a_h2h.GF !== b_h2h.GF) return b_h2h.GF - a_h2h.GF;
      if (a.GD !== b.GD) return b.GD - a.GD;
      if (a.GF !== b.GF) return b.GF - a.GF;
      return a.name.localeCompare(b.name);
    });

    return stats;
  }, [participants, schedule, groupName]);

  // ✅ Calculate max matches played to determine form display
  const maxMatchesPlayed = useMemo(() => {
    return Math.max(...standings.map(team => team.MP), 0);
  }, [standings]);

  // ✅ Determine how many form badges to show (max 5)
  const formToShow = Math.min(maxMatchesPlayed, 5);

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-b border-white/10">
              <th className="px-4 py-4 text-left text-xs font-bold text-pink-400 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-pink-400 uppercase tracking-wider">
                Club
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-pink-400 uppercase tracking-wider">
                MP
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-green-400 uppercase tracking-wider">
                W
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                D
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-red-400 uppercase tracking-wider">
                L
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-blue-400 uppercase tracking-wider">
                GF
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-orange-400 uppercase tracking-wider">
                GA
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-purple-400 uppercase tracking-wider">
                GD
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-yellow-400 uppercase tracking-wider">
                Pts
              </th>
              {maxMatchesPlayed > 0 && (
                <th className="px-6 py-4 text-center text-xs font-bold text-pink-400 uppercase tracking-wider">
                  Last {formToShow}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {standings.map((team, index) => {
              // Determine position styling
              const isChampion = index === 0;
              const isTopThree = index < 3;
              const isQualification = index < 4; // Top 4 for qualification zones

              return (
                <tr
                  key={team.name}
                  className={`
                    transition-all hover:bg-white/10
                    ${isChampion ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10' : ''}
                    ${!isChampion && isTopThree ? 'bg-gradient-to-r from-blue-500/5 to-cyan-500/5' : ''}
                  `}
                >
                  {/* Position with Icons */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`
                        text-sm font-bold
                        ${isChampion ? 'text-yellow-400' : isTopThree ? 'text-blue-400' : 'text-gray-400'}
                      `}>
                        {index + 1}
                      </span>
                      {isChampion && <FaTrophy className="text-yellow-400 text-sm" />}
                      {!isChampion && isTopThree && <FaMedal className="text-blue-400 text-xs" />}
                    </div>
                  </td>

                  {/* Team Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-2 h-8 rounded-full
                        ${isChampion ? 'bg-gradient-to-b from-yellow-400 to-amber-500' : ''}
                        ${!isChampion && isTopThree ? 'bg-gradient-to-b from-blue-400 to-cyan-500' : ''}
                        ${!isQualification ? 'bg-gradient-to-b from-gray-600 to-gray-700' : ''}
                      `} />
                      <span className={`
                        text-sm font-bold whitespace-nowrap
                        ${isChampion ? 'text-yellow-100' : 'text-white'}
                      `}>
                        {team.name}
                      </span>
                    </div>
                  </td>

                  {/* Stats */}
                  <td className="px-3 py-4 text-sm text-center font-medium text-gray-300">
                    {team.MP}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-green-400">
                    {team.W}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-gray-400">
                    {team.D}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-red-400">
                    {team.L}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-blue-300">
                    {team.GF}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-orange-300">
                    {team.GA}
                  </td>
                  <td className={`px-3 py-4 text-sm text-center font-bold ${
                    team.GD > 0 ? 'text-green-400' : team.GD < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {team.GD > 0 ? '+' : ''}{team.GD}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
                      <span className="text-base font-black text-yellow-300">
                        {team.Pts}
                      </span>
                    </span>
                  </td>

                  {/* Form - Only show if matches played */}
                  {maxMatchesPlayed > 0 && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-1.5">
                        {team.form.slice(-formToShow).map((result, i) => (
                          <FormBadge key={i} result={result} />
                        ))}
                        {/* Add empty placeholders if team hasn't played all matches yet */}
                        {team.form.length < formToShow && 
                          Array.from({ length: formToShow - team.form.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="w-6 h-6 rounded-full border-2 border-dashed border-gray-600/50" />
                          ))
                        }
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {standings.length > 0 && (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-6 py-4 border-t border-white/10">
          <div className="flex flex-wrap gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500" />
              <span className="text-gray-300">Champion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500" />
              <span className="text-gray-300">Top 3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">W</div>
              <span className="text-gray-300">Win</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold text-[10px]">D</div>
              <span className="text-gray-300">Draw</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-[10px]">L</div>
              <span className="text-gray-300">Loss</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeagueTable;
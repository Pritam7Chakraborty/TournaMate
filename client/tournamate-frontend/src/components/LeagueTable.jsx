// src/components/LeagueTable.jsx
import React, { useMemo } from "react";
import { FaTrophy, FaMedal } from "react-icons/fa";

/**
 * LeagueTable
 * - participants: array of team names
 * - schedule: array of match objects (round, group (or null), homeParticipant, awayParticipant, status, homeScore, awayScore)
 * - groupName: if provided, filters matches to this group
 *
 * Tie-break hierarchy:
 * 1) Points
 * 2) Head-to-head points among tied teams
 * 3) Head-to-head goal difference
 * 4) Head-to-head goals for
 * 5) Overall goal difference
 * 6) Overall goals for
 * 7) Alphabetical (stable deterministic)
 *
 * Also computes clinched / eliminated using remaining-match upper-bounds.
 */

function FormBadge({ result }) {
  const baseClass =
    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-lg transition-transform hover:scale-110";
  if (result === "W")
    return (
      <div
        className={`${baseClass} bg-gradient-to-br from-green-500 to-emerald-600 text-white`}
      >
        W
      </div>
    );
  if (result === "D")
    return (
      <div
        className={`${baseClass} bg-gradient-to-br from-gray-500 to-gray-600 text-white`}
      >
        D
      </div>
    );
  if (result === "L")
    return (
      <div
        className={`${baseClass} bg-gradient-to-br from-red-500 to-rose-600 text-white`}
      >
        L
      </div>
    );
  return null;
}

/* ----- helper math functions ----- */

function computeBaseStats(participants, matches) {
  const stats = participants.map((p) => ({
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

  const completed = matches.filter((m) => m.status === "Completed");

  for (const match of completed) {
    const h = stats.find((s) => s.name === match.homeParticipant);
    const a = stats.find((s) => s.name === match.awayParticipant);
    if (!h || !a) continue;

    h.MP++;
    a.MP++;
    const hs = Number(match.homeScore || 0);
    const as = Number(match.awayScore || 0);
    h.GF += hs;
    h.GA += as;
    a.GF += as;
    a.GA += hs;

    if (hs > as) {
      h.W++;
      a.L++;
      h.Pts += 3;
      h.form.push("W");
      a.form.push("L");
    } else if (hs < as) {
      a.W++;
      h.L++;
      a.Pts += 3;
      a.form.push("W");
      h.form.push("L");
    } else {
      h.D++;
      a.D++;
      h.Pts += 1;
      a.Pts += 1;
      h.form.push("D");
      a.form.push("D");
    }
  }

  stats.forEach((s) => (s.GD = s.GF - s.GA));

  return stats;
}

/**
 * getH2HStats(tiedTeams, completedMatches)
 * returns object { teamName: { Pts, GD, GF, GA } }
 */
function getH2HStats(tiedTeams, completedMatches) {
  const names = tiedTeams.map((t) => t.name);
  const h2h = {};
  names.forEach((n) => (h2h[n] = { name: n, Pts: 0, GF: 0, GA: 0, GD: 0 }));

  for (const m of completedMatches) {
    if (
      !names.includes(m.homeParticipant) ||
      !names.includes(m.awayParticipant)
    )
      continue;
    const hs = Number(m.homeScore || 0);
    const as = Number(m.awayScore || 0);
    h2h[m.homeParticipant].GF += hs;
    h2h[m.homeParticipant].GA += as;
    h2h[m.awayParticipant].GF += as;
    h2h[m.awayParticipant].GA += hs;
    if (hs > as) h2h[m.homeParticipant].Pts += 3;
    else if (hs < as) h2h[m.awayParticipant].Pts += 3;
    else {
      h2h[m.homeParticipant].Pts += 1;
      h2h[m.awayParticipant].Pts += 1;
    }
  }
  Object.values(h2h).forEach((s) => (s.GD = s.GF - s.GA));
  return h2h;
}

/**
 * remainingMaxPointsForTeam(teamName, schedule)
 * Computes maximum additional points a team can still earn from unplayed matches.
 */
function remainingMaxPointsForTeam(teamName, schedule) {
  const remMatches = schedule.filter((m) => {
    if (m.status === "Completed") return false;
    return m.homeParticipant === teamName || m.awayParticipant === teamName;
  });
  return remMatches.length * 3;
}

/**
 * computeClinchFlags(stats, schedule)
 * Conservative clinch/elimination using remaining-match upper-bounds.
 */
function computeClinchFlags(stats, schedule) {
  const remainingMap = {};
  stats.forEach((t) => {
    remainingMap[t.name] = remainingMaxPointsForTeam(t.name, schedule);
  });

  const clinched = {};
  const eliminated = {};

  for (const t of stats) {
    // clinched: for every other team o, o.Pts + remainingMap[o] < t.Pts
    let isClinched = true;
    for (const o of stats) {
      if (o.name === t.name) continue;
      if (o.Pts + remainingMap[o.name] >= t.Pts) {
        isClinched = false;
        break;
      }
    }
    clinched[t.name] = isClinched;

    // eliminated: if t.Pts + remainingMap[t] < max current points of some other team
    const maxOpponentPts = Math.max(
      ...stats.filter((s) => s.name !== t.name).map((s) => s.Pts)
    );
    eliminated[t.name] = t.Pts + remainingMap[t.name] < maxOpponentPts;
  }

  return { clinched, eliminated, remainingMap };
}

/* ----- main component ----- */

function LeagueTable({ participants = [], schedule = [], groupName = null }) {
  // filter schedule for group if groupName is provided
  const tableSchedule = useMemo(() => {
    if (!groupName)
      return schedule.filter(
        (m) => m.group === null || typeof m.group === "undefined"
      );
    return schedule.filter((m) => m.group === groupName);
  }, [schedule, groupName]);

  const standings = useMemo(() => {
    const stats = computeBaseStats(participants, tableSchedule);

    const completedMatches = tableSchedule.filter(
      (m) => m.status === "Completed"
    );

    // initial sort by points, then stable alphabetical (we'll resolve ties fully next)
    stats.sort((a, b) => {
      if (a.Pts !== b.Pts) return b.Pts - a.Pts;
      return a.name.localeCompare(b.name);
    });

    // Resolve tied blocks using H2H then GD, GF, alphabetical
    const resolved = [];
    let i = 0;
    while (i < stats.length) {
      const tieBlock = [stats[i]];
      let j = i + 1;
      while (j < stats.length && stats[j].Pts === stats[i].Pts) {
        tieBlock.push(stats[j]);
        j++;
      }

      if (tieBlock.length > 1) {
        const h2h = getH2HStats(tieBlock, completedMatches);
        tieBlock.forEach((t) => {
          const h = h2h[t.name] || { Pts: 0, GD: 0, GF: 0 };
          t._h2hPts = h.Pts;
          t._h2hGD = h.GD;
          t._h2hGF = h.GF;
        });

        tieBlock.sort((x, y) => {
          if (x._h2hPts !== y._h2hPts) return y._h2hPts - x._h2hPts;
          if (x._h2hGD !== y._h2hGD) return y._h2hGD - x._h2hGD;
          if (x._h2hGF !== y._h2hGF) return y._h2hGF - x._h2hGF;
          if (x.GD !== y.GD) return y.GD - x.GD;
          if (x.GF !== y.GF) return y.GF - x.GF;
          return x.name.localeCompare(y.name);
        });

        tieBlock.forEach((t) => {
          delete t._h2hPts;
          delete t._h2hGD;
          delete t._h2hGF;
        });
      }

      resolved.push(...tieBlock);
      i = j;
    }

    return resolved;
  }, [participants, tableSchedule]);

  const { clinched, eliminated, remainingMap } = useMemo(
    () => computeClinchFlags(standings, tableSchedule),
    [standings, tableSchedule]
  );

  const maxMatchesPlayed = useMemo(
    () => (standings.length ? Math.max(...standings.map((t) => t.MP)) : 0),
    [standings]
  );
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
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {standings.map((team, index) => {
              const isChampion = index === 0;
              const isTopThree = index < 3;
              const rem = remainingMap[team.name] || 0;
              const status = clinched[team.name]
                ? "Clinched"
                : eliminated[team.name]
                ? "Eliminated"
                : rem > 0
                ? `${Math.floor(rem / 3)} games left`
                : "Pending";

              return (
                <tr
                  key={team.name}
                  className={`transition-all hover:bg-white/10 ${
                    isChampion
                      ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10"
                      : ""
                  } ${
                    !isChampion && isTopThree
                      ? "bg-gradient-to-r from-blue-500/5 to-cyan-500/5"
                      : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          isChampion
                            ? "text-yellow-400"
                            : isTopThree
                            ? "text-blue-400"
                            : "text-gray-400"
                        }`}
                      >
                        {index + 1}
                      </span>
                      {isChampion && (
                        <FaTrophy className="text-yellow-400 text-sm" />
                      )}
                      {!isChampion && isTopThree && (
                        <FaMedal className="text-blue-400 text-xs" />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-8 rounded-full ${
                          isChampion
                            ? "bg-gradient-to-b from-yellow-400 to-amber-500"
                            : !isChampion && isTopThree
                            ? "bg-gradient-to-b from-blue-400 to-cyan-500"
                            : "bg-gray-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-bold whitespace-nowrap ${
                          isChampion ? "text-yellow-100" : "text-white"
                        }`}
                      >
                        {team.name}
                      </span>
                    </div>
                  </td>

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
                  <td
                    className={`px-3 py-4 text-sm text-center font-bold ${
                      team.GD > 0
                        ? "text-green-400"
                        : team.GD < 0
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {team.GD > 0 ? "+" : ""}
                    {team.GD}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
                      <span className="text-base font-black text-yellow-300">
                        {team.Pts}
                      </span>
                    </span>
                  </td>

                  {maxMatchesPlayed > 0 && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-1.5">
                        {team.form.slice(-formToShow).map((r, i) => (
                          <FormBadge key={i} result={r} />
                        ))}
                        {team.form.length < formToShow &&
                          Array.from({
                            length: formToShow - team.form.length,
                          }).map((_, i) => (
                            <div
                              key={`empty-${i}`}
                              className="w-6 h-6 rounded-full border-2 border-dashed border-gray-600/50"
                            />
                          ))}
                      </div>
                    </td>
                  )}

                  <td className="px-6 py-4 text-center text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          clinched[team.name]
                            ? "text-emerald-300"
                            : eliminated[team.name]
                            ? "text-rose-300"
                            : "text-gray-300"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </td>
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
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">
                W
              </div>
              <span className="text-gray-300">Win</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold text-[10px]">
                D
              </div>
              <span className="text-gray-300">Draw</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-[10px]">
                L
              </div>
              <span className="text-gray-300">Loss</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-gray-300">Clinched</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="text-gray-300">Eliminated</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeagueTable;

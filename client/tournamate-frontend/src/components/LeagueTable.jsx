import { useMemo } from "react";
import { FaTrophy, FaMedal } from "react-icons/fa";

/**
 * FormBadge - tiny UI for W/D/L
 */
function FormBadge({ result }) {
  const base =
    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-lg transition-transform hover:scale-110";
  if (result === "W")
    return (
      <div
        className={`${base} bg-gradient-to-br from-green-500 to-emerald-600 text-white`}
      >
        W
      </div>
    );
  if (result === "D")
    return (
      <div
        className={`${base} bg-gradient-to-br from-gray-500 to-gray-600 text-white`}
      >
        D
      </div>
    );
  if (result === "L")
    return (
      <div
        className={`${base} bg-gradient-to-br from-red-500 to-rose-600 text-white`}
      >
        L
      </div>
    );
  return null;
}

/* ---------------------------
    Utility / ranking helpers
    --------------------------- */

const cloneMatches = (matches) => matches.map((m) => ({ ...m }));

/**
 * rankTeams - ranking with H2H -> GD -> GF -> name fallback
 */
function rankTeams(teams, matches) {
  const statsByName = {};
  teams.forEach((t) => {
    statsByName[t] = {
      name: t,
      Pts: 0,
      GF: 0,
      GA: 0,
      GD: 0,
      MP: 0,
    };
  });

  for (const mt of matches) {
    if (!mt.homeParticipant || !mt.awayParticipant) continue;
    const hs = Number(mt.homeScore || 0);
    const as = Number(mt.awayScore || 0);
    if (!statsByName[mt.homeParticipant] || !statsByName[mt.awayParticipant])
      continue;

    statsByName[mt.homeParticipant].MP++;
    statsByName[mt.awayParticipant].MP++;

    statsByName[mt.homeParticipant].GF += hs;
    statsByName[mt.homeParticipant].GA += as;
    statsByName[mt.awayParticipant].GF += as;
    statsByName[mt.awayParticipant].GA += hs;

    if (hs > as) statsByName[mt.homeParticipant].Pts += 3;
    else if (hs < as) statsByName[mt.awayParticipant].Pts += 3;
    else {
      statsByName[mt.homeParticipant].Pts += 1;
      statsByName[mt.awayParticipant].Pts += 1;
    }
  }

  Object.values(statsByName).forEach((s) => (s.GD = s.GF - s.GA));

  const computeH2H = (tiedNames) => {
    const h2h = {};
    tiedNames.forEach((n) => (h2h[n] = { Pts: 0, GF: 0, GA: 0, GD: 0 }));
    for (const mt of matches) {
      const h = mt.homeParticipant;
      const a = mt.awayParticipant;
      if (!h || !a) continue;
      if (tiedNames.includes(h) && tiedNames.includes(a)) {
        const hs = Number(mt.homeScore || 0);
        const as = Number(mt.awayScore || 0);
        h2h[h].GF += hs;
        h2h[h].GA += as;
        h2h[a].GF += as;
        h2h[a].GA += hs;
        if (hs > as) h2h[h].Pts += 3;
        else if (hs < as) h2h[a].Pts += 3;
        else {
          h2h[h].Pts += 1;
          h2h[a].Pts += 1;
        }
      }
    }
    Object.values(h2h).forEach((s) => (s.GD = s.GF - s.GA));
    return h2h;
  };

  // Prepare primary list
  const teamList = Object.values(statsByName);

  // Group teams by points to resolve ties with H2H
  const groups = {};
  for (const t of teamList) {
    groups[t.Pts] = groups[t.Pts] || [];
    groups[t.Pts].push(t.name);
  }

  const final = [];
  const ptsKeys = Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a);
  for (const pts of ptsKeys) {
    const tiedNames = groups[pts];
    if (tiedNames.length === 1) {
      final.push(statsByName[tiedNames[0]]);
      continue;
    }
    const h2h = computeH2H(tiedNames);
    tiedNames.sort((x, y) => {
      if (h2h[x].Pts !== h2h[y].Pts) return h2h[y].Pts - h2h[x].Pts;
      if (h2h[x].GD !== h2h[y].GD) return h2h[y].GD - h2h[x].GD;
      if (h2h[x].GF !== h2h[y].GF) return h2h[y].GF - h2h[x].GF;
      if (statsByName[x].GD !== statsByName[y].GD)
        return statsByName[y].GD - statsByName[x].GD;
      if (statsByName[x].GF !== statsByName[y].GF)
        return statsByName[y].GF - statsByName[x].GF;
      return x.localeCompare(y);
    });
    for (const name of tiedNames) final.push(statsByName[name]);
  }

  return final;
}

/* ---------------------------
    Clinch detection (exhaustive-ish)
    --------------------------- */

const DEFAULT_SCORE_OPTIONS = [
  { h: 0, a: 0 },
  { h: 1, a: 1 },
  { h: 1, a: 0 },
  { h: 2, a: 0 },
  { h: 3, a: 0 },
  { h: 0, a: 1 },
  { h: 0, a: 2 },
  { h: 0, a: 3 },
];

function computeFinalStandingGivenAssignment(participants, matches) {
  return rankTeams(participants, matches);
}

function checkClinchExact(participants, schedule, teamToTest, options = {}) {
  const scoreOptions = options.scoreOptions || DEFAULT_SCORE_OPTIONS;
  const timeoutMs = options.timeoutMs || 4000;
  const maxExplore = options.maxAssignExplored || 200000;

  const completed = schedule
    .filter((x) => x.status === "Completed")
    .map((x) => ({ ...x }));
  const remaining = schedule
    .filter((x) => x.status !== "Completed")
    .map((x) => ({ ...x }));

  const nowRanking = computeFinalStandingGivenAssignment(participants, [
    ...completed,
  ]);
  if (nowRanking[0].name !== teamToTest)
    return { clinched: false, reason: "already_not_first", explored: 0 };
  if (remaining.length === 0)
    return { clinched: true, reason: "no_remaining", explored: 0 };

  const baseStats = {};
  participants.forEach((p) => {
    baseStats[p] = { Pts: 0, GF: 0, GA: 0, GD: 0, MP: 0 };
  });
  for (const cm of completed) {
    const hs = Number(cm.homeScore || 0);
    const as = Number(cm.awayScore || 0);
    baseStats[cm.homeParticipant].MP++;
    baseStats[cm.awayParticipant].MP++;
    baseStats[cm.homeParticipant].GF += hs;
    baseStats[cm.homeParticipant].GA += as;
    baseStats[cm.awayParticipant].GF += as;
    baseStats[cm.awayParticipant].GA += hs;
    if (hs > as) baseStats[cm.homeParticipant].Pts += 3;
    else if (hs < as) baseStats[cm.awayParticipant].Pts += 3;
    else {
      baseStats[cm.homeParticipant].Pts += 1;
      baseStats[cm.awayParticipant].Pts += 1;
    }
  }

  const remCount = {};
  participants.forEach((p) => (remCount[p] = 0));
  for (const rm of remaining) {
    if (Object.prototype.hasOwnProperty.call(remCount, rm.homeParticipant))
      remCount[rm.homeParticipant]++;
    if (Object.prototype.hasOwnProperty.call(remCount, rm.awayParticipant))
      remCount[rm.awayParticipant]++;
  }

  const start = Date.now();
  let assignmentsTried = 0;
  let foundCounterexample = false;

  const matchesWorking = [...completed, ...cloneMatches(remaining)];

  function dfs(idx) {
    if (foundCounterexample) return true;
    if (Date.now() - start > timeoutMs) return "timeout";
    if (assignmentsTried > maxExplore) return "cap";

    if (idx === remaining.length) {
      assignmentsTried++;
      const finalRank = computeFinalStandingGivenAssignment(
        participants,
        matchesWorking
      );
      if (finalRank[0].name !== teamToTest) {
        foundCounterexample = true;
        return true;
      }
      return false;
    }

    for (const sOpt of scoreOptions) {
      const wi = completed.length + idx;
      matchesWorking[wi].homeScore = sOpt.h;
      matchesWorking[wi].awayScore = sOpt.a;
      matchesWorking[wi].status = "Completed";

      const res = dfs(idx + 1);
      if (res === true) return true;
      if (res === "timeout" || res === "cap") return res;
    }

    matchesWorking[completed.length + idx].status = "Pending";
    return false;
  }

  const dfsRes = dfs(0);
  if (dfsRes === "timeout")
    return { clinched: false, reason: "timeout", explored: assignmentsTried };
  if (dfsRes === "cap")
    return { clinched: false, reason: "cap", explored: assignmentsTried };
  return {
    clinched: !foundCounterexample,
    reason: foundCounterexample ? "not_clinched" : "clinched",
    explored: assignmentsTried,
  };
}

/* ---------------------------
    LeagueTable component
    --------------------------- */

function LeagueTable({ participants = [], schedule = [], groupName = null }) {
  const { standings, maxMatchesPlayed, formToShow, clinchedMap } =
    useMemo(() => {
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
        form: [], // Initialize with empty array
      }));

      const completedMatches = tableSchedule
        .filter((m) => m.status === "Completed")
        .sort((a, b) => (a.round || 0) - (b.round || 0));

      for (const match of completedMatches) {
        const home = stats.find((s) => s.name === match.homeParticipant);
        const away = stats.find((s) => s.name === match.awayParticipant);
        if (!home || !away) continue;
        const hs = Number(match.homeScore || 0);
        const as = Number(match.awayScore || 0);
        home.MP++;
        away.MP++;
        home.GF += hs;
        home.GA += as;
        away.GF += as;
        away.GA += hs;

        if (hs > as) {
          home.W++;
          home.Pts += 3;
          home.form.push("W");
          away.L++;
          away.form.push("L");
        } else if (hs < as) {
          away.W++;
          away.Pts += 3;
          away.form.push("W");
          home.L++;
          home.form.push("L");
        } else {
          home.D++;
          away.D++;
          home.Pts += 1;
          away.Pts += 1;
          home.form.push("D");
          away.form.push("D");
        }
      }

      stats.forEach((s) => (s.GD = s.GF - s.GA));

      stats.sort((a, b) => {
        if (a.Pts !== b.Pts) return b.Pts - a.Pts;
        if (a.GD !== b.GD) return b.GD - a.GD;
        if (a.GF !== b.GF) return b.GF - a.GF;
        return a.name.localeCompare(b.name);
      });

      const maxMP = Math.max(...stats.map((t) => t.MP), 0);
      const formShow = Math.min(5, Math.max(0, maxMP));

      const clinchedMapLocal = {};
      const safetyOptions = {
        scoreOptions: DEFAULT_SCORE_OPTIONS,
        timeoutMs: 4000,
        maxAssignExplored: 200000,
      };

      const remainingMatches = tableSchedule.filter(
        (m) => m.status !== "Completed"
      );
      const REMAINING_SAFE_EXACT_LIMIT = 10;

      // Minimum matches required before considering clinch (prevents early false positives)
      const MIN_MATCHES_FOR_CLINCH = Math.max(3, tableParticipants.length - 1);

      if (maxMP < MIN_MATCHES_FOR_CLINCH) {
        // Too early in tournament, no one has clinched
        tableParticipants.forEach(t => clinchedMapLocal[t] = false);
      } else if (remainingMatches.length === 0) {
        const final = rankTeams(tableParticipants, completedMatches);
        final.forEach((t, idx) => (clinchedMapLocal[t.name] = idx === 0));
      } else if (remainingMatches.length > REMAINING_SAFE_EXACT_LIMIT) {
        const remCount = {};
        tableParticipants.forEach((p) => (remCount[p] = 0));
        for (const rm of remainingMatches) {
          if (
            Object.prototype.hasOwnProperty.call(remCount, rm.homeParticipant)
          )
            remCount[rm.homeParticipant]++;
          if (
            Object.prototype.hasOwnProperty.call(remCount, rm.awayParticipant)
          )
            remCount[rm.awayParticipant]++;
        }
        const basePts = {};
        stats.forEach((s) => (basePts[s.name] = s.Pts));
        for (const t of tableParticipants) {
          const tPts = basePts[t];
          let canCatch = false;
          for (const o of tableParticipants) {
            if (o === t) continue;
            const oMax = basePts[o] + 3 * remCount[o];
            if (oMax >= tPts) {
              canCatch = true;
              break;
            }
          }
          clinchedMapLocal[t] = !canCatch;
        }
      } else {
        for (const team of tableParticipants) {
          const res = checkClinchExact(
            tableParticipants,
            tableSchedule,
            team,
            safetyOptions
          );
          clinchedMapLocal[team] = Boolean(res.clinched);
          if (res.reason === "timeout" || res.reason === "cap")
            clinchedMapLocal[team] = false;
        }
      }

      return {
        standings: rankTeams(tableParticipants, [...completedMatches]),
        maxMatchesPlayed: maxMP,
        formToShow: formShow,
        clinchedMap: clinchedMapLocal,
      };
    }, [participants, schedule, groupName]);

  // Safe rendering with fallbacks
  if (!standings || !Array.isArray(standings)) {
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
        <p className="text-gray-400">No standings data available</p>
      </div>
    );
  }

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
            {standings.map((team, idx) => {
              // Safe access to form with fallback
              const teamForm = team?.form || [];
              const clinched = clinchedMap[team.name];
              const isChampion = clinched;

              return (
                <tr
                  key={team.name}
                  className={`transition-all hover:bg-white/10 ${
                    clinched
                      ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10"
                      : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          clinched
                            ? "text-yellow-400"
                            : idx < 3
                            ? "text-blue-400"
                            : "text-gray-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      {isChampion && (
                        <FaTrophy className="text-yellow-400 text-sm" />
                      )}
                      {!isChampion && idx < 3 && (
                        <FaMedal className="text-blue-400 text-xs" />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-8 rounded-full ${
                          clinched
                            ? "bg-gradient-to-b from-yellow-400 to-amber-500"
                            : ""
                        }`}
                      />
                      <span
                        className={`text-sm font-bold whitespace-nowrap ${
                          clinched ? "text-yellow-100" : "text-white"
                        }`}
                      >
                        {team.name}
                      </span>
                      {clinched && (
                        <span className="ml-3 inline-block text-xs px-2 py-1 rounded-full bg-yellow-600/20 text-yellow-300 border border-yellow-600/30">
                          Clinched
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-4 text-sm text-center font-medium text-gray-300">
                    {team.MP || 0}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-green-400">
                    {team.W || 0}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-gray-400">
                    {team.D || 0}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-red-400">
                    {team.L || 0}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-blue-300">
                    {team.GF || 0}
                  </td>
                  <td className="px-3 py-4 text-sm text-center font-bold text-orange-300">
                    {team.GA || 0}
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
                    {team.GD || 0}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
                      <span className="text-base font-black text-yellow-300">
                        {team.Pts || 0}
                      </span>
                    </span>
                  </td>

                  {maxMatchesPlayed > 0 && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-1.5">
                        {/* Safe form rendering */}
                        {teamForm.slice(-formToShow).map((r, i) => (
                          <FormBadge key={i} result={r} />
                        ))}
                        {teamForm.length < formToShow &&
                          Array.from({
                            length: formToShow - teamForm.length,
                          }).map((_, i) => (
                            <div
                              key={`empty-${i}`}
                              className="w-6 h-6 rounded-full border-2 border-dashed border-gray-600/50"
                            />
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {standings.length > 0 && (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-6 py-4 border-t border-white/10">
          <div className="flex flex-wrap gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500" />
              <span className="text-gray-300">Champion / Clinched</span>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default LeagueTable;
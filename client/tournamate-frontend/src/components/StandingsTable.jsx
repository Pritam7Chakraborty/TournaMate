function StandingsTable({ participants, schedule }) {
  // 1. Initialize a stats object for each participant
  const stats = {};
  participants.forEach((p) => {
    stats[p] = {
      name: p,
      pld: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
    };
  });

  // 2. Loop through completed matches to calculate stats
  const completedMatches = schedule.filter((m) => m.status === "Completed");
  completedMatches.forEach((match) => {
    const home = stats[match.homeParticipant];
    const away = stats[match.awayParticipant];

    // Update Played, Goals For, Goals Against
    home.pld++;
    away.pld++;
    home.gf += match.homeScore;
    away.gf += match.awayScore;
    home.ga += match.awayScore;
    away.ga += match.homeScore;

    // Determine Win, Draw, or Loss and update points
    if (match.homeScore > match.awayScore) {
      home.w++;
      away.l++;
      home.pts += 3;
    } else if (match.awayScore > match.homeScore) {
      away.w++;
      home.l++;
      away.pts += 3;
    } else {
      home.d++;
      away.d++;
      home.pts += 1;
      away.pts += 1;
    }
  });

  // 3. Convert stats object to an array and sort it
  const sortedStandings = Object.values(stats).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts; // Primary sort: Points
    a.gd = a.gf - a.ga;
    b.gd = b.gf - b.ga;
    if (b.gd !== a.gd) return b.gd - a.gd; // Tie-breaker 1: Goal Difference
    if (b.gf !== a.gf) return b.gf - a.gf; // Tie-breaker 2: Goals For
    return a.name.localeCompare(b.name); // Tie-breaker 3: Alphabetical
  });

  // 4. Render the table with the sorted data
  return (
    <div className="bg-white/10 p-6 rounded-lg mt-6">
      <h3 className="text-xl font-bold text-white mb-4">Standings</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-white uppercase bg-white/10">
            <tr>
              <th scope="col" className="px-4 py-3">
                Pos
              </th>
              <th scope="col" className="px-4 py-3">
                Team
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Pld
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                W
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                D
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                L
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                GF
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                GA
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                GD
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((team, index) => (
              <tr
                key={team.name}
                className="border-b border-gray-700 hover:bg-gray-800/50"
              >
                <td className="px-4 py-3">{index + 1}</td>
                <th
                  scope="row"
                  className="px-4 py-3 font-medium text-white whitespace-nowrap"
                >
                  {team.name}
                </th>
                <td className="px-4 py-3 text-center">{team.pld}</td>
                <td className="px-4 py-3 text-center">{team.w}</td>
                <td className="px-4 py-3 text-center">{team.d}</td>
                <td className="px-4 py-3 text-center">{team.l}</td>
                <td className="px-4 py-3 text-center">{team.gf}</td>
                <td className="px-4 py-3 text-center">{team.ga}</td>
                <td className="px-4 py-3 text-center">{team.gf - team.ga}</td>
                <td className="px-4 py-3 text-center font-bold text-white">
                  {team.pts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StandingsTable;

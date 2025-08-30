function StatsView({ participants, schedule }) {
  // Return early if there's no data to process
  if (!schedule || schedule.length === 0) {
    return (
      <div className="bg-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-3">Statistics</h3>
        <p className="text-gray-500">No matches completed yet.</p>
      </div>
    );
  }

  // --- 1. Calculate Stats ---
  const stats = {};
  participants.forEach((p) => {
    stats[p] = { name: p, goalsFor: 0, goalsAgainst: 0 };
  });

  const completedMatches = schedule.filter((m) => m.status === "Completed");
  completedMatches.forEach((match) => {
    stats[match.homeParticipant].goalsFor += match.homeScore;
    stats[match.homeParticipant].goalsAgainst += match.awayScore;
    stats[match.awayParticipant].goalsFor += match.awayScore;
    stats[match.awayParticipant].goalsAgainst += match.homeScore;
  });

  // --- 2. Create and Sort Leaderboards ---
  const statsArray = Object.values(stats);

  const topScorers = [...statsArray]
    .sort((a, b) => b.goalsFor - a.goalsFor)
    .slice(0, 5);

  const bestDefenses = [...statsArray]
    .sort((a, b) => a.goalsAgainst - b.goalsAgainst)
    .slice(0, 5);

  // --- 3. Render the Component ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Scorers Card */}
      <div className="bg-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Top Scorers (Goals For)
        </h3>
        <ul className="space-y-3">
          {topScorers.map((team, index) => (
            <li
              key={team.name}
              className="flex justify-between items-center text-white bg-gray-900/50 p-3 rounded"
            >
              <span className="font-medium">
                {index + 1}. {team.name}
              </span>
              <span className="font-bold text-lg">{team.goalsFor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Best Defenses Card */}
      <div className="bg-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Best Defenses (Goals Against)
        </h3>
        <ul className="space-y-3">
          {bestDefenses.map((team, index) => (
            <li
              key={team.name}
              className="flex justify-between items-center text-white bg-gray-900/50 p-3 rounded"
            >
              <span className="font-medium">
                {index + 1}. {team.name}
              </span>
              <span className="font-bold text-lg">{team.goalsAgainst}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StatsView;

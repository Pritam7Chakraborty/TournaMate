// src/components/LeagueTable.jsx
import { useMemo } from 'react';

// Helper component for the W/D/L "Last 5" badges
function FormBadge({ result }) {
  const baseClass = 'w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold';
  if (result === 'W') return <div className={`${baseClass} bg-green-500 text-white`}>W</div>;
  if (result === 'D') return <div className={`${baseClass} bg-gray-500 text-white`}>D</div>;
  if (result === 'L') return <div className={`${baseClass} bg-red-500 text-white`}>L</div>;
  return null;
}

function LeagueTable({ participants, schedule }) {
  // useMemo is crucial for performance.
  // This logic will ONLY re-run if 'participants' or 'schedule' changes.
  const standings = useMemo(() => {
    // 1. Initialize stats for every participant
    const stats = participants.map(p => ({
      name: p, MP: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0, form: [],
    }));

    // 2. Filter for completed matches and sort them by round
    const completedMatches = schedule
      .filter(m => m.status === 'Completed')
      .sort((a, b) => a.round - b.round);

    // 3. Loop through each match and update stats for both teams
    for (const match of completedMatches) {
      const homeTeam = stats.find(s => s.name === match.homeParticipant);
      const awayTeam = stats.find(s => s.name === match.awayParticipant);

      if (!homeTeam || !awayTeam) continue; // Skip if participant not found (shouldn't happen)

      // Update stats for both teams
      homeTeam.MP++;
      awayTeam.MP++;
      homeTeam.GF += match.homeScore;
      homeTeam.GA += match.awayScore;
      awayTeam.GF += match.awayScore;
      awayTeam.GA += match.homeScore;
      homeTeam.GD = homeTeam.GF - homeTeam.GA;
      awayTeam.GD = awayTeam.GF - awayTeam.GA;

      // Determine Win/Loss/Draw
      if (match.homeScore > match.awayScore) {
        // Home win
        homeTeam.W++;
        homeTeam.Pts += 3;
        homeTeam.form.push('W');
        awayTeam.L++;
        awayTeam.form.push('L');
      } else if (match.homeScore < match.awayScore) {
        // Away win
        awayTeam.W++;
        awayTeam.Pts += 3;
        awayTeam.form.push('W');
        homeTeam.L++;
        homeTeam.form.push('L');
      } else {
        // Draw
        homeTeam.D++;
        awayTeam.D++;
        homeTeam.Pts += 1;
        awayTeam.Pts += 1;
        homeTeam.form.push('D');
        awayTeam.form.push('D');
      }
    }

    // 4. Sort the table
    stats.sort((a, b) => {
      if (a.Pts !== b.Pts) return b.Pts - a.Pts; // 1. Points
      if (a.GD !== b.GD) return b.GD - a.GD;   // 2. Goal Difference
      if (a.GF !== b.GF) return b.GF - a.GF;   // 3. Goals For
      return a.name.localeCompare(b.name);      // 4. Alphabetical
    });

    return stats;
  }, [participants, schedule]);

  // --- Render the Table ---
  return (
    <div className="bg-white/10 rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-white">
        {/* Table Header */}
        <thead className="bg-gray-800/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Club</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">MP</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">W</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">D</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">L</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">GF</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">GA</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">GD</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Pts</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Last 5</th>
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {standings.map((team, index) => (
            <tr key={team.name} className="hover:bg-gray-700">
              <td className="px-4 py-3 text-sm text-gray-300">{index + 1}</td>
              <td className="px-6 py-3 text-sm font-medium text-white whitespace-nowrap">{team.name}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-300">{team.MP}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-300">{team.W}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-300">{team.D}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-300">{team.L}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-300">{team.GF}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-300">{team.GA}</td>
              <td className="px-4 py-3 text-sm text-center text-gray-300">{team.GD}</td>
              <td className="px-4 py-3 text-sm text-center font-bold text-white">{team.Pts}</td>
              <td className="px-6 py-3">
                <div className="flex justify-center items-center gap-1">
                  {team.form.slice(-5).map((result, i) => (
                    <FormBadge key={i} result={result} />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeagueTable;
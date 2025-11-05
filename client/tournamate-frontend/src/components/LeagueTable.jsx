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
  
  const standings = useMemo(() => {
    // 1. Initialize stats for every participant
    const stats = participants.map(p => ({
      name: p, MP: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0, form: [],
    }));

    // 2. Filter for completed matches and sort them by round
    const completedMatches = schedule
      .filter(m => m.status === 'Completed')
      .sort((a, b) => a.round - b.round);

    // 3. Loop through each match and update OVERALL stats
    for (const match of completedMatches) {
      const homeTeam = stats.find(s => s.name === match.homeParticipant);
      const awayTeam = stats.find(s => s.name === match.awayParticipant);
      if (!homeTeam || !awayTeam) continue; 

      homeTeam.MP++;
      awayTeam.MP++;
      homeTeam.GF += match.homeScore;
      homeTeam.GA += match.awayScore;
      awayTeam.GF += match.awayScore;
      awayTeam.GA += match.homeScore;
      homeTeam.GD = homeTeam.GF - homeTeam.GA;
      awayTeam.GD = awayTeam.GF - awayTeam.GA;

      if (match.homeScore > match.awayScore) {
        homeTeam.W++; homeTeam.Pts += 3; homeTeam.form.push('W');
        awayTeam.L++; awayTeam.form.push('L');
      } else if (match.homeScore < match.awayScore) {
        awayTeam.W++; awayTeam.Pts += 3; awayTeam.form.push('W');
        homeTeam.L++; homeTeam.form.push('L');
      } else {
        homeTeam.D++; awayTeam.D++; homeTeam.Pts += 1; awayTeam.Pts += 1;
        homeTeam.form.push('D'); awayTeam.form.push('D');
      }
    }

    // --- 4. ADVANCED TIE-BREAKER SORT LOGIC ---

    // Helper function to get H2H stats for a group of tied teams
    const getH2HStats = (teams) => {
      const h2hStats = {};
      teams.forEach(t => { h2hStats[t.name] = { name: t.name, Pts: 0, GD: 0, GF: 0 }; });
      const teamNames = teams.map(t => t.name);

      for (const match of completedMatches) {
        // Check if this match was played between two of the tied teams
        if (teamNames.includes(match.homeParticipant) && teamNames.includes(match.awayParticipant)) {
          const home = h2hStats[match.homeParticipant];
          const away = h2hStats[match.awayParticipant];
          
          home.GF += match.homeScore;
          home.GA += match.awayScore;
          away.GF += match.awayScore;
          away.GA += match.homeScore;

          if (match.homeScore > match.awayScore) home.Pts += 3;
          else if (match.homeScore < match.awayScore) away.Pts += 3;
          else { home.Pts += 1; away.Pts += 1; }
        }
      }
      // Calculate GD
      Object.values(h2hStats).forEach(s => { s.GD = s.GF - s.GA; });
      return h2hStats;
    };

    stats.sort((a, b) => {
      // 1. Overall Points
      if (a.Pts !== b.Pts) return b.Pts - a.Pts;

      // --- Tied on points, activate H2H logic ---
      // Find all teams tied with 'a' (which includes 'b')
      const tiedTeams = stats.filter(team => team.Pts === a.Pts);

      // If it's just a 2-way tie, or a multi-way tie, this logic works.
      const h2hStats = getH2HStats(tiedTeams);
      const a_h2h = h2hStats[a.name];
      const b_h2h = h2hStats[b.name];

      // 2. Head-to-head Points
      if (a_h2h.Pts !== b_h2h.Pts) return b_h2h.Pts - a_h2h.Pts;

      // 3. Head-to-head Goal Difference
      if (a_h2h.GD !== b_h2h.GD) return b_h2h.GD - a_h2h.GD;

      // 4. Head-to-head Goals For
      if (a_h2h.GF !== b_h2h.GF) return b_h2h.GF - a_h2h.GF;

      // 5. Fallback to Overall Goal Difference
      if (a.GD !== b.GD) return b.GD - a.GD;

      // 6. Fallback to Overall Goals For
      if (a.GF !== b.GF) return b.GF - a.GF;

      // 7. Alphabetical
      return a.name.localeCompare(b.name);
    });

    return stats;
  }, [participants, schedule]);

  // --- Render the Table (No changes here) ---
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
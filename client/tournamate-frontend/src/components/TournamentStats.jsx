// src/components/TournamentStats.jsx
import { useMemo } from "react";
import { FaFutbol, FaShieldAlt, FaFire } from "react-icons/fa";

// A simple reusable stat card
function StatCard({ icon, title, value, team }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center">
      <div className="p-3 rounded-full bg-pink-600/30 text-pink-400 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 uppercase">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-300">{team}</p>
      </div>
    </div>
  );
}

function TournamentStats({ participants, schedule }) {
  const stats = useMemo(() => {
    // 1. Get the same standings logic from LeagueTable
    const standings = {};
    participants.forEach((p) => {
      standings[p] = { name: p, GF: 0, GA: 0 };
    });

    const completedMatches = schedule.filter((m) => m.status === "Completed");
    let highestScoringMatch = null;
    let maxGoals = -1;

    for (const match of completedMatches) {
      const home = standings[match.homeParticipant];
      const away = standings[match.awayParticipant];

      if (home) {
        home.GF += match.homeScore;
        home.GA += match.awayScore;
      }
      if (away) {
        away.GF += match.awayScore;
        away.GA += match.homeScore;
      }

      // 2. Find highest scoring match
      const totalGoals = match.homeScore + match.awayScore;
      if (totalGoals > maxGoals) {
        maxGoals = totalGoals;
        highestScoringMatch = match;
      }
    }

    const teamStats = Object.values(standings);

    // 3. Find Top Scorer and Best Defense
    const topScorer = [...teamStats].sort((a, b) => b.GF - a.GF)[0];
    const bestDefense = [...teamStats].sort((a, b) => a.GA - b.GA)[0];

    return { topScorer, bestDefense, highestScoringMatch };
  }, [participants, schedule]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={<FaFire size={20} />}
        title="Top Scorer (Team)"
        value={`${stats.topScorer?.GF} Goals`}
        team={stats.topScorer?.name}
      />
      <StatCard
        icon={<FaShieldAlt size={20} />}
        title="Best Defense (Team)"
        value={`${stats.bestDefense?.GA} Conceded`}
        team={stats.bestDefense?.name}
      />
      {stats.highestScoringMatch ? (
        <StatCard
          icon={<FaFutbol size={20} />}
          title="Highest Scoring Match"
          value={`${stats.highestScoringMatch.homeScore} - ${stats.highestScoringMatch.awayScore}`}
          team={`${stats.highestScoringMatch.homeParticipant} vs ${stats.highestScoringMatch.awayParticipant}`}
        />
      ) : (
        <StatCard
          icon={<FaFutbol size={20} />}
          title="Highest Scoring Match"
          value="N/A"
          team="No completed matches yet."
        />
      )}
    </div>
  );
}

export default TournamentStats;

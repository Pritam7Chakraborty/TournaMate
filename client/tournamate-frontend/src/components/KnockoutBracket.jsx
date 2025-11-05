// src/components/KnockoutBracket.jsx
import { useMemo, useState } from 'react';
import { FaEdit } from 'react-icons/fa';

// --- Single Match Card Component (Updated) ---
function MatchCard({ match, onOpenModal }) {
  const isPending = match.status === 'Pending';
  const isTBD = match.status === 'TBD';
  const isCompleted = match.status === 'Completed';

  // Determine winners
  const homeWinner = isCompleted && (match.winner === match.homeParticipant);
  const awayWinner = isCompleted && (match.winner === match.awayParticipant);
  
  const getParticipantClass = (isWinner) => 
    `flex justify-between items-center p-2 ${isWinner ? 'font-bold text-white' : 'text-gray-400'}`;

  // Check for penalty shootout
  const penaltyScore = (match.homePenaltyScore !== null) 
    ? `(${match.homePenaltyScore} - ${match.awayPenaltyScore}p)` 
    : '';

  return (
    <div className="bg-gray-800 rounded-lg w-full md:w-64 min-h-[100px] shadow-lg">
      <div className="p-3">
        <div className={getParticipantClass(homeWinner)}>
          <span>{match.homeParticipant}</span>
          <span className="font-mono">{isCompleted ? match.homeScore : ''}</span>
        </div>
        
        <div className="border-b border-gray-700 my-1"></div>
        
        <div className={getParticipantClass(awayWinner)}>
          <span>{match.awayParticipant}</span>
          <span className="font-mono">{isCompleted ? match.awayScore : ''}</span>
        </div>

        {penaltyScore && (
          <p className="text-xs text-center text-yellow-400 mt-1">
            Won on penalties {penaltyScore}
          </p>
        )}
      </div>
      
      {isPending && (
        <button 
          onClick={() => onOpenModal(match)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium w-full py-1.5 px-3 flex items-center justify-center rounded-b-lg"
        >
          <FaEdit className="mr-1.5" /> Update Score
        </button>
      )}
      {isTBD && (
        <div className="bg-gray-700 text-gray-400 text-xs font-medium w-full py-1.5 px-3 text-center rounded-b-lg">
          Waiting for participants...
        </div>
      )}
      {isCompleted && !penaltyScore && (
        <div className="bg-green-600 text-white text-xs font-medium w-full py-1.5 px-3 text-center rounded-b-lg">
          Final
        </div>
      )}
      {isCompleted && penaltyScore && (
        <div className="bg-green-600 text-white text-xs font-medium w-full py-1.5 px-3 text-center rounded-b-lg">
          Final (Pens)
        </div>
      )}
    </div>
  );
}


// --- Main Responsive Bracket Component ---
function KnockoutBracket({ schedule, onOpenModal }) {
  // Group matches by round (KO stage)
  const rounds = useMemo(() => {
    return schedule.reduce((acc, match) => {
      const round = match.round;
      if (!acc[round]) acc[round] = [];
      // Sort matches by matchNumber
      acc[round].push(match);
      acc[round].sort((a, b) => a.matchNumber - b.matchNumber);
      return acc;
    }, {});
  }, [schedule]);

  const sortedRoundKeys = Object.keys(rounds).sort((a, b) => b - a);
  const [activeMobileRound, setActiveMobileRound] = useState(sortedRoundKeys[0]);

  const getRoundTitle = (roundKey) => {
    const roundNum = Number(roundKey);
    if (roundNum === 1) return 'Final';
    if (roundNum === 2) return 'Semi-Finals';
    if (roundNum === 4) return 'Quarter-Finals';
    return `Round of ${roundNum * 2}`;
  };

  const getTabClass = (roundKey) => {
    const base = "py-2 px-4 font-medium text-sm rounded-md";
    if (roundKey === activeMobileRound) {
      return `${base} bg-pink-600 text-white`;
    }
    return `${base} bg-gray-700 text-gray-300`;
  };

  return (
    <div>
      {/* --- 1. Mobile-Only Tabbed View --- */}
      <div className="md:hidden">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedRoundKeys.map(key => (
            <button key={key} className={getTabClass(key)} onClick={() => setActiveMobileRound(key)}>
              {getRoundTitle(key)}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex flex-col gap-4">
          {rounds[activeMobileRound].map(match => (
            <MatchCard key={match._id} match={match} onOpenModal={onOpenModal} />
          ))}
        </div>
      </div>

      {/* --- 2. Desktop-Only Horizontal Scroll View --- */}
      <div className="hidden md:flex overflow-x-auto py-4">
        {sortedRoundKeys.map(roundKey => (
          <div key={roundKey} className="flex flex-col justify-center min-w-[300px] px-4">
            <h3 className="text-xl font-bold text-pink-400 mb-4 text-center">
              {getRoundTitle(roundKey)}
            </h3>
            <div className="flex flex-col gap-6">
              {rounds[roundKey].map(match => (
                <MatchCard key={match._id} match={match} onOpenModal={onOpenModal} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KnockoutBracket;
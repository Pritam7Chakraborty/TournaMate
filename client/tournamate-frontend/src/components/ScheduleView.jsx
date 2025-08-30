import { useState } from 'react';

function ScheduleView({ schedule, onGenerateSchedule, onScoreUpdate, onResetSchedule }) {
  const [scores, setScores] = useState({});

  const handleScoreChange = (matchId, team, value) => {
    setScores(prevScores => ({
      ...prevScores,
      [matchId]: { ...prevScores[matchId], [team]: value }
    }));
  };

  const handleSaveClick = (matchId) => {
    const matchScores = scores[matchId];
    if (matchScores?.home === undefined || matchScores?.away === undefined) {
      alert('Please enter both scores.');
      return;
    }
    onScoreUpdate(matchId, matchScores);
    setScores({});
  };

  const rounds = schedule.reduce((acc, match) => {
    (acc[match.round] = acc[match.round] || []).push(match);
    return acc;
  }, {});

  return (
    <div className="bg-white/10 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Schedule</h3>
        {schedule?.length > 0 && (
          <button onClick={onResetSchedule} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
            Reset
          </button>
        )}
      </div>

      {schedule?.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(rounds).map(([roundNumber, matches]) => (
            <div key={roundNumber}>
              <h4 className="text-lg font-semibold text-pink-400 mb-2">Match Day {roundNumber}</h4>
              <div className="space-y-3">
                {matches.map((match) => (
                  <div key={match._id} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4 bg-gray-900/50 p-3 rounded-lg">
                    <span className="text-right text-white font-medium">{match.homeParticipant}</span>
                    {match.status === 'Completed' ? (
                      <div className="flex justify-center items-center gap-2 text-lg font-bold text-white">
                        <span>{match.homeScore}</span>
                        <span className="text-gray-400">-</span>
                        <span>{match.awayScore}</span>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center gap-2">
                        <input type="number" className="w-12 text-center bg-gray-700 text-white rounded"
                          onChange={(e) => handleScoreChange(match._id, 'home', e.target.value)} />
                        <span className="text-gray-400">-</span>
                        <input type="number" className="w-12 text-center bg-gray-700 text-white rounded"
                          onChange={(e) => handleScoreChange(match._id, 'away', e.target.value)} />
                      </div>
                    )}
                    <span className="text-left text-white font-medium">{match.awayParticipant}</span>
                    {match.status !== 'Completed' && (
                      <button onClick={() => handleSaveClick(match._id)} className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1 px-2 rounded">
                        Save
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-gray-500 mb-4">No schedule has been generated yet.</p>
          <button
            onClick={onGenerateSchedule}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
          >
            Generate Schedule
          </button>
        </div>
      )}
    </div>
  );
}

export default ScheduleView;
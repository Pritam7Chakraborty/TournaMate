// src/components/UpdateScoreModal.jsx
import { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

function UpdateScoreModal({ match, onSave, onClose }) {
  const [homeScore, setHomeScore] = useState(match.homeScore || 0);
  const [awayScore, setAwayScore] = useState(match.awayScore || 0);
  
  // --- NEW: State for penalties ---
  const [homePenalties, setHomePenalties] = useState(match.homePenaltyScore || 0);
  const [awayPenalties, setAwayPenalties] = useState(match.awayPenaltyScore || 0);

  // Check if scores are tied (and it's not a league)
  const isDraw = homeScore === awayScore;

  useEffect(() => {
    setHomeScore(match.homeScore || 0);
    setAwayScore(match.awayScore || 0);
    setHomePenalties(match.homePenaltyScore || 0);
    setAwayPenalties(match.awayPenaltyScore || 0);
  }, [match]);

  const handleSave = (e) => {
    e.preventDefault();
    onSave(
      parseInt(homeScore, 10),
      parseInt(awayScore, 10),
      // Pass penalties ONLY if it was a draw
      isDraw ? parseInt(homePenalties, 10) : null,
      isDraw ? parseInt(awayPenalties, 10) : null
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-white mb-4">Update Score</h3>
        <p className="text-lg text-gray-300 text-center">{match.homeParticipant}</p>
        <p className="text-sm text-pink-400 text-center mb-1">vs</p>
        <p className="text-lg text-gray-300 text-center mb-6">{match.awayParticipant}</p>

        <form onSubmit={handleSave}>
          <label className="block text-gray-300 text-sm font-bold mb-2 text-center">
            Full Time Score
          </label>
          <div className="flex justify-center items-center gap-4">
            <input
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className="w-24 text-center text-3xl font-bold bg-gray-700 text-white rounded-lg p-3"
              min="0"
            />
            <span className="text-3xl text-gray-400">-</span>
            <input
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className="w-24 text-center text-3xl font-bold bg-gray-700 text-white rounded-lg p-3"
              min="0"
            />
          </div>

          {/* --- NEW: Conditional Penalty Inputs --- */}
          {isDraw && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <label className="block text-yellow-400 text-sm font-bold mb-2 text-center">
                Penalty Shootout Score
              </label>
              <div className="flex justify-center items-center gap-4">
                <input
                  type="number"
                  value={homePenalties}
                  onChange={(e) => setHomePenalties(e.target.value)}
                  className="w-24 text-center text-2xl font-bold bg-gray-700 text-white rounded-lg p-3"
                  min="0"
                />
                <span className="text-2xl text-gray-400">-</span>
                <input
                  type="number"
                  value={awayPenalties}
                  onChange={(e) => setAwayPenalties(e.tag.value)}
                  className="w-24 text-center text-2xl font-bold bg-gray-700 text-white rounded-lg p-3"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="...">
              Cancel
            </button>
            <button type="submit" className="...">
              Save Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateScoreModal;
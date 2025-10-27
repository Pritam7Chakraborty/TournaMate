// src/components/UpdateScoreModal.jsx
import { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

function UpdateScoreModal({ match, onSave, onClose }) {
  // Initialize state with the match's current scores (or 0)
  const [homeScore, setHomeScore] = useState(match.homeScore || 0);
  const [awayScore, setAwayScore] = useState(match.awayScore || 0);

  // Ensure state updates if the selected match prop changes
  useEffect(() => {
    setHomeScore(match.homeScore || 0);
    setAwayScore(match.awayScore || 0);
  }, [match]);

  const handleSave = (e) => {
    e.preventDefault();
    // Pass the numeric values back to the parent
    onSave(parseInt(homeScore, 10), parseInt(awayScore, 10));
  };

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose} // Close modal on overlay click
    >
      {/* Modal Content */}
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()} // Prevent content click from closing modal
      >
        <h3 className="text-2xl font-bold text-white mb-4">Update Score</h3>
        <p className="text-lg text-gray-300 text-center mb-2">
          {match.homeParticipant}
        </p>
        <p className="text-sm text-pink-400 text-center mb-4">vs</p>
        <p className="text-lg text-gray-300 text-center mb-6">
          {match.awayParticipant}
        </p>

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="flex justify-center items-center gap-4">
            {/* Home Score Input */}
            <input
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className="w-24 text-center text-3xl font-bold bg-gray-700 text-white rounded-lg p-3"
              min="0"
            />
            <span className="text-3xl text-gray-400">-</span>
            {/* Away Score Input */}
            <input
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className="w-24 text-center text-3xl font-bold bg-gray-700 text-white rounded-lg p-3"
              min="0"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <FaSave className="mr-2" />
              Save Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateScoreModal;
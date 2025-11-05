// src/components/UpdateScoreModal.jsx
import { useState, useEffect } from "react";
import { FaSave, FaTimes, FaFutbol, FaCrosshairs } from "react-icons/fa";

function UpdateScoreModal({ match, isKnockoutMatch = false, onSave, onClose }) {
  const [homeScore, setHomeScore] = useState(match.homeScore ?? "");
  const [awayScore, setAwayScore] = useState(match.awayScore ?? "");
  const [homePenalties, setHomePenalties] = useState(match.homePenaltyScore ?? "");
  const [awayPenalties, setAwayPenalties] = useState(match.awayPenaltyScore ?? "");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setHomeScore(match.homeScore ?? "");
    setAwayScore(match.awayScore ?? "");
    setHomePenalties(match.homePenaltyScore ?? "");
    setAwayPenalties(match.awayPenaltyScore ?? "");
    
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, [match]);

  const hs = homeScore === "" ? null : Number(homeScore);
  const as = awayScore === "" ? null : Number(awayScore);
  const isDraw = hs !== null && as !== null && hs === as;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (hs === null || as === null) {
      return alert("Enter both full-time scores.");
    }

    if (isKnockoutMatch && isDraw) {
      const hp = homePenalties === "" ? null : Number(homePenalties);
      const ap = awayPenalties === "" ? null : Number(awayPenalties);
      if (hp === null || ap === null) {
        return alert("Knockout match is a draw — provide penalty scores.");
      }
      if (hp === ap) return alert("Penalty scores cannot be a tie.");
      onSave(hs, as, hp, ap);
      onClose();
      return;
    }

    onSave(hs, as, null, null);
    onClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-pink-500/20 overflow-hidden transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-pink-600/30 border-b border-pink-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FaFutbol className="text-white text-lg" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Update Score</h3>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white transition-all flex items-center justify-center group"
            >
              <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Match Info */}
        <div className="px-6 py-8 text-center relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50"></div>
          
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex-1 text-right">
              <p className="text-2xl font-bold text-white mb-1">{match.homeParticipant}</p>
              <div className="w-full h-1 bg-gradient-to-r from-transparent to-pink-500/50 rounded-full"></div>
            </div>
            
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 animate-pulse">
                <span className="text-white font-bold text-sm">VS</span>
              </div>
            </div>
            
            <div className="flex-1 text-left">
              <p className="text-2xl font-bold text-white mb-1">{match.awayParticipant}</p>
              <div className="w-full h-1 bg-gradient-to-l from-transparent to-purple-500/50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          {/* Full Time Score */}
          <div>
            <label className="block text-center text-sm font-bold text-pink-400 mb-3 uppercase tracking-wider flex items-center justify-center gap-2">
              <FaFutbol className="text-xs" />
              Full Time Score
            </label>
            <div className="flex justify-center items-center gap-6">
              <div className="relative group">
                <input
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-28 h-28 text-center text-5xl font-black bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl border-2 border-pink-500/30 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all shadow-lg shadow-pink-500/10 group-hover:shadow-pink-500/20"
                  min="0"
                  placeholder="0"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl text-gray-500 font-bold">:</span>
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
              </div>
              
              <div className="relative group">
                <input
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-28 h-28 text-center text-5xl font-black bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl border-2 border-purple-500/30 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all shadow-lg shadow-purple-500/10 group-hover:shadow-purple-500/20"
                  min="0"
                  placeholder="0"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>

          {/* Penalty Shootout (Conditional) */}
          {isKnockoutMatch && isDraw && (
            <div className="animate-slideDown">
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mb-4"></div>
              
              <label className="block text-center text-sm font-bold text-yellow-400 mb-3 uppercase tracking-wider flex items-center justify-center gap-2 animate-pulse">
                <FaCrosshairs className="text-xs" />
                Penalty Shootout
              </label>
              
              <div className="flex justify-center items-center gap-6">
                <div className="relative group">
                  <input
                    type="number"
                    value={homePenalties}
                    onChange={(e) => setHomePenalties(e.target.value)}
                    className="w-24 h-24 text-center text-4xl font-black bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 text-yellow-300 rounded-2xl border-2 border-yellow-500/40 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all shadow-lg shadow-yellow-500/10 group-hover:shadow-yellow-500/20"
                    min="0"
                    placeholder="0"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl text-yellow-500/50 font-bold">:</span>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                </div>
                
                <div className="relative group">
                  <input
                    type="number"
                    value={awayPenalties}
                    onChange={(e) => setAwayPenalties(e.target.value)}
                    className="w-24 h-24 text-center text-4xl font-black bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 text-yellow-300 rounded-2xl border-2 border-yellow-500/40 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all shadow-lg shadow-yellow-500/10 group-hover:shadow-yellow-500/20"
                    min="0"
                    placeholder="0"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              
              <p className="text-center text-xs text-yellow-400/70 mt-3 italic">
                🎯 Penalties cannot be tied - must have a winner
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 group"
            >
              <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transform hover:scale-105 group animate-gradient bg-[length:200%_auto]"
            >
              <FaSave className="group-hover:scale-110 transition-transform" />
              Save Score
            </button>
          </div>
        </form>

        {/* Bottom decorative line */}
        <div className="h-2 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 animate-gradient bg-[length:200%_auto]"></div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default UpdateScoreModal;
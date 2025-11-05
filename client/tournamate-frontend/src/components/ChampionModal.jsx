// src/components/ChampionModal.jsx
import { useState, useEffect } from 'react';
import { FaTrophy, FaCrown, FaStar, FaTimes } from 'react-icons/fa';

function ChampionModal({ name, type, onClose, autoCloseMs = 10000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 50);

    // Generate confetti
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      rotation: Math.random() * 360,
      color: ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 5)]
    }));
    setConfetti(confettiPieces);

    // Auto-close timer
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCloseMs]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 500);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-lg flex justify-center items-center z-[100] transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-2 h-2 rounded-full animate-confettiFall"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`
          }}
        />
      ))}

      {/* Modal Container */}
      <div
        className={`relative max-w-2xl w-full mx-4 transform transition-all duration-700 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white transition-all z-10 flex items-center justify-center group shadow-lg"
        >
          <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Main Content */}
        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-3xl border-4 border-yellow-500/50 shadow-2xl overflow-hidden">
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 animate-shimmer"></div>
          
          {/* Stars Background */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <FaStar
                key={i}
                className="absolute text-yellow-400/20 animate-twinkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 12 + 8}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 2 + 2}s`
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 p-12 text-center">
            {/* Trophy Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative animate-bounce-slow">
                <div className="absolute inset-0 bg-yellow-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50 border-4 border-yellow-300">
                  <FaTrophy className="text-white text-6xl animate-wiggle" />
                </div>
                {/* Crown on top */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-float">
                  <FaCrown className="text-yellow-400 text-4xl drop-shadow-2xl" />
                </div>
              </div>
            </div>

            {/* Championship Text */}
            <div className="space-y-4 mb-8">
              <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 animate-gradient bg-[length:200%_auto] drop-shadow-lg">
                🏆 CHAMPION! 🏆
              </h2>
              
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
              
              <p className="text-3xl md:text-5xl font-black text-white drop-shadow-lg animate-pulse-slow">
                {name}
              </p>
              
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50 rounded-full">
                <p className="text-lg text-purple-300 font-bold uppercase tracking-wider">
                  {type} Winner
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className="text-yellow-400 text-2xl animate-star-pop"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Congratulations Message */}
            <p className="text-xl text-gray-300 font-medium mb-6 animate-fadeIn">
              Congratulations on an outstanding victory!
            </p>

            {/* Action Button */}
            <button
              onClick={handleClose}
              className="group bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 text-gray-900 font-black text-lg px-10 py-4 rounded-2xl shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/80 transition-all transform hover:scale-105 animate-gradient bg-[length:200%_auto]"
            >
              <span className="flex items-center gap-3">
                <FaTrophy className="group-hover:rotate-12 transition-transform" />
                Celebrate Victory
                <FaTrophy className="group-hover:-rotate-12 transition-transform" />
              </span>
            </button>
          </div>

          {/* Bottom Accent */}
          <div className="h-3 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 animate-gradient bg-[length:200%_auto]"></div>
        </div>

        {/* Glow Effect Around Modal */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-yellow-500/20 blur-3xl -z-10 animate-pulse-slow"></div>
      </div>

      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          50% {
            transform: translateY(-10px) translateX(-50%);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes star-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-confettiFall {
          animation: confettiFall linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }

        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-star-pop {
          animation: star-pop 0.6s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out 0.5s forwards;
          opacity: 0;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default ChampionModal;
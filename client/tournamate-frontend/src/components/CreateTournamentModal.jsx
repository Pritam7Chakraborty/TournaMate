// src/components/CreateTournamentModal.jsx
import { useState } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";

function CreateTournamentModal({ onClose, onTournamentCreate }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("League"); // 'League', 'Knockout', 'League + Knockout'
  const [legs, setLegs] = useState(1); // 1 or 2
  const [koStartStage, setKoStartStage] = useState(8); // 4, 8, 16, 32
  const [participants, setParticipants] = useState([]);
  const [currentParticipant, setCurrentParticipant] = useState("");

  const handleAddParticipant = () => {
    if (currentParticipant && !participants.includes(currentParticipant)) {
      setParticipants([...participants, currentParticipant]);
      setCurrentParticipant("");
    }
  };

  const handleRemoveParticipant = (name) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onTournamentCreate({
      name,
      type,
      legs: Number(legs),
      koStartStage: Number(koStartStage), // Pass this new info
      participants,
    });
  };

  const showKnockoutOptions = type.includes("Knockout");

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Create New Tournament
          </h2>

          {/* Tournament Name */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Tournament Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-white"
              required
            />
          </div>

          {/* Row for Type and Legs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="type">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="shadow border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-white"
              >
                <option value="League">League</option>
                <option value="Knockout">Knockout</option>
                <option value="League + Knockout">League + Knockout</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="legs">
                Legs
              </label>
              <select
                id="legs"
                value={legs}
                onChange={(e) => setLegs(e.target.value)}
                className="shadow border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-white"
              >
                <option value={1}>1 Leg (Single Match)</option>
                <option value={2}>2 Legs (Home & Away)</option>
              </select>
            </div>
          </div>

          {/* Conditional Knockout Starting Stage */}
          {showKnockoutOptions && (
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="koStartStage">
                Knockout Starting Stage
              </label>
              <select
                id="koStartStage"
                value={koStartStage}
                onChange={(e) => setKoStartStage(e.target.value)}
                className="shadow border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-white"
              >
                <option value={4}>Semi-Finals (4 Teams)</option>
                <option value={8}>Quarter-Finals (8 Teams)</option>
                <option value={16}>Round of 16 (16 Teams)</option>
                <option value={32}>Round of 32 (32 Teams)</option>
              </select>
            </div>
          )}

          {/* Participant Entry */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Participants
            </label>
            <div className="flex">
              <input
                type="text"
                value={currentParticipant}
                onChange={(e) => setCurrentParticipant(e.target.value)}
                className="shadow-inner bg-gray-700 rounded-l w-full py-2 px-3 text-white"
                placeholder="Enter team name"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-r"
              >
                <FaPlus />
              </button>
            </div>
          </div>

          {/* Participant List */}
          <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
            {participants.map((p) => (
              <span
                key={p}
                className="bg-indigo-600/50 border border-indigo-500 text-gray-100 text-sm font-medium px-3 py-1.5 rounded-full flex items-center"
              >
                {p}
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(p)}
                  className="ml-2 text-indigo-200 hover:text-white"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-lg"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTournamentModal;
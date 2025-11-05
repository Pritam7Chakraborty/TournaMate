// src/components/CreateTournamentModal.jsx
import { useState, useMemo } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";

function CreateTournamentModal({ onClose, onTournamentCreate }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("League");
  const [legs, setLegs] = useState(1);
  const [koStartStage, setKoStartStage] = useState(8);
  const [participants, setParticipants] = useState([]);
  const [currentParticipant, setCurrentParticipant] = useState("");
  const [numGroups, setNumGroups] = useState(4);

  const handleAddParticipant = () => {
    const trimmed = String(currentParticipant || "").trim();
    if (!trimmed) return;
    if (participants.includes(trimmed)) {
      setCurrentParticipant("");
      return;
    }
    setParticipants((prev) => [...prev, trimmed]);
    setCurrentParticipant("");
  };

  const handleRemoveParticipant = (name) => {
    setParticipants((p) => p.filter((x) => x !== name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // validate basic constraints
    if (!name.trim()) {
      alert("Tournament name required.");
      return;
    }
    if (participants.length < 2) {
      alert("Add at least 2 participants.");
      return;
    }
    // If League + Knockout ensure numGroups is sensible
    const ng = type === "League + Knockout" ? Number(numGroups) || null : null;
    onTournamentCreate({
      name: name.trim(),
      type,
      legs: Number(legs),
      koStartStage: Number(koStartStage),
      participants,
      numGroups: ng,
    });
    onClose();
  };

  const showKnockoutOptions = type.includes("Knockout");
  const showGroupOptions = type === "League + Knockout";

  // teamsPerGroup safely computed and shown
  const teamsPerGroupDisplay = useMemo(() => {
    if (!showGroupOptions) return null;
    const ng = Number(numGroups) || 0;
    if (ng <= 0) return "N/A";
    const val = participants.length / ng;
    if (!Number.isFinite(val)) return "N/A";
    if (!Number.isInteger(val)) return `${val.toFixed(2)} (not even)`;
    return String(val);
  }, [participants.length, numGroups, showGroupOptions]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/6 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          minHeight: 200,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-white/6">
          <h3 className="text-xl font-bold text-white">
            Create New Tournament
          </h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white bg-gray-800/40 p-2 rounded-lg"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* body - scrollable */}
        <form
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-4"
          style={{ flex: 1 }}
        >
          <div>
            <label className="block text-sm text-gray-300 font-medium mb-2">
              Tournament Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="e.g. Campus Cup 2025"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 font-medium mb-2">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="League">League</option>
                <option value="Knockout">Knockout</option>
                <option value="League + Knockout">League + Knockout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 font-medium mb-2">
                Legs
              </label>
              <select
                id="legs"
                value={legs}
                onChange={(e) => setLegs(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value={1}>1 Leg (Single Match)</option>
                <option value={2}>2 Legs (Home & Away)</option>
              </select>
            </div>
          </div>

          {showGroupOptions && (
            <div>
              <label className="block text-sm text-gray-300 font-medium mb-2">
                Number of Groups
              </label>
              <select
                id="numGroups"
                value={numGroups}
                onChange={(e) => setNumGroups(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value={2}>2 Groups</option>
                <option value={4}>4 Groups</option>
                <option value={8}>8 Groups</option>
                <option value={16}>16 Groups</option>
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Teams per group:{" "}
                <span className="text-white font-medium">
                  {teamsPerGroupDisplay}
                </span>
                {typeof teamsPerGroupDisplay === "string" &&
                  teamsPerGroupDisplay.includes("not even") && (
                    <span className="ml-2 text-yellow-400 text-xs">
                      Participants not evenly divisible by groups
                    </span>
                  )}
              </p>
            </div>
          )}

          {showKnockoutOptions && (
            <div>
              <label className="block text-sm text-gray-300 font-medium mb-2">
                Knockout Starting Stage
              </label>
              <select
                id="koStartStage"
                value={koStartStage}
                onChange={(e) => setKoStartStage(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value={4}>Semi-Finals (4 Teams)</option>
                <option value={8}>Quarter-Finals (8 Teams)</option>
                <option value={16}>Round of 16 (16 Teams)</option>
                <option value={32}>Round of 32 (32 Teams)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 font-medium mb-2">
              Participants
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={currentParticipant}
                onChange={(e) => setCurrentParticipant(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-white focus:outline-none"
                placeholder="Enter team name and press +"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 rounded-r-lg flex items-center justify-center"
                aria-label="Add participant"
              >
                <FaPlus className="text-white" />
              </button>
            </div>

            {/* participants chip list — scrollable when long */}
            <div className="mt-3 max-h-[180px] overflow-y-auto pr-2">
              <div className="flex flex-wrap gap-2">
                {participants.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No participants yet
                  </div>
                )}
                {participants.map((p) => (
                  <span
                    key={p}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 px-3 py-1 rounded-full text-sm text-white border border-white/8"
                  >
                    <span className="truncate max-w-[160px]">{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p)}
                      className="text-indigo-200 hover:text-white ml-1"
                      aria-label={`Remove ${p}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* quick summary */}
          <div className="mt-1 text-xs text-gray-400">
            {showGroupOptions
              ? `Teams per group: ${teamsPerGroupDisplay}`
              : `Total Teams: ${participants.length}`}
          </div>
        </form>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTournamentModal;

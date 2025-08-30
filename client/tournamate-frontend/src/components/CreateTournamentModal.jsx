import { useState, useEffect } from "react";

function CreateTournamentModal({
  onClose,
  onTournamentCreate,
  isEditMode = false,
  initialData = null,
}) {
  const [tournamentName, setTournamentName] = useState("");
  const [type, setType] = useState("League");
  const [participants, setParticipants] = useState("");
  const [legs, setLegs] = useState(1);

  useEffect(() => {
    if (isEditMode && initialData) {
      setTournamentName(initialData.name);
      setType(initialData.type);
      setParticipants(initialData.participants.join("\n"));
      setLegs(initialData.legs || 1);
    }
  }, [isEditMode, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tournamentName.trim()) {
      alert("Please enter a tournament name.");
      return;
    }
    const participantsArray = participants
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p);

    // The key is renamed from 'tournamentName' to 'name' here
    onTournamentCreate({
      name: tournamentName,
      type,
      participants: participantsArray,
      legs,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {isEditMode ? "Edit Tournament" : "Create New Tournament"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="tournamentName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tournament Name
            </label>
            <input
              type="text"
              id="tournamentName"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Summer League 2025"
            />
          </div>

          {/* Type Dropdown */}
          <div className="mb-4">
            <label
              htmlFor="tournamentType"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Type
            </label>
            <select
              id="tournamentType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option>League</option>
              <option>Knockout</option>
              <option>League + Knockout</option>
            </select>
          </div>
          {/* --- Legs Radio Buttons (only show for League) --- */}
          {type.includes("League") && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Legs
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="legs"
                    value={1}
                    checked={legs === 1}
                    onChange={() => setLegs(1)}
                    className="mr-2"
                  />
                  Single
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="legs"
                    value={2}
                    checked={legs === 2}
                    onChange={() => setLegs(2)}
                    className="mr-2"
                  />
                  Double
                </label>
              </div>
            </div>
          )}

          {/* Participants Textarea */}
          <div className="mb-4">
            <label
              htmlFor="participants"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Participants (one per line)
            </label>
            <textarea
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              rows="5"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md"
            >
              {isEditMode ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTournamentModal;

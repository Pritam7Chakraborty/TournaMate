import { useState } from "react";

function CreateTournamentModal({ onClose }) {
  const [tournamentName, setTournamentName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tournamentName.trim()) {
      alert("Please enter a tournament name.");
      return;
    }
    console.log("Creating tournament: ", tournamentName);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Create New Tournament</h3>
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CreateTournamentModal;

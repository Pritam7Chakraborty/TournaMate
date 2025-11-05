const mongoose = require("mongoose");

// --- UPDATED MatchSchema ---
const MatchSchema = new mongoose.Schema({
  round: { type: Number, required: true }, // KO Stage: 8, 4, 2, 1
  matchNumber: { type: Number, index: true }, // A unique ID for this match (e.g., 1, 2, 3...)
  nextMatchNumber: { type: Number, default: null }, // The 'matchNumber' this winner advances to

  homeParticipant: { type: String, default: "TBD" },
  awayParticipant: { type: String, default: "TBD" },

  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },

  homePenaltyScore: { type: Number, default: null },
  awayPenaltyScore: { type: Number, default: null },

  status: { type: String, default: "TBD" }, // TBD, Pending, Completed
  winner: { type: String, default: null },
});

const TournamentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["League", "Knockout", "League + Knockout"],
      default: "League",
    },
    legs: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    koStartStage: {
      type: Number, // 4, 8, 16, 32
      default: 8,
    },
    participants: {
      type: [String],
      default: [],
    },
    schedule: {
      // Will now be used for both League and KO matches
      type: [MatchSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tournament", TournamentSchema);

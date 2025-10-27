const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  homeParticipant: { type: String, required: true },
  awayParticipant: { type: String, required: true },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  status: { type: String, default: "Pending" },
});

const TournamentSchema = new mongoose.Schema(
  {
    // --- THIS IS THE CRITICAL FIELD TO ADD ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // --- (End of addition) ---

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
    participants: {
      type: [String],
      default: [],
    },
    schedule: {
      type: [MatchSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tournament", TournamentSchema);
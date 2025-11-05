const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  matchNumber: { type: Number, index: true },
  nextMatchNumber: { type: Number, default: null },
  homeParticipant: { type: String, default: "TBD" },
  awayParticipant: { type: String, default: "TBD" },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  homePenaltyScore: { type: Number, default: null },
  awayPenaltyScore: { type: Number, default: null },
  status: { type: String, default: "TBD" },
  winner: { type: String, default: null },
  group: { type: String, default: null },
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
      type: Number,
      default: 8,
    },
    participants: {
      type: [String],
      default: [],
    },
    groups: [[String]],
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

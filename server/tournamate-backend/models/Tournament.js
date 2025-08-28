const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema(
  {
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
    participants: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tournament", TournamentSchema);

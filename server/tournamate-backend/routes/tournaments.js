const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const auth = require("../middleware/auth");

// @route   GET /api/tournaments
// @desc    Get all of a user's tournaments
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    // Find tournaments that belong to the logged-in user
    const tournaments = await Tournament.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tournaments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/tournaments
// @desc    Create a new tournament
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { name, type, participants, legs, koStartStage } = req.body;
    const newTournament = new Tournament({
      name,
      type,
      participants,
      legs,
      koStartStage,
      user: req.user.id,
    });

    const tournament = await newTournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/tournaments/:id
// @desc    Get a single tournament
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }
    // Security Check
    if (tournament.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/tournaments/:id
// @desc    Update a tournament's basic info
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    let tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    const { name, type, participants, legs, koStartStage } = req.body;
    const updateFields = { name, type, participants, legs, koStartStage };

    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    res.json(updatedTournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/tournaments/:id
// @desc    Delete a tournament
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    await tournament.deleteOne(); // Use deleteOne()
    res.json({ msg: "Tournament removed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


router.post("/:id/generate-schedule", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });
    if (tournament.type.includes("Knockout"))
      return res
        .status(400)
        .json({ msg: "Use /generate-knockout for this type" });

    let participants = [...tournament.participants];
    if (participants.length % 2 !== 0) participants.push("BYE");
    const schedule = [];
    const numRounds = participants.length - 1;
    const numMatchesPerRound = participants.length / 2;
    for (let round = 0; round < numRounds; round++) {
      for (let match = 0; match < numMatchesPerRound; match++) {
        const home = participants[match];
        const away = participants[participants.length - 1 - match];
        if (home !== "BYE" && away !== "BYE") {
          schedule.push({
            round: round + 1,
            homeParticipant: home,
            awayParticipant: away,
            status: "Pending",
          });
        }
      }
      const last = participants.pop();
      participants.splice(1, 0, last);
    }
    if (tournament.legs === 2) {
      const secondLegSchedule = schedule.map((match) => ({
        ...match,
        round: match.round + numRounds,
        homeParticipant: match.awayParticipant,
        awayParticipant: match.homeParticipant,
        status: "Pending",
      }));
      schedule.push(...secondLegSchedule);
    }
    tournament.schedule = schedule;
    await tournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/generate-knockout", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    const { koStartStage } = tournament;
    let participants = [...tournament.participants];
    const schedule = [];
    while (participants.length < koStartStage) {
      participants.push("BYE");
    }
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }

    let currentRound = koStartStage;
    let currentMatchNumber = 1;
    let nextRoundMatchNumber = koStartStage / 2 + 1;
    let matchesInThisRound = koStartStage / 2;

    while (currentRound >= 1) {
      for (let i = 0; i < matchesInThisRound; i++) {
        const match = {
          round: currentRound,
          matchNumber: currentMatchNumber,
          nextMatchNumber: currentRound === 1 ? null : nextRoundMatchNumber,
          homeParticipant: "TBD",
          awayParticipant: "TBD",
          status: "TBD",
        };
        if (currentRound === koStartStage) {
          match.homeParticipant = participants[i * 2];
          match.awayParticipant = participants[i * 2 + 1];
          if (match.homeParticipant === "BYE") {
            match.status = "Completed";
            match.winner = match.awayParticipant;
          } else if (match.awayParticipant === "BYE") {
            match.status = "Completed";
            match.winner = match.homeParticipant;
          } else {
            match.status = "Pending";
          }
        }
        schedule.push(match);
        currentMatchNumber++;
        if (i % 2 === 1) {
          nextRoundMatchNumber++;
        }
      }
      currentRound /= 2;
      matchesInThisRound /= 2;
      nextRoundMatchNumber = currentMatchNumber + matchesInThisRound;
    }

    const byeWinners = schedule.filter(
      (m) => m.round === koStartStage && m.winner
    );
    for (const match of byeWinners) {
      const nextMatch = schedule.find(
        (m) => m.matchNumber === match.nextMatchNumber
      );
      if (nextMatch.homeParticipant === "TBD") {
        nextMatch.homeParticipant = match.winner;
      } else {
        nextMatch.awayParticipant = match.winner;
      }
      if (
        nextMatch.homeParticipant !== "TBD" &&
        nextMatch.awayParticipant !== "TBD"
      ) {
        nextMatch.status = "Pending";
      }
    }
    tournament.schedule = schedule;
    await tournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/:tournamentId/matches/:matchId", auth, async (req, res) => {
  try {
    // 1. Get all data from body
    const { homeScore, awayScore, homePenaltyScore, awayPenaltyScore } =
      req.body;

    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    const match = tournament.schedule.id(req.params.matchId);
    if (!match) return res.status(404).json({ msg: "Match not found" });

    // 2. Update match basics
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.status = "Completed";
    match.homePenaltyScore = null; // Reset penalties
    match.awayPenaltyScore = null;

    if (tournament.type.includes("League")) {
      await tournament.save();
      return res.json(tournament);
    }

    // --- 3. UPDATED KNOCKOUT LOGIC ---
    if (tournament.type.includes("Knockout")) {
      let winner = null;

      if (homeScore > awayScore) {
        winner = match.homeParticipant;
      } else if (awayScore > homeScore) {
        winner = match.awayParticipant;
      } else {
        // --- DRAW: Check for penalties ---
        if (homePenaltyScore === null || awayPenaltyScore === null) {
          match.status = "Pending (Penalties)"; // Or just block it
          return res
            .status(400)
            .json({
              msg: "Scores are level. Please provide penalty shootout results.",
            });
        }

        // Save penalty scores
        match.homePenaltyScore = homePenaltyScore;
        match.awayPenaltyScore = awayPenaltyScore;

        if (homePenaltyScore > awayPenaltyScore) {
          winner = match.homeParticipant;
        } else if (awayPenaltyScore > homePenaltyScore) {
          winner = match.awayParticipant;
        } else {
          // Penalties can't be a draw
          return res
            .status(400)
            .json({ msg: "Penalty scores cannot be a draw." });
        }
      }

      match.winner = winner;

      // 4. Advance the winner (same logic as before)
      if (match.nextMatchNumber) {
        const nextMatch = tournament.schedule.find(
          (m) => m.matchNumber === match.nextMatchNumber
        );
        if (nextMatch) {
          if (match.matchNumber % 2 === 1) {
            nextMatch.homeParticipant = winner;
          } else {
            nextMatch.awayParticipant = winner;
          }
          if (
            nextMatch.homeParticipant !== "TBD" &&
            nextMatch.awayParticipant !== "TBD"
          ) {
            nextMatch.status = "Pending";
          }
        }
      }

      await tournament.save();
      return res.json(tournament);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/reset-schedule", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    tournament.schedule = [];
    await tournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

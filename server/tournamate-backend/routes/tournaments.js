// routes/tournaments.js
const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const auth = require('../middleware/auth'); // <-- ADD THIS

// @route   GET /api/tournaments
// @desc    Get all of a user's tournaments
// @access  Private
router.get("/", auth, async (req, res) => { // <-- ADD auth
  try {
    // Find tournaments that belong to the logged-in user
    const tournaments = await Tournament.find({ user: req.user.id }).sort({ createdAt: -1 }); // <-- UPDATE THIS
    res.json(tournaments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/tournaments
// @desc    Create a new tournament
// @access  Private
router.post("/", auth, async (req, res) => { // <-- ADD auth
  try {
    const { name, type, participants, legs } = req.body;
    const newTournament = new Tournament({
      name,
      type,
      participants,
      legs,
      user: req.user.id, // <-- ADD THE USER ID
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
router.get("/:id", auth, async (req, res) => { // <-- ADD auth
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }

    // --- ADD SECURITY CHECK ---
    if (tournament.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    // ---

    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/tournaments/:id
// @desc    Update a tournament
// @access  Private
router.put("/:id", auth, async (req, res) => { // <-- ADD auth
  try {
    let tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }

    // --- ADD SECURITY CHECK ---
    if (tournament.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    // ---

    // Now, apply the updates
    const { name, type, participants, legs } = req.body;
    const updateFields = { name, type, participants, legs };
    
    // We use findByIdAndUpdate after verifying ownership
    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json(updatedTournament); // Send the updated tournament back
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/tournaments/:id/generate-schedule
// @desc    Generate a schedule for a tournament
// @access  Private
router.post("/:id/generate-schedule", auth, async (req, res) => { // <-- ADD auth
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });

    // --- ADD SECURITY CHECK ---
    if (tournament.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    // ---

    if (tournament.participants.length < 2) {
      return res.status(400).json({ msg: "Not enough participants." });
    }

    // ... (rest of your schedule logic is perfect) ...
    let participants = [...tournament.participants];
    if (participants.length % 2 !== 0) {
      participants.push("BYE");
    }
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

// @route   PUT /api/tournaments/:tournamentId/matches/:matchId
// @desc    Update a match score
// @access  Private
router.put("/:tournamentId/matches/:matchId", auth, async (req, res) => { // <-- ADD auth
  try {
    const { homeScore, awayScore } = req.body;
    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }

    // --- ADD SECURITY CHECK ---
    if (tournament.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    // ---

    const match = tournament.schedule.id(req.params.matchId);
    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.status = "Completed";

    await tournament.save();
    res.json(tournament);
  } catch (error) {
    console.error(error.message); // <-- Note: your original said err.message, but catch(error)
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/tournaments/:id
// @desc    Delete a tournament
// @access  Private
router.delete("/:id", auth, async (req, res) => { // <-- ADD auth
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }

    // --- ADD SECURITY CHECK ---
    if (tournament.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    // ---

    await tournament.deleteOne();

    res.json({ msg: "Tournament removed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/tournaments/:id/reset-schedule
// @desc    Reset a tournament's schedule
// @access  Private
router.post('/:id/reset-schedule', auth, async (req, res) => { // <-- ADD auth
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ msg: 'Tournament not found' });

    // --- ADD SECURITY CHECK ---
    if (tournament.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    // ---

    tournament.schedule = []; // Clear the schedule array
    await tournament.save();
    res.json(tournament); // Send back the updated tournament

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
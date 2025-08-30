const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");

router.get("/", async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, type, participants } = req.body;
    const newTournament = new Tournament({
      name,
      type,
      participants,
    });

    const tournament = await newTournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }

    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, type, participants } = req.body;
    const updateFields = { name, type, participants };

    // Find the tournament by its ID and update it
    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true } // Options
    );

    if (!updatedTournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }

    res.json(updatedTournament); // Send the updated tournament back
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/generate-schedule", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.participants.length < 2) {
      return res.status(400).json({ msg: "Not enough participants." });
    }

    let participants = [...tournament.participants];
    // If odd number of participants, add a "BYE"
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
      // Rotate participants array for next round, keeping first participant fixed
      const last = participants.pop();
      participants.splice(1, 0, last);
    }

    // If double-legged, create reverse fixtures for the second half
    if (tournament.legs === 2) {
      const secondLegSchedule = schedule.map((match) => ({
        ...match,
        round: match.round + numRounds,
        homeParticipant: match.awayParticipant, // Swap teams
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

router.put("/:tournamentId/matches/:matchId", async (req, res) => {
  try {
    const { homeScore, awayScore } = req.body;
    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }
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
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }

    await tournament.deleteOne();

    res.json({ msg: "Tournament removed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post('/:id/reset-schedule', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ msg: 'Tournament not found' });

    tournament.schedule = []; // Clear the schedule array

    await tournament.save();
    res.json(tournament); // Send back the updated tournament

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

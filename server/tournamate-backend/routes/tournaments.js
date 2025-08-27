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
    const newTournament = new Tournament({
      name: req.body.name,
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

router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;

    // Find the tournament by its ID and update it
    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { name: name },
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

module.exports = router;

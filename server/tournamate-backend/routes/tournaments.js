// routes/tournaments.js
const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const auth = require("../middleware/auth");

// Generate knockout bracket (fixed and deterministic linking)
const generateKnockoutBracket = (participants, koStartStage) => {
  const schedule = [];
  let participantsCopy = [...participants];

  // pad to koStartStage with BYE
  while (participantsCopy.length < koStartStage) {
    participantsCopy.push("BYE");
  }

  // shuffle
  for (let i = participantsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participantsCopy[i], participantsCopy[j]] = [
      participantsCopy[j],
      participantsCopy[i],
    ];
  }

  // build rounds and matches
  const rounds = [];
  let roundSize = koStartStage;
  let matchNumberCounter = 1;

  while (roundSize >= 2) {
    const matchesInRound = roundSize / 2;
    const matches = [];
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        round: roundSize,
        matchNumber: matchNumberCounter++,
        nextMatchNumber: null,
        homeParticipant: "TBD",
        awayParticipant: "TBD",
        status: "TBD",
        homeScore: null,
        awayScore: null,
        homePenaltyScore: null,
        awayPenaltyScore: null,
        winner: null,
      });
    }
    rounds.push(matches);
    roundSize = roundSize / 2;
  }

  // link to next matches
  for (let r = 0; r < rounds.length - 1; r++) {
    const current = rounds[r];
    const next = rounds[r + 1];
    for (let i = 0; i < current.length; i++) {
      const nextIdx = Math.floor(i / 2);
      current[i].nextMatchNumber = next[nextIdx].matchNumber;
    }
  }

  // assign participants to first round
  const firstRound = rounds[0] || [];
  for (let i = 0; i < firstRound.length; i++) {
    const match = firstRound[i];
    match.homeParticipant = participantsCopy[i * 2];
    match.awayParticipant = participantsCopy[i * 2 + 1];

    // auto-complete BYE matches
    if (match.homeParticipant === "BYE") {
      match.status = "Completed";
      match.winner = match.awayParticipant;
      match.homeScore = 0;
      match.awayScore = 3;
    } else if (match.awayParticipant === "BYE") {
      match.status = "Completed";
      match.winner = match.homeParticipant;
      match.homeScore = 3;
      match.awayScore = 0;
    } else {
      match.status = "Pending";
    }
  }

  // flatten rounds into schedule in round order
  for (const r of rounds) {
    schedule.push(...r);
  }

  // propagate BYE winners forward so later rounds get filled correctly
  let winnersToAdvance = schedule.filter(
    (m) => m.round === koStartStage && m.winner
  );
  while (winnersToAdvance.length > 0) {
    const nextRoundWinners = [];
    for (const m of winnersToAdvance) {
      if (!m.nextMatchNumber) continue;
      const nextMatch = schedule.find(
        (x) => x.matchNumber === m.nextMatchNumber
      );
      if (!nextMatch) continue;

      if (m.matchNumber % 2 === 1) nextMatch.homeParticipant = m.winner;
      else nextMatch.awayParticipant = m.winner;

      if (
        nextMatch.homeParticipant !== "TBD" &&
        nextMatch.awayParticipant !== "TBD"
      ) {
        if (nextMatch.homeParticipant === "BYE") {
          nextMatch.status = "Completed";
          nextMatch.winner = nextMatch.awayParticipant;
          nextMatch.homeScore = 0;
          nextMatch.awayScore = 3;
          nextRoundWinners.push(nextMatch);
        } else if (nextMatch.awayParticipant === "BYE") {
          nextMatch.status = "Completed";
          nextMatch.winner = nextMatch.homeParticipant;
          nextMatch.homeScore = 3;
          nextMatch.awayScore = 0;
          nextRoundWinners.push(nextMatch);
        } else {
          nextMatch.status = "Pending";
        }
      }
    }
    winnersToAdvance = nextRoundWinners;
  }

  return schedule;
};

const calculateStandings = (participants, schedule) => {
  const stats = participants.map((p) => ({
    name: p,
    MP: 0,
    W: 0,
    D: 0,
    L: 0,
    GF: 0,
    GA: 0,
    GD: 0,
    Pts: 0,
  }));

  const completedMatches = schedule.filter((m) => m.status === "Completed");

  for (const match of completedMatches) {
    const homeTeam = stats.find((s) => s.name === match.homeParticipant);
    const awayTeam = stats.find((s) => s.name === match.awayParticipant);
    if (!homeTeam || !awayTeam) continue;

    homeTeam.MP++;
    awayTeam.MP++;
    homeTeam.GF += match.homeScore || 0;
    homeTeam.GA += match.awayScore || 0;
    awayTeam.GF += match.awayScore || 0;
    awayTeam.GA += match.homeScore || 0;
    homeTeam.GD = homeTeam.GF - homeTeam.GA;
    awayTeam.GD = awayTeam.GF - awayTeam.GA;

    if (match.homeScore > match.awayScore) {
      homeTeam.W++;
      awayTeam.L++;
      homeTeam.Pts += 3;
    } else if (match.homeScore < match.awayScore) {
      awayTeam.W++;
      homeTeam.L++;
      awayTeam.Pts += 3;
    } else {
      homeTeam.D++;
      awayTeam.D++;
      homeTeam.Pts += 1;
      awayTeam.Pts += 1;
    }
  }

  const getH2HStats = (teams, matches) => {
    const h2hStats = {};
    teams.forEach((t) => {
      h2hStats[t.name] = { name: t.name, Pts: 0, GD: 0, GF: 0, GA: 0 };
    });
    const teamNames = teams.map((t) => t.name);

    for (const match of matches) {
      if (
        teamNames.includes(match.homeParticipant) &&
        teamNames.includes(match.awayParticipant)
      ) {
        const home = h2hStats[match.homeParticipant];
        const away = h2hStats[match.awayParticipant];
        home.GF += match.homeScore || 0;
        home.GA += match.awayScore || 0;
        away.GF += match.awayScore || 0;
        away.GA += match.homeScore || 0;
        if (match.homeScore > match.awayScore) home.Pts += 3;
        else if (match.homeScore < match.awayScore) away.Pts += 3;
        else {
          home.Pts += 1;
          away.Pts += 1;
        }
      }
    }
    Object.values(h2hStats).forEach((s) => {
      s.GD = s.GF - s.GA;
    });
    return h2hStats;
  };

  stats.sort((a, b) => {
    if (a.Pts !== b.Pts) return b.Pts - a.Pts;
    const tiedTeams = stats.filter((team) => team.Pts === a.Pts);
    if (tiedTeams.length > 1) {
      const h2hStats = getH2HStats(tiedTeams, completedMatches);
      const a_h2h = h2hStats[a.name];
      const b_h2h = h2hStats[b.name];
      if (a_h2h.Pts !== b_h2h.Pts) return b_h2h.Pts - a_h2h.Pts;
      if (a_h2h.GD !== b_h2h.GD) return b_h2h.GD - a_h2h.GD;
      if (a_h2h.GF !== b_h2h.GF) return b_h2h.GF - a_h2h.GF;
    }
    if (a.GD !== b.GD) return b.GD - a.GD;
    if (a.GF !== b.GF) return b.GF - a.GF;
    return a.name.localeCompare(b.name);
  });

  return stats;
};

router.get("/", auth, async (req, res) => {
  try {
    const tournaments = await Tournament.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tournaments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, type, participants, legs, koStartStage, numGroups } =
      req.body;
    const newTournament = new Tournament({
      name,
      type,
      participants,
      legs,
      koStartStage,
      user: req.user.id,
      groups: [],
      numGroups: numGroups || 0, // persist numGroups if provided
    });

    if (
      type === "League + Knockout" &&
      numGroups > 0 &&
      participants &&
      participants.length > 0
    ) {
      if (participants.length % numGroups !== 0) {
        return res.status(400).json({
          msg: "Number of participants is not evenly divisible by the number of groups.",
        });
      }
      let shuffledParticipants = [...participants];
      for (let i = shuffledParticipants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledParticipants[i], shuffledParticipants[j]] = [
          shuffledParticipants[j],
          shuffledParticipants[i],
        ];
      }
      const teamsPerGroup = participants.length / numGroups;
      const newGroups = [];
      for (let i = 0; i < numGroups; i++) {
        newGroups.push(
          shuffledParticipants.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup)
        );
      }
      newTournament.groups = newGroups;
    }

    const tournament = await newTournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }
    if (tournament.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    let tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    const { name, type, participants, legs, koStartStage, numGroups } =
      req.body;
    const updateFields = { name, type, participants, legs, koStartStage };
    if (typeof numGroups !== "undefined") updateFields.numGroups = numGroups;

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

router.delete("/:id", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    await tournament.deleteOne();
    res.json({ msg: "Tournament removed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST /:id/generate-schedule
 * - For League + Knockout: expects groups to exist. If groups missing and req.body.numGroups provided,
 *   create groups on the fly and persist them, then generate league schedule.
 */
router.post("/:id/generate-schedule", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    if (tournament.type === "Knockout") {
      return res
        .status(400)
        .json({ msg: "Use /generate-knockout for knockout tournaments" });
    }

    const schedule = [];
    const { legs, type, groups } = tournament;

    // If league+knockout and no groups exist, try to create groups from req.body.numGroups or tournament.numGroups
    if (type === "League + Knockout" && (!groups || groups.length === 0)) {
      const requestedNumGroups =
        req.body.numGroups || tournament.numGroups || 0;
      if (!requestedNumGroups || requestedNumGroups < 1) {
        return res.status(400).json({
          msg: "No groups found. Provide numGroups to create groups first.",
        });
      }

      if (tournament.participants.length % requestedNumGroups !== 0) {
        return res.status(400).json({
          msg: "Number of participants is not evenly divisible by the provided numGroups.",
        });
      }

      // Create groups and persist them
      let shuffledParticipants = [...tournament.participants];
      for (let i = shuffledParticipants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledParticipants[i], shuffledParticipants[j]] = [
          shuffledParticipants[j],
          shuffledParticipants[i],
        ];
      }
      const teamsPerGroup = tournament.participants.length / requestedNumGroups;
      const newGroups = [];
      for (let i = 0; i < requestedNumGroups; i++) {
        newGroups.push(
          shuffledParticipants.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup)
        );
      }
      tournament.groups = newGroups;
      tournament.numGroups = requestedNumGroups;
      await tournament.save();
      console.log(
        `[generate-schedule] created ${requestedNumGroups} groups on the fly for tournament ${tournament._id}`
      );
    }

    // Re-fetch groups after any potential creation
    const effectiveGroups = tournament.groups || [];

    if (type === "League + Knockout") {
      if (!effectiveGroups || effectiveGroups.length === 0) {
        return res
          .status(400)
          .json({ msg: "No groups found. Cannot generate league schedule." });
      }

      const groupNames = Array.from(
        { length: effectiveGroups.length },
        (_, i) => `Group ${String.fromCharCode(65 + i)}`
      );

      for (let i = 0; i < effectiveGroups.length; i++) {
        const groupParticipants = [...effectiveGroups[i]];
        const groupName = groupNames[i];

        if (groupParticipants.length % 2 !== 0) groupParticipants.push("BYE");

        const numRounds = groupParticipants.length - 1;

        for (let round = 0; round < numRounds; round++) {
          for (let match = 0; match < groupParticipants.length / 2; match++) {
            const home = groupParticipants[match];
            const away =
              groupParticipants[groupParticipants.length - 1 - match];

            if (home !== "BYE" && away !== "BYE") {
              schedule.push({
                round: round + 1,
                homeParticipant: home,
                awayParticipant: away,
                status: "Pending",
                group: groupName,
                homeScore: null,
                awayScore: null,
                homePenaltyScore: null,
                awayPenaltyScore: null,
                winner: null,
              });
            }
          }
          const last = groupParticipants.pop();
          groupParticipants.splice(1, 0, last);
        }

        if (legs === 2) {
          const firstLegMatches = schedule.filter((m) => m.group === groupName);
          const secondLegMatches = firstLegMatches.map((match) => ({
            round: match.round + numRounds,
            homeParticipant: match.awayParticipant,
            awayParticipant: match.homeParticipant,
            status: "Pending",
            group: groupName,
            homeScore: null,
            awayScore: null,
            homePenaltyScore: null,
            awayPenaltyScore: null,
            winner: null,
          }));
          schedule.push(...secondLegMatches);
        }
      }
    } else {
      // pure league (no groups)
      let participants = [...tournament.participants];
      if (participants.length % 2 !== 0) participants.push("BYE");

      const numRounds = participants.length - 1;
      for (let round = 0; round < numRounds; round++) {
        for (let match = 0; match < participants.length / 2; match++) {
          const home = participants[match];
          const away = participants[participants.length - 1 - match];
          if (home !== "BYE" && away !== "BYE") {
            schedule.push({
              round: round + 1,
              homeParticipant: home,
              awayParticipant: away,
              status: "Pending",
              group: null,
              homeScore: null,
              awayScore: null,
              homePenaltyScore: null,
              awayPenaltyScore: null,
              winner: null,
            });
          }
        }
        const last = participants.pop();
        participants.splice(1, 0, last);
      }

      if (legs === 2) {
        const firstLegMatches = [...schedule];
        const secondLegMatches = firstLegMatches.map((match) => ({
          round: match.round + numRounds,
          homeParticipant: match.awayParticipant,
          awayParticipant: match.homeParticipant,
          status: "Pending",
          group: null,
          homeScore: null,
          awayScore: null,
          homePenaltyScore: null,
          awayPenaltyScore: null,
          winner: null,
        }));
        schedule.push(...secondLegMatches);
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

router.post("/:id/generate-knockout", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    const { koStartStage } = tournament;
    let participants = [...tournament.participants];

    const schedule = generateKnockoutBracket(participants, koStartStage);

    tournament.schedule = schedule;
    await tournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/advance-winners", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });
    if (tournament.type !== "League + Knockout")
      return res.status(400).json({ msg: "Not a group tournament" });

    const allComplete = tournament.schedule.every(
      (m) =>
        m.status === "Completed" ||
        m.homeParticipant === "BYE" ||
        m.awayParticipant === "BYE"
    );
    if (!allComplete) {
      return res
        .status(400)
        .json({ msg: "All group matches must be completed to advance." });
    }

    const advancingTeams = [];
    const teamsToAdvancePerGroup = 2;

    for (const groupParticipants of tournament.groups) {
      const groupName = tournament.schedule.find(
        (m) =>
          groupParticipants.includes(m.homeParticipant) ||
          groupParticipants.includes(m.awayParticipant)
      )?.group;
      if (!groupName) continue;

      const groupSchedule = tournament.schedule.filter(
        (m) => m.group === groupName
      );
      const standings = calculateStandings(groupParticipants, groupSchedule);

      const groupWinners = standings
        .slice(0, teamsToAdvancePerGroup)
        .map((team) => team.name);
      advancingTeams.push(...groupWinners);
    }

    const newKoStartStage = advancingTeams.length;
    if (
      newKoStartStage < 2 ||
      (newKoStartStage & (newKoStartStage - 1)) !== 0
    ) {
      return res.status(400).json({
        msg: `Invalid number of advancing teams (${newKoStartStage}). Must be a power of 2.`,
      });
    }

    const newSchedule = generateKnockoutBracket(
      advancingTeams,
      newKoStartStage
    );

    tournament.schedule = newSchedule;
    tournament.koStartStage = newKoStartStage;
    tournament.groups = [];

    await tournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/:tournamentId/matches/:matchId", auth, async (req, res) => {
  try {
    const { homeScore, awayScore, homePenaltyScore, awayPenaltyScore } =
      req.body;

    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    // find the match (mongoose subdoc)
    const match = tournament.schedule.id(req.params.matchId);
    if (!match) return res.status(404).json({ msg: "Match not found" });

    // Always set scores and mark Completed initially (we'll override for penalties if needed)
    match.homeScore = homeScore;
    match.awayScore = awayScore;

    // Determine if this is a group/league match (has a group) or knockout (no group)
    const isGroupMatch = !!match.group; // truthy if group exists
    const isKnockoutMatch = !isGroupMatch;

    // LEAGUE OR GROUP MATCH: allow draws, no penalties
    if (isGroupMatch) {
      match.status = "Completed";
      match.homePenaltyScore = null;
      match.awayPenaltyScore = null;
      // determine winner or draw
      if (homeScore > awayScore) match.winner = match.homeParticipant;
      else if (awayScore > homeScore) match.winner = match.awayParticipant;
      else match.winner = null; // draw in league stage
      await tournament.save();
      return res.json(tournament);
    }

    // KNOCKOUT MATCH: handle penalties on draws
    // At this point, we know it's a knockout match (no group)
    // If not a draw -> determine winner and advance
    if (homeScore > awayScore) {
      match.winner = match.homeParticipant;
      match.status = "Completed";
      match.homePenaltyScore = null;
      match.awayPenaltyScore = null;
    } else if (awayScore > homeScore) {
      match.winner = match.awayParticipant;
      match.status = "Completed";
      match.homePenaltyScore = null;
      match.awayPenaltyScore = null;
    } else {
      // draw -> require penalties
      const hpScore =
        homePenaltyScore !== null && homePenaltyScore !== undefined
          ? Number(homePenaltyScore)
          : null;
      const apScore =
        awayPenaltyScore !== null && awayPenaltyScore !== undefined
          ? Number(awayPenaltyScore)
          : null;

      if (hpScore === null || apScore === null) {
        match.status = "Pending (Penalties)";
        // save the partially updated match (so UI can reflect state)
        await tournament.save();
        return res.status(400).json({
          msg: "Scores are level. Please provide penalty shootout results.",
          tournament,
        });
      }

      match.homePenaltyScore = hpScore;
      match.awayPenaltyScore = apScore;

      if (hpScore === apScore) {
        return res
          .status(400)
          .json({ msg: "Penalty scores cannot be a draw." });
      }

      match.winner =
        hpScore > apScore ? match.homeParticipant : match.awayParticipant;
      match.status = "Completed";
    }

    // propagate winner to next match if needed
    if (match.nextMatchNumber) {
      let nextMatch = tournament.schedule.find(
        (m) => m.matchNumber === match.nextMatchNumber
      );
      if (nextMatch) {
        if (match.matchNumber % 2 === 1)
          nextMatch.homeParticipant = match.winner;
        else nextMatch.awayParticipant = match.winner;

        if (
          nextMatch.homeParticipant !== "TBD" &&
          nextMatch.awayParticipant !== "TBD"
        ) {
          if (nextMatch.homeParticipant === "BYE") {
            nextMatch.status = "Completed";
            nextMatch.winner = nextMatch.awayParticipant;
            nextMatch.homeScore = 0;
            nextMatch.awayScore = 3;
          } else if (nextMatch.awayParticipant === "BYE") {
            nextMatch.status = "Completed";
            nextMatch.winner = nextMatch.homeParticipant;
            nextMatch.homeScore = 3;
            nextMatch.awayScore = 0;
          } else {
            nextMatch.status = "Pending";
          }
        }

        // Propagate chain of auto-filled winners (BYE chains or already decided matches)
        if (nextMatch.winner) {
          let winnerMatch = nextMatch;
          while (winnerMatch && winnerMatch.nextMatchNumber) {
            const followingMatch = tournament.schedule.find(
              (m) => m.matchNumber === winnerMatch.nextMatchNumber
            );
            if (!followingMatch) break;

            if (winnerMatch.matchNumber % 2 === 1) {
              followingMatch.homeParticipant = winnerMatch.winner;
            } else {
              followingMatch.awayParticipant = winnerMatch.winner;
            }

            if (
              followingMatch.homeParticipant !== "TBD" &&
              followingMatch.awayParticipant !== "TBD"
            ) {
              if (followingMatch.homeParticipant === "BYE") {
                followingMatch.status = "Completed";
                followingMatch.winner = followingMatch.awayParticipant;
                followingMatch.homeScore = 0;
                followingMatch.awayScore = 3;
              } else if (followingMatch.awayParticipant === "BYE") {
                followingMatch.status = "Completed";
                followingMatch.winner = followingMatch.homeParticipant;
                followingMatch.homeScore = 3;
                followingMatch.awayScore = 0;
              } else {
                followingMatch.status = "Pending";
              }
            }
            winnerMatch = followingMatch.winner ? followingMatch : null;
          }
        }
      }
    }

    await tournament.save();
    return res.json(tournament);
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
    tournament.groups = [];
    await tournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

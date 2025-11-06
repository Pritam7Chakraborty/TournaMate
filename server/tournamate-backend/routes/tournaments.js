// routes/tournaments.js
const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const auth = require("../middleware/auth");

/**
 * Helper: Generate a deterministic-ish knockout structure and handle BYEs propagation.
 * Returns flattened schedule array (matchNumber unique across whole schedule).
 */
const generateKnockoutBracket = (participants, koStartStage) => {
  const schedule = [];
  let participantsCopy = [...participants];

  while (participantsCopy.length < koStartStage) {
    participantsCopy.push("BYE");
  }

  // shuffle participants (random each generation)
  for (let i = participantsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participantsCopy[i], participantsCopy[j]] = [
      participantsCopy[j],
      participantsCopy[i],
    ];
  }

  // build rounds (round stores matches for that roundSize)
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
        status: "Pending", // normalized
        homeScore: null,
        awayScore: null,
        homePenaltyScore: null,
        awayPenaltyScore: null,
        winner: null,
      });
    }
    rounds.push(matches);
    roundSize = Math.floor(roundSize / 2);
  }

  // link current -> next round matches
  for (let r = 0; r < rounds.length - 1; r++) {
    const current = rounds[r];
    const next = rounds[r + 1];
    for (let i = 0; i < current.length; i++) {
      const nextIdx = Math.floor(i / 2);
      current[i].nextMatchNumber = next[nextIdx].matchNumber;
    }
  }

  // assign participants into first round
  const firstRound = rounds[0] || [];
  for (let i = 0; i < firstRound.length; i++) {
    const match = firstRound[i];
    match.homeParticipant = participantsCopy[i * 2] ?? "TBD";
    match.awayParticipant = participantsCopy[i * 2 + 1] ?? "TBD";

    // auto-complete BYE matches
    if (match.homeParticipant === "BYE" && match.awayParticipant !== "BYE") {
      match.status = "Completed";
      match.winner = match.awayParticipant;
      match.homeScore = 0;
      match.awayScore = 3;
    } else if (match.awayParticipant === "BYE" && match.homeParticipant !== "BYE") {
      match.status = "Completed";
      match.winner = match.homeParticipant;
      match.homeScore = 3;
      match.awayScore = 0;
    } else if (match.homeParticipant === "BYE" && match.awayParticipant === "BYE") {
      match.status = "Completed";
      match.winner = "BYE";
      match.homeScore = 0;
      match.awayScore = 0;
    } else {
      match.status = "Pending";
    }
  }

  // flatten rounds
  for (const r of rounds) schedule.push(...r);

  // propagate BYE winners forward (so next rounds get filled)
  let winnersToAdvance = schedule.filter(
    (m) => m.round === koStartStage && m.winner && m.winner !== "BYE"
  );
  while (winnersToAdvance.length > 0) {
    const nextRoundWinners = [];
    for (const m of winnersToAdvance) {
      if (!m.nextMatchNumber) continue;
      const nextMatch = schedule.find((x) => x.matchNumber === m.nextMatchNumber);
      if (!nextMatch) continue;

      if (m.matchNumber % 2 === 1) nextMatch.homeParticipant = m.winner;
      else nextMatch.awayParticipant = m.winner;

      if (
        nextMatch.homeParticipant !== "TBD" &&
        nextMatch.awayParticipant !== "TBD"
      ) {
        if (nextMatch.homeParticipant === "BYE" && nextMatch.awayParticipant !== "BYE") {
          nextMatch.status = "Completed";
          nextMatch.winner = nextMatch.awayParticipant;
          nextMatch.homeScore = 0;
          nextMatch.awayScore = 3;
          nextRoundWinners.push(nextMatch);
        } else if (nextMatch.awayParticipant === "BYE" && nextMatch.homeParticipant !== "BYE") {
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

/**
 * calculateStandings - robust standings calculator with:
 *  - safe numeric handling
 *  - head-to-head tie-breaks (Pts -> H2H Pts -> H2H GD -> H2H GF -> GD -> GF -> name)
 *  - remainingMatches map & remainingMaxPoints
 *  - conservative clinch detection & elimination flags
 *
 * Returns: {
 *   standings: [ {name, MP, W, D, L, GF, GA, GD, Pts }, ... ],
 *   remainingMap: { teamName: remainingMatchesCount, ... },
 *   remainingMaxPoints: { teamName: remainingMaxPoints, ... },
 *   clinched: { teamName: boolean, ... },
 *   eliminated: { teamName: boolean, ... }
 * }
 */
const calculateStandings = (participants, schedule) => {
  // guard
  participants = Array.isArray(participants) ? participants.slice() : [];
  schedule = Array.isArray(schedule) ? schedule : [];

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

  // completed matches only
  const completedMatches = schedule.filter((m) => m.status === "Completed");

  // accumulate safe numbers
  for (const match of completedMatches) {
    const homeTeam = stats.find((s) => s.name === match.homeParticipant);
    const awayTeam = stats.find((s) => s.name === match.awayParticipant);
    if (!homeTeam || !awayTeam) continue;

    homeTeam.MP++;
    awayTeam.MP++;

    const hs = Number(match.homeScore || 0);
    const as = Number(match.awayScore || 0);

    homeTeam.GF += hs;
    homeTeam.GA += as;
    awayTeam.GF += as;
    awayTeam.GA += hs;

    if (hs > as) {
      homeTeam.W++;
      awayTeam.L++;
      homeTeam.Pts += 3;
    } else if (as > hs) {
      awayTeam.W++;
      homeTeam.L++;
      awayTeam.Pts += 3;
    } else {
      homeTeam.D++;
      awayTeam.D++;
      homeTeam.Pts += 1;
      awayTeam.Pts += 1;
    }

    homeTeam.GD = homeTeam.GF - homeTeam.GA;
    awayTeam.GD = awayTeam.GF - awayTeam.GA;
  }

  // helper: head-to-head stats among tied teams
  const getH2HStats = (teams, matches) => {
    const h2hStats = {};
    teams.forEach((t) => {
      h2hStats[t.name] = { name: t.name, Pts: 0, GF: 0, GA: 0, GD: 0 };
    });
    const teamNames = teams.map((t) => t.name);

    for (const match of matches) {
      if (
        teamNames.includes(match.homeParticipant) &&
        teamNames.includes(match.awayParticipant)
      ) {
        const home = h2hStats[match.homeParticipant];
        const away = h2hStats[match.awayParticipant];
        const hs = Number(match.homeScore || 0);
        const as = Number(match.awayScore || 0);
        home.GF += hs;
        home.GA += as;
        away.GF += as;
        away.GA += hs;
        if (hs > as) home.Pts += 3;
        else if (as > hs) away.Pts += 3;
        else {
          home.Pts += 1;
          away.Pts += 1;
        }
      }
    }
    Object.values(h2hStats).forEach((s) => (s.GD = s.GF - s.GA));
    return h2hStats;
  };

  // initial sort by points (will refine ties later)
  stats.sort((a, b) => {
    if (a.Pts !== b.Pts) return b.Pts - a.Pts;
    return a.name.localeCompare(b.name);
  });

  // resolve tied blocks
  const resolved = [];
  for (let i = 0; i < stats.length; ) {
    const block = [stats[i]];
    let j = i + 1;
    while (j < stats.length && stats[j].Pts === stats[i].Pts) {
      block.push(stats[j]);
      j++;
    }

    if (block.length > 1) {
      const h2h = getH2HStats(block, completedMatches);
      block.forEach((t) => {
        const h = h2h[t.name] || { Pts: 0, GD: 0, GF: 0 };
        t._h2hPts = h.Pts;
        t._h2hGD = h.GD;
        t._h2hGF = h.GF;
      });
      block.sort((x, y) => {
        if (x._h2hPts !== y._h2hPts) return y._h2hPts - x._h2hPts;
        if (x._h2hGD !== y._h2hGD) return y._h2hGD - x._h2hGD;
        if (x._h2hGF !== y._h2hGF) return y._h2hGF - x._h2hGF;
        if (x.GD !== y.GD) return y.GD - x.GD;
        if (x.GF !== y.GF) return y.GF - x.GF;
        return x.name.localeCompare(y.name);
      });
      block.forEach((t) => {
        delete t._h2hPts;
        delete t._h2hGD;
        delete t._h2hGF;
      });
    }

    resolved.push(...block);
    i = j;
  }

  // Remaining matches map (conservative count of matches not Completed)
  const remainingMap = {};
  participants.forEach((p) => (remainingMap[p] = 0));
  for (const m of schedule) {
    if (m.status === "Completed") continue;
    if (m.homeParticipant && Object.prototype.hasOwnProperty.call(remainingMap, m.homeParticipant)) remainingMap[m.homeParticipant]++;
    if (m.awayParticipant && Object.prototype.hasOwnProperty.call(remainingMap, m.awayParticipant)) remainingMap[m.awayParticipant]++;
  }
  const remainingMaxPoints = {};
  Object.keys(remainingMap).forEach((k) => (remainingMaxPoints[k] = remainingMap[k] * 3));

  // clinch detection (conservative):
  // - clinched: no other team can reach or exceed this team's current points even when conceding max to others.
  // - eliminated: even with max points remaining, this team cannot reach the current top points.
  const clinched = {};
  const eliminated = {};
  const topPts = Math.max(...resolved.map((s) => s.Pts), 0);

  for (const t of resolved) {
    let canBeCaught = false;
    for (const o of resolved) {
      if (o.name === t.name) continue;
      if (o.Pts + (remainingMaxPoints[o.name] || 0) >= t.Pts) {
        canBeCaught = true;
        break;
      }
    }
    clinched[t.name] = !canBeCaught;

    eliminated[t.name] = (t.Pts + (remainingMaxPoints[t.name] || 0)) < topPts;
  }

  return {
    standings: resolved,
    remainingMap,
    remainingMaxPoints,
    clinched,
    eliminated,
  };
};

/* ----------------- ROUTES ----------------- */

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
    const { name, type, participants = [], legs = 1, koStartStage, numGroups } =
      req.body;

    // basic validation
    if (!Array.isArray(participants)) {
      return res.status(400).json({ msg: "participants must be an array" });
    }

    const newTournament = new Tournament({
      name,
      type,
      participants,
      legs,
      koStartStage,
      user: req.user.id,
      groups: [],
      numGroups: numGroups || 0,
    });

    if (
      type === "League + Knockout" &&
      numGroups > 0 &&
      Array.isArray(participants) &&
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
    if (!tournament) return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

    const { name, type, participants, legs, koStartStage, numGroups } = req.body;
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
    if (!tournament) return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

    await tournament.deleteOne();
    res.json({ msg: "Tournament removed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST /:id/generate-schedule
 * - For League + Knockout: expects groups to exist. If missing and numGroups provided, creates groups and persists them.
 * - Adds unique matchNumber for each pushed match.
 */
router.post("/:id/generate-schedule", auth, async (req, res) => {
  try {
    let tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

    if (tournament.type === "Knockout") {
      return res.status(400).json({ msg: "Use /generate-knockout for knockout tournaments" });
    }

    const schedule = [];
    const { legs, type } = tournament;
    let { groups } = tournament;

    // create groups on-the-fly if needed (League + Knockout)
    if (type === "League + Knockout" && (!groups || groups.length === 0)) {
      const requestedNumGroups = req.body.numGroups || tournament.numGroups || 0;
      if (!requestedNumGroups || requestedNumGroups < 1) {
        return res.status(400).json({ msg: "No groups found. Provide numGroups to create groups first." });
      }

      if (tournament.participants.length % requestedNumGroups !== 0) {
        return res.status(400).json({ msg: "Number of participants is not evenly divisible by the provided numGroups." });
      }

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
        newGroups.push(shuffledParticipants.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup));
      }
      tournament.groups = newGroups;
      tournament.numGroups = requestedNumGroups;
      groups = newGroups;
      await tournament.save();
    }

    // We'll use a single matchCounter for uniqueness across whole schedule
    let matchCounter = 1;

    if (type === "League + Knockout") {
      const effectiveGroups = tournament.groups || [];
      if (!effectiveGroups || effectiveGroups.length === 0) {
        return res.status(400).json({ msg: "No groups found. Cannot generate league schedule." });
      }

      const groupNames = Array.from({ length: effectiveGroups.length }, (_, i) => `Group ${String.fromCharCode(65 + i)}`);

      for (let i = 0; i < effectiveGroups.length; i++) {
        const groupParticipants = [...effectiveGroups[i]];
        const groupName = groupNames[i];

        if (groupParticipants.length % 2 !== 0) groupParticipants.push("BYE");

        const numRounds = groupParticipants.length - 1;

        for (let round = 0; round < numRounds; round++) {
          for (let match = 0; match < groupParticipants.length / 2; match++) {
            const home = groupParticipants[match];
            const away = groupParticipants[groupParticipants.length - 1 - match];

            if (home !== "BYE" && away !== "BYE") {
              schedule.push({
                matchNumber: matchCounter++,
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

        // second leg mirror if legs === 2
        if (legs === 2) {
          const firstLegMatches = schedule.filter((m) => m.group === groupName && m.round <= (groupParticipants.length - 1));
          for (const match of firstLegMatches) {
            schedule.push({
              matchNumber: matchCounter++,
              round: match.round + (groupParticipants.length - 1),
              homeParticipant: match.awayParticipant,
              awayParticipant: match.homeParticipant,
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
              matchNumber: matchCounter++,
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
        for (const match of firstLegMatches) {
          schedule.push({
            matchNumber: matchCounter++,
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
          });
        }
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

/**
 * POST /:id/generate-knockout
 */
router.post("/:id/generate-knockout", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

    const { koStartStage } = tournament;
    let participants = [...(tournament.participants || [])];

    const schedule = generateKnockoutBracket(participants, koStartStage);

    tournament.schedule = schedule;
    await tournament.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST /:id/advance-winners
 * Picks top teams from each group (using calculateStandings) and generates a new knockout bracket.
 */
router.post("/:id/advance-winners", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });
    if (tournament.type !== "League + Knockout") return res.status(400).json({ msg: "Not a group tournament" });

    const allComplete = (tournament.schedule || []).every(
      (m) => m.status === "Completed" || m.homeParticipant === "BYE" || m.awayParticipant === "BYE"
    );
    if (!allComplete) {
      return res.status(400).json({ msg: "All group matches must be completed to advance." });
    }

    const advancingTeams = [];
    const teamsToAdvancePerGroup = 2;

    for (const groupParticipants of tournament.groups || []) {
      // find a match that indicates the group name
      const groupName = (tournament.schedule || []).find(
        (m) => (groupParticipants || []).includes(m.homeParticipant) || (groupParticipants || []).includes(m.awayParticipant)
      )?.group;
      if (!groupName) continue;

      const groupSchedule = (tournament.schedule || []).filter((m) => m.group === groupName);
      const calc = calculateStandings(groupParticipants, groupSchedule);
      const standings = Array.isArray(calc) ? calc : calc.standings;
      const groupWinners = (standings || []).slice(0, teamsToAdvancePerGroup).map((team) => team.name);
      advancingTeams.push(...groupWinners);
    }

    const newKoStartStage = advancingTeams.length;
    if (newKoStartStage < 2 || (newKoStartStage & (newKoStartStage - 1)) !== 0) {
      return res.status(400).json({ msg: `Invalid number of advancing teams (${newKoStartStage}). Must be a power of 2.` });
    }

    const newSchedule = generateKnockoutBracket(advancingTeams, newKoStartStage);

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

/**
 * PUT update a match (score entry)
 */
router.put("/:tournamentId/matches/:matchId", auth, async (req, res) => {
  try {
    const { homeScore, awayScore, homePenaltyScore, awayPenaltyScore } = req.body;

    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

    const match = tournament.schedule.id(req.params.matchId);
    if (!match) return res.status(404).json({ msg: "Match not found" });

    // set numeric values safely
    match.homeScore = homeScore !== null && homeScore !== undefined ? Number(homeScore) : null;
    match.awayScore = awayScore !== null && awayScore !== undefined ? Number(awayScore) : null;

    // determine if group (league) or knockout
    const isGroupMatch = !!match.group;

    // Group match: draws allowed, no penalties used to decide winner
    if (isGroupMatch) {
      match.status = "Completed";
      match.homePenaltyScore = null;
      match.awayPenaltyScore = null;

      if (match.homeScore > match.awayScore) match.winner = match.homeParticipant;
      else if (match.awayScore > match.homeScore) match.winner = match.awayParticipant;
      else match.winner = null; // draw

      await tournament.save();
      return res.json(tournament);
    }

    // Knockout match: handle penalties when draw
    // Normal scoring first
    if (match.homeScore > match.awayScore) {
      match.winner = match.homeParticipant;
      match.status = "Completed";
      match.homePenaltyScore = null;
      match.awayPenaltyScore = null;
    } else if (match.awayScore > match.homeScore) {
      match.winner = match.awayParticipant;
      match.status = "Completed";
      match.homePenaltyScore = null;
      match.awayPenaltyScore = null;
    } else {
      // draw -> need penalties
      const hp = homePenaltyScore !== null && homePenaltyScore !== undefined ? Number(homePenaltyScore) : null;
      const ap = awayPenaltyScore !== null && awayPenaltyScore !== undefined ? Number(awayPenaltyScore) : null;

      if (hp === null || ap === null) {
        match.status = "Pending (Penalties)";
        await tournament.save();
        return res.status(400).json({ msg: "Scores are level. Provide penalty shootout results.", tournament });
      }

      match.homePenaltyScore = hp;
      match.awayPenaltyScore = ap;

      if (hp === ap) {
        return res.status(400).json({ msg: "Penalty scores cannot be a draw." });
      }

      match.winner = hp > ap ? match.homeParticipant : match.awayParticipant;
      match.status = "Completed";
    }

    // propagate winner to next match if applicable
    if (match.nextMatchNumber) {
      let nextMatch = tournament.schedule.find((m) => m.matchNumber === match.nextMatchNumber);
      if (nextMatch) {
        if (match.matchNumber % 2 === 1) nextMatch.homeParticipant = match.winner;
        else nextMatch.awayParticipant = match.winner;

        // if both slots filled, set Pending or auto-complete BYE logic
        if (nextMatch.homeParticipant !== "TBD" && nextMatch.awayParticipant !== "TBD") {
          if (nextMatch.homeParticipant === "BYE" && nextMatch.awayParticipant !== "BYE") {
            nextMatch.status = "Completed";
            nextMatch.winner = nextMatch.awayParticipant;
            nextMatch.homeScore = 0;
            nextMatch.awayScore = 3;
          } else if (nextMatch.awayParticipant === "BYE" && nextMatch.homeParticipant !== "BYE") {
            nextMatch.status = "Completed";
            nextMatch.winner = nextMatch.homeParticipant;
            nextMatch.homeScore = 3;
            nextMatch.awayScore = 0;
          } else {
            nextMatch.status = "Pending";
          }
        }

        // propagate chain for auto-filled winners
        if (nextMatch.winner) {
          let winnerMatch = nextMatch;
          while (winnerMatch && winnerMatch.nextMatchNumber) {
            const followingMatch = tournament.schedule.find((m) => m.matchNumber === winnerMatch.nextMatchNumber);
            if (!followingMatch) break;

            if (winnerMatch.matchNumber % 2 === 1) followingMatch.homeParticipant = winnerMatch.winner;
            else followingMatch.awayParticipant = winnerMatch.winner;

            if (followingMatch.homeParticipant !== "TBD" && followingMatch.awayParticipant !== "TBD") {
              if (followingMatch.homeParticipant === "BYE" && followingMatch.awayParticipant !== "BYE") {
                followingMatch.status = "Completed";
                followingMatch.winner = followingMatch.awayParticipant;
                followingMatch.homeScore = 0;
                followingMatch.awayScore = 3;
              } else if (followingMatch.awayParticipant === "BYE" && followingMatch.homeParticipant !== "BYE") {
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
    if (!tournament) return res.status(404).json({ msg: "Tournament not found" });
    if (tournament.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

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

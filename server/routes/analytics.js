const express = require('express');
const router = express.Router();
const { fetchMatchInfo } = require('../services/apiService');

// Analytics based strictly on live match data context!
// GET /api/analytics/win-probability?matchId=X
router.get('/win-probability', async (req, res, next) => {
  const { matchId } = req.query;
  if (!matchId) return res.status(400).json({ error: 'matchId is required for live analytics.' });

  try {
    // We would calculate genuine analytics based on the live API's current context
    const data = await fetchMatchInfo(matchId);
    if (!data || data.status !== 'success' || !data.data) {
      return res.status(404).json({ error: 'Could not fetch live match data to run analytics.' });
    }

    const matchInfo = data.data;
    
    // We strictly use realtime API data from 'matchInfo', rather than simulated numbers.
    // If CricAPI returns run logic, parse it. Usually score is inside match_scorecard or match_info.score
    res.json({
      source: 'api',
      message: 'Live win-probability logic requires scorecard parsing. Returning raw context below.',
      matchStatus: matchInfo.status,
      teams: matchInfo.teams,
      // The frontend can build upon the real scoring properties here instead of the old random generator
    });

  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/run-rate-graph?matchId=id
router.get('/run-rate-graph', async (req, res, next) => {
  const { matchId } = req.query;
  if (!matchId) return res.status(400).json({ error: 'matchId is required.' });

  res.status(501).json({ 
    error: 'Not Implemented', 
    message: 'To keep strict accuracy, run-rate graphs require ball-by-ball API access which may be premium. Mock data has been completely disabled.' 
  });
});

// GET /api/analytics/manhattan?matchId=id
router.get('/manhattan', (req, res) => {
  res.status(501).json({ 
    error: 'Not Implemented', 
    message: 'Manhattan graphs require ball-by-ball live APIs. Mock data has been completely disabled.' 
  });
});

// GET /api/analytics/player-performance?playerId=X
router.get('/player-performance', (req, res) => {
  res.status(501).json({ 
    error: 'Not Implemented', 
    message: 'We strictly serve live data over mock generators. Fetch direct player stats from /api/players/:id instead.' 
  });
});

module.exports = router;

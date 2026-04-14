const express = require('express');
const router = express.Router();

// GET /api/analytics/win-probability?team1runs=X&team2target=Y&overs=Z&wickets=W
router.get('/win-probability', (req, res) => {
  const { team1runs = 250, team2runs = 0, target = 251, overs = 0, maxOvers = 50, wickets = 0 } = req.query;
  
  const t1 = parseInt(team1runs);
  const t2 = parseInt(team2runs);
  const tgt = parseInt(target);
  const o = parseFloat(overs);
  const maxO = parseInt(maxOvers);
  const w = parseInt(wickets);

  // Calculate required run rate
  const ballsRemaining = (maxO - o) * 6;
  const runsNeeded = tgt - t2;
  const rrr = ballsRemaining > 0 ? (runsNeeded / (ballsRemaining / 6)).toFixed(2) : 0;
  
  // Win probability calculation (simplified Duckworth-Lewis inspired)
  const resourcesUsed = (o / maxO) + (w / 10) * 0.5;
  const resNeeded = runsNeeded / tgt;
  
  let team2WinProb = Math.max(5, Math.min(95, 100 - (resourcesUsed * 50) - (resNeeded * 30)));
  const team1WinProb = 100 - team2WinProb;

  res.json({
    team1WinProbability: team1WinProb.toFixed(1),
    team2WinProbability: team2WinProb.toFixed(1),
    requiredRunRate: parseFloat(rrr),
    runsNeeded,
    ballsRemaining,
    winFactors: {
      wicketsInHand: `${10 - w} wickets`,
      resourcesConsumed: `${(resourcesUsed * 100).toFixed(0)}%`,
      pressureIndex: rrr > 8 ? 'High' : rrr > 6 ? 'Medium' : 'Low'
    }
  });
});

// GET /api/analytics/run-rate-graph?match=id
router.get('/run-rate-graph', (req, res) => {
  // Generate realistic run progression data
  const overs = [];
  let totalRuns = 0;
  let wickets = 0;
  
  for (let i = 1; i <= 20; i++) {
    const wicketFell = Math.random() < 0.15 && wickets < 9;
    if (wicketFell) wickets++;
    
    const runsThisOver = wickets > 7 
      ? Math.floor(Math.random() * 6) + 2
      : Math.floor(Math.random() * 15) + 4;
    
    totalRuns += runsThisOver;
    overs.push({
      over: i,
      runs: runsThisOver,
      totalRuns,
      wickets,
      runRate: (totalRuns / i).toFixed(2)
    });
  }
  
  res.json({ overs, finalScore: `${totalRuns}/${wickets}` });
});

// GET /api/analytics/manhattan?match=id
router.get('/manhattan', (req, res) => {
  const innings1 = [];
  const innings2 = [];
  
  for (let i = 1; i <= 20; i++) {
    innings1.push({
      over: i,
      runs: Math.floor(Math.random() * 18) + 3,
      wickets: Math.random() < 0.2 ? 1 : 0
    });
    innings2.push({
      over: i,
      runs: Math.floor(Math.random() * 18) + 3,
      wickets: Math.random() < 0.2 ? 1 : 0
    });
  }
  
  res.json({ innings1, innings2 });
});

// GET /api/analytics/player-performance?playerId=X
router.get('/player-performance', (req, res) => {
  const formats = ['Test', 'ODI', 'T20'];
  const last5 = [];
  
  for (let i = 0; i < 5; i++) {
    last5.push({
      match: `vs ${['Australia', 'England', 'Pakistan', 'South Africa', 'New Zealand'][i]}`,
      runs: Math.floor(Math.random() * 120) + 10,
      balls: Math.floor(Math.random() * 150) + 20,
      sr: parseFloat(((Math.random() * 80) + 60).toFixed(1)),
      fours: Math.floor(Math.random() * 12),
      sixes: Math.floor(Math.random() * 5),
      dismissed: Math.random() < 0.7 ? 'Out' : 'Not Out',
      date: new Date(Date.now() - i * 864000000).toISOString()
    });
  }
  
  const formatStats = formats.map(f => ({
    format: f,
    matches: Math.floor(Math.random() * 100) + 20,
    runs: Math.floor(Math.random() * 5000) + 1000,
    avg: parseFloat((Math.random() * 40 + 25).toFixed(2)),
    sr: parseFloat((Math.random() * 50 + 70).toFixed(2))
  }));
  
  res.json({ last5, formatStats });
});

module.exports = router;

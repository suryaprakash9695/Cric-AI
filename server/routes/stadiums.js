const express = require('express');
const router = express.Router();
const { mockStadiums } = require('../services/mockData');

// GET /api/stadiums
router.get('/', (req, res) => {
  const { country } = req.query;
  let stadiums = mockStadiums;
  if (country) {
    stadiums = stadiums.filter(s => s.country.toLowerCase() === country.toLowerCase());
  }
  res.json({ stadiums, total: stadiums.length });
});

// GET /api/stadiums/:id
router.get('/:id', (req, res) => {
  const stadium = mockStadiums.find(s => s.id === parseInt(req.params.id));
  if (!stadium) return res.status(404).json({ error: 'Stadium not found' });
  
  // Add rich details for individual stadium
  res.json({
    stadium: {
      ...stadium,
      records: {
        highestScore: `${Math.floor(Math.random() * 50) + 350}/4`,
        lowestScore: `${Math.floor(Math.random() * 40) + 50}/10`,
        mostRuns: { player: "Sachin Tendulkar", runs: Math.floor(Math.random() * 500) + 800 },
        mostWickets: { player: "Anil Kumble", wickets: Math.floor(Math.random() * 30) + 40 }
      },
      recentMatches: [
        { match: "India vs Australia T20", result: "India won by 45 runs", date: new Date(Date.now() - 864000000) },
        { match: "England vs New Zealand ODI", result: "England won by 3 wickets", date: new Date(Date.now() - 2592000000) }
      ]
    }
  });
});

module.exports = router;

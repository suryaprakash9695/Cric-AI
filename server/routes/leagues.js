const express = require('express');
const router = express.Router();
const { mockLeagues } = require('../services/mockData');

// GET /api/leagues
router.get('/', (req, res) => {
  const summary = Object.values(mockLeagues).map(l => ({
    id: l.id,
    name: l.name,
    shortName: l.shortName,
    season: l.season,
    logo: l.logo,
    color: l.color,
    teamsCount: l.pointsTable.length
  }));
  res.json({ leagues: summary });
});

// GET /api/leagues/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const league = mockLeagues[id.toLowerCase()];
  if (!league) return res.status(404).json({ error: 'League not found' });
  res.json({ league, source: 'demo' });
});

// GET /api/leagues/:id/standings
router.get('/:id/standings', (req, res) => {
  const { id } = req.params;
  const league = mockLeagues[id.toLowerCase()];
  if (!league) return res.status(404).json({ error: 'League not found' });
  res.json({ standings: league.pointsTable, season: league.season });
});

// GET /api/leagues/:id/fixtures
router.get('/:id/fixtures', (req, res) => {
  const { id } = req.params;
  const league = mockLeagues[id.toLowerCase()];
  if (!league) return res.status(404).json({ error: 'League not found' });
  res.json({ fixtures: league.fixtures, season: league.season });
});

// GET /api/leagues/:id/top-players
router.get('/:id/top-players', (req, res) => {
  const { id } = req.params;
  const league = mockLeagues[id.toLowerCase()];
  if (!league) return res.status(404).json({ error: 'League not found' });
  res.json({ players: league.topPlayers, season: league.season });
});

module.exports = router;

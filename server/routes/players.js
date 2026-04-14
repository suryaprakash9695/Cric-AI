const express = require('express');
const router = express.Router();
const { searchPlayer, fetchPlayerStats } = require('../services/apiService');
const { mockPlayers } = require('../services/mockData');

// GET /api/players/search?q=name
router.get('/search', async (req, res, next) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query required' });

  const cache = req.app.locals.cache;
  const cacheKey = `player_search_${q.toLowerCase()}`;

  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: 'cache', players: cached });

    const data = await searchPlayer(q);
    if (data && data.status === 'success' && data.data?.length) {
      cache.set(cacheKey, data.data, 3600);
      return res.json({ source: 'api', players: data.data });
    }

    // Filter mock players
    const filtered = mockPlayers.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.country.toLowerCase().includes(q.toLowerCase())
    );
    res.json({ source: 'demo', players: filtered.length ? filtered : mockPlayers, demo: true });
  } catch (err) {
    const filtered = mockPlayers.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase())
    );
    res.json({ source: 'demo', players: filtered.length ? filtered : mockPlayers, demo: true });
  }
});

// GET /api/players/:id
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  const cache = req.app.locals.cache;
  const cacheKey = `player_${id}`;

  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: 'cache', player: cached });

    // Check if it's a mock player
    if (id.startsWith('mock-')) {
      const mock = mockPlayers.find(p => p.id === id) || mockPlayers[0];
      return res.json({ source: 'demo', player: mock, demo: true });
    }

    const data = await fetchPlayerStats(id);
    if (data && data.status === 'success') {
      cache.set(cacheKey, data.data, parseInt(process.env.CACHE_TTL_STATS) || 3600);
      return res.json({ source: 'api', player: data.data });
    }

    const mock = mockPlayers[0];
    res.json({ source: 'demo', player: mock, demo: true });
  } catch (err) {
    res.json({ source: 'demo', player: mockPlayers[0], demo: true });
  }
});

// GET /api/players - list top players
router.get('/', async (req, res) => {
  res.json({ source: 'demo', players: mockPlayers, demo: true });
});

module.exports = router;

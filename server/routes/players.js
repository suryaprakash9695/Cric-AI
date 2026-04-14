const express = require('express');
const router = express.Router();
const { searchPlayer, fetchPlayerStats } = require('../services/apiService');

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

    return res.json({ source: 'api', players: [], message: 'No players found' });
  } catch (err) {
    next(err);
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

    const data = await fetchPlayerStats(id);
    if (data && data.status === 'success') {
      cache.set(cacheKey, data.data, parseInt(process.env.CACHE_TTL_STATS) || 3600);
      return res.json({ source: 'api', player: data.data });
    }

    return res.status(404).json({ error: 'Player statistics not found from API.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { fetchLiveMatches, fetchMatchInfo, fetchMatchScorecard } = require('../services/apiService');

// GET /api/matches/live
router.get('/live', async (req, res, next) => {
  const cache = req.app.locals.cache;
  const cacheKey = 'live_matches';
  
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: 'cache', ...cached });

    const data = await fetchLiveMatches();
    
    if (data && data.status === 'success' && data.data) {
      const result = { matches: data.data, total: data.data.length };
      cache.set(cacheKey, result, parseInt(process.env.CACHE_TTL_LIVE) || 30);
      return res.json({ source: 'api', ...result });
    }
    
    return res.status(502).json({ error: 'Failed to fetch live matches from API or API limits reached.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/matches/:id/info
router.get('/:id/info', async (req, res, next) => {
  const { id } = req.params;
  const cache = req.app.locals.cache;
  const cacheKey = `match_info_${id}`;

  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: 'cache', data: cached });

    const data = await fetchMatchInfo(id);
    if (data && data.status === 'success') {
      cache.set(cacheKey, data.data, 60);
      return res.json({ source: 'api', data: data.data });
    }

    return res.status(404).json({ error: 'Match info not found from API.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/matches/:id/scorecard
router.get('/:id/scorecard', async (req, res, next) => {
  const { id } = req.params;
  const cache = req.app.locals.cache;
  const cacheKey = `scorecard_${id}`;

  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: 'cache', data: cached });

    const data = await fetchMatchScorecard(id);
    if (data && data.status === 'success') {
      cache.set(cacheKey, data.data, 30);
      return res.json({ source: 'api', data: data.data });
    }

    return res.status(404).json({ error: 'Scorecard not found from API.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { fetchLiveMatches, fetchMatchInfo, fetchMatchScorecard } = require('../services/apiService');
const { mockLiveMatches } = require('../services/mockData');

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
    
    // Fallback to mock data
    const mockResult = { matches: mockLiveMatches, total: mockLiveMatches.length, demo: true };
    cache.set(cacheKey, mockResult, 30);
    res.json({ source: 'demo', ...mockResult });
  } catch (err) {
    res.json({ source: 'demo', matches: mockLiveMatches, total: mockLiveMatches.length, demo: true });
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

    const mock = mockLiveMatches.find(m => m.id === id) || mockLiveMatches[0];
    res.json({ source: 'demo', data: mock, demo: true });
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

    // Mock scorecard
    const mockScorecard = {
      id,
      innings: [
        {
          inning: "India Inning 1",
          batsman: [
            { name: "Rohit Sharma", r: 73, b: 89, fours: 8, sixes: 2, sr: 82.02, dismissal: "c Smith b Cummins" },
            { name: "Shubman Gill", r: 65, b: 102, fours: 7, sixes: 0, sr: 63.73, dismissal: "lbw b Hazlewood" },
            { name: "Virat Kohli", r: 121, b: 156, fours: 14, sixes: 1, sr: 77.56, dismissal: "not out" }
          ],
          bowlers: [
            { name: "Pat Cummins", o: 22, m: 4, r: 71, w: 3, econ: 3.22 },
            { name: "Josh Hazlewood", o: 20, m: 5, r: 58, w: 2, econ: 2.90 },
            { name: "Mitchell Starc", o: 18, m: 2, r: 74, w: 1, econ: 4.11 }
          ],
          total: { r: 342, w: 6, o: 87.3 }
        }
      ]
    };
    res.json({ source: 'demo', data: mockScorecard, demo: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

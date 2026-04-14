const express = require('express');
const router = express.Router();
const { fetchCricketNews } = require('../services/apiService');

// GET /api/news?category=all|international|domestic|trending&page=1
router.get('/', async (req, res, next) => {
  const { category = 'all', page = 1 } = req.query;
  const cache = req.app.locals.cache;
  const cacheKey = `news_${category}_${page}`;

  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: 'cache', ...cached });

    const data = await fetchCricketNews(category, parseInt(page));
    
    if (data && data.status === 'ok' && data.articles?.length) {
      const result = {
        articles: data.articles.map(a => ({
          ...a,
          category: category === 'all' ? categorizeArticle(a.title) : category
        })),
        total: data.totalResults,
        page: parseInt(page)
      };
      cache.set(cacheKey, result, parseInt(process.env.CACHE_TTL_NEWS) || 300);
      return res.json({ source: 'api', ...result });
    }

    return res.json({ source: 'api', articles: [], total: 0, page: 1, message: 'No live news available right now.' });
  } catch (err) {
    next(err);
  }
});

function categorizeArticle(title = '') {
  const t = title.toLowerCase();
  if (t.includes('ipl') || t.includes('bbl') || t.includes('cpl') || t.includes('domestic')) return 'domestic';
  if (t.includes('record') || t.includes('milestone') || t.includes('first ever')) return 'trending';
  return 'international';
}

module.exports = router;

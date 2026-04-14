const express = require('express');
const router = express.Router();
const { 
  fetchLeagueInfo, 
  fetchTeamsByLeague, 
  fetchNextLeagueEvents, 
  fetchLastLeagueEvents,
  fetchLeagueSeasonResults
} = require('../services/apiService');

// Mapping popular league short codes to TheSportsDB League IDs
const LEAGUE_IDS = {
  'ipl': '4376', // Indian Premier League
  'bbl': '4377', // Big Bash League
  'cpl': '4410', // Caribbean Premier League
  'psl': '4378', // Pakistan Super League
  'hundred': '4822' // The Hundred
};

// GET /api/leagues
router.get('/', async (req, res, next) => {
  // Return all supported major leagues setup with SportsDB IDs
  const supportedLeagues = Object.entries(LEAGUE_IDS).map(([shortName, id]) => ({
    shortName, id
  }));
  res.json({ source: 'config', leagues: supportedLeagues, message: "Use /api/leagues/:id to get live data per league" });
});

// GET /api/leagues/:id
router.get('/:id', async (req, res, next) => {
  const leagueNameKey = req.params.id.toLowerCase();
  const id = LEAGUE_IDS[leagueNameKey] || req.params.id; // Support both shortcode or direct ID
  
  try {
    const data = await fetchLeagueInfo(id);
    if (!data || !data.leagues || data.leagues.length === 0) {
      return res.status(404).json({ error: 'League not found in live API.' });
    }
    res.json({ source: 'api', league: data.leagues[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/leagues/:id/teams
router.get('/:id/teams', async (req, res, next) => {
  const leagueNameKey = req.params.id.toLowerCase();
  
  // We need the string name for team lookup, let's fetch league info first if ID
  try {
    const id = LEAGUE_IDS[leagueNameKey] || req.params.id;
    const leagueData = await fetchLeagueInfo(id);
    if (!leagueData || !leagueData.leagues) return res.status(404).json({ error: 'League not found.' });
    
    // Some leagues might have specific names in SportsDB
    const fullName = leagueData.leagues[0].strLeague;
    const data = await fetchTeamsByLeague(fullName);
    res.json({ source: 'api', teams: data.teams || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/leagues/:id/fixtures
router.get('/:id/fixtures', async (req, res, next) => {
  const leagueNameKey = req.params.id.toLowerCase();
  const id = LEAGUE_IDS[leagueNameKey] || req.params.id;
  
  try {
    const nextEvents = await fetchNextLeagueEvents(id);
    res.json({ source: 'api', fixtures: nextEvents.events || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/leagues/:id/results (Past events)
router.get('/:id/results', async (req, res, next) => {
  const leagueNameKey = req.params.id.toLowerCase();
  const id = LEAGUE_IDS[leagueNameKey] || req.params.id;
  
  try {
    const pastEvents = await fetchLastLeagueEvents(id);
    res.json({ source: 'api', results: pastEvents.events || [] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

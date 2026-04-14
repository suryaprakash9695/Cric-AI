const axios = require('axios');

const CRICKET_API_BASE = process.env.CRICKET_API_BASE_URL || 'https://api.cricapi.com/v1';
const API_KEY          = process.env.CRICKET_API_KEY;

const NEWS_API_BASE = process.env.NEWS_API_BASE_URL || 'https://newsapi.org/v2';
const NEWS_API_KEY  = process.env.NEWS_API_KEY;

const SPORTS_DB_BASE = process.env.SPORTS_DB_BASE_URL || 'https://www.thesportsdb.com/api/v1/json';
const SPORTS_DB_KEY  = process.env.SPORTS_DB_API_KEY || '3';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requireKey(keyName, value) {
  if (!value || value === 'your_cricket_api_key_here' || value === 'your_news_api_key_here') {
    throw new Error(`Missing API key: ${keyName}. Please set it in your .env file.`);
  }
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await axios.get(url, {
      ...options,
      timeout,
      signal: controller.signal
    });
    clearTimeout(id);
    return response.data;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ─── Cricket API ──────────────────────────────────────────────────────────────

async function fetchLiveMatches() {
  requireKey('CRICKET_API_KEY', API_KEY);
  const data = await fetchWithTimeout(`${CRICKET_API_BASE}/currentMatches`, {
    params: { apikey: API_KEY, offset: 0 }
  });
  return data;
}

async function fetchMatchInfo(matchId) {
  requireKey('CRICKET_API_KEY', API_KEY);
  const data = await fetchWithTimeout(`${CRICKET_API_BASE}/match_info`, {
    params: { apikey: API_KEY, id: matchId }
  });
  return data;
}

async function fetchMatchScorecard(matchId) {
  requireKey('CRICKET_API_KEY', API_KEY);
  const data = await fetchWithTimeout(`${CRICKET_API_BASE}/match_scorecard`, {
    params: { apikey: API_KEY, id: matchId }
  });
  return data;
}

async function searchPlayer(name) {
  requireKey('CRICKET_API_KEY', API_KEY);
  const data = await fetchWithTimeout(`${CRICKET_API_BASE}/players`, {
    params: { apikey: API_KEY, search: name, offset: 0 }
  });
  return data;
}

async function fetchPlayerStats(playerId) {
  requireKey('CRICKET_API_KEY', API_KEY);
  const data = await fetchWithTimeout(`${CRICKET_API_BASE}/players_info`, {
    params: { apikey: API_KEY, id: playerId }
  });
  return data;
}

async function fetchSeriesList() {
  requireKey('CRICKET_API_KEY', API_KEY);
  const data = await fetchWithTimeout(`${CRICKET_API_BASE}/series`, {
    params: { apikey: API_KEY, offset: 0 }
  });
  return data;
}

// ─── News API ─────────────────────────────────────────────────────────────────

async function fetchCricketNews(category = 'all', page = 1) {
  requireKey('NEWS_API_KEY', NEWS_API_KEY);

  const queries = {
    international: 'cricket international test ODI',
    domestic:      'IPL BBL CPL domestic cricket',
    trending:      'cricket highlights records milestone',
    all:           'cricket'
  };
  const q = queries[category] || queries.all;

  const data = await fetchWithTimeout(`${NEWS_API_BASE}/everything`, {
    params: {
      q,
      sortBy:   'publishedAt',
      language: 'en',
      page,
      pageSize: 20,
      apiKey:   NEWS_API_KEY
    }
  });
  return data;
}

// ─── TheSportsDB ──────────────────────────────────────────────────────────────

async function fetchLeagueInfo(leagueId) {
  const data = await fetchWithTimeout(
    `${SPORTS_DB_BASE}/${SPORTS_DB_KEY}/lookupleague.php`,
    { params: { id: leagueId } }
  );
  return data;
}

async function fetchLeagueSeasonResults(leagueId, season) {
  const data = await fetchWithTimeout(
    `${SPORTS_DB_BASE}/${SPORTS_DB_KEY}/eventsseason.php`,
    { params: { id: leagueId, s: season } }
  );
  return data;
}

async function fetchTeamsByLeague(leagueName) {
  const data = await fetchWithTimeout(
    `${SPORTS_DB_BASE}/${SPORTS_DB_KEY}/search_all_teams.php`,
    { params: { l: leagueName, s: 'Cricket' } }
  );
  return data;
}

async function fetchNextLeagueEvents(leagueId) {
  const data = await fetchWithTimeout(
    `${SPORTS_DB_BASE}/${SPORTS_DB_KEY}/eventsnextleague.php`,
    { params: { id: leagueId } }
  );
  return data;
}

async function fetchLastLeagueEvents(leagueId) {
  const data = await fetchWithTimeout(
    `${SPORTS_DB_BASE}/${SPORTS_DB_KEY}/eventspastleague.php`,
    { params: { id: leagueId } }
  );
  return data;
}

module.exports = {
  fetchLiveMatches,
  fetchMatchInfo,
  fetchMatchScorecard,
  searchPlayer,
  fetchPlayerStats,
  fetchSeriesList,
  fetchCricketNews,
  fetchLeagueInfo,
  fetchLeagueSeasonResults,
  fetchTeamsByLeague,
  fetchNextLeagueEvents,
  fetchLastLeagueEvents
};

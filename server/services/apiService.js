const axios = require('axios');

const CRICKET_API_BASE = process.env.CRICKET_API_BASE_URL || 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICKET_API_KEY || 'demo';

const NEWS_API_BASE = process.env.NEWS_API_BASE_URL || 'https://newsapi.org/v2';
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'demo';

const SPORTS_DB_BASE = process.env.SPORTS_DB_BASE_URL || 'https://www.thesportsdb.com/api/v1/json';
const SPORTS_DB_KEY = process.env.SPORTS_DB_API_KEY || '3';

// Generic fetch with timeout and error handling
async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await axios.get(url, {
      ...options,
      timeout,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Cricket API calls
async function fetchLiveMatches() {
  try {
    const data = await fetchWithTimeout(`${CRICKET_API_BASE}/currentMatches`, {
      params: { apikey: API_KEY, offset: 0 }
    });
    return data;
  } catch (err) {
    console.error('Cricket API error (live):', err.message);
    return null;
  }
}

async function fetchMatchInfo(matchId) {
  try {
    const data = await fetchWithTimeout(`${CRICKET_API_BASE}/match_info`, {
      params: { apikey: API_KEY, id: matchId }
    });
    return data;
  } catch (err) {
    console.error('Cricket API error (match info):', err.message);
    return null;
  }
}

async function fetchMatchScorecard(matchId) {
  try {
    const data = await fetchWithTimeout(`${CRICKET_API_BASE}/match_scorecard`, {
      params: { apikey: API_KEY, id: matchId }
    });
    return data;
  } catch (err) {
    console.error('Cricket API error (scorecard):', err.message);
    return null;
  }
}

async function searchPlayer(name) {
  try {
    const data = await fetchWithTimeout(`${CRICKET_API_BASE}/players`, {
      params: { apikey: API_KEY, search: name, offset: 0 }
    });
    return data;
  } catch (err) {
    console.error('Cricket API error (player search):', err.message);
    return null;
  }
}

async function fetchPlayerStats(playerId) {
  try {
    const data = await fetchWithTimeout(`${CRICKET_API_BASE}/players_info`, {
      params: { apikey: API_KEY, id: playerId }
    });
    return data;
  } catch (err) {
    console.error('Cricket API error (player stats):', err.message);
    return null;
  }
}

async function fetchSeriesList() {
  try {
    const data = await fetchWithTimeout(`${CRICKET_API_BASE}/series`, {
      params: { apikey: API_KEY, offset: 0 }
    });
    return data;
  } catch (err) {
    console.error('Cricket API error (series):', err.message);
    return null;
  }
}

// News API calls
async function fetchCricketNews(category = 'cricket', page = 1) {
  try {
    const queries = {
      international: 'cricket international test ODI',
      domestic: 'IPL BBL CPL domestic cricket',
      trending: 'cricket highlights records breaking',
      all: 'cricket'
    };
    const q = queries[category] || queries.all;
    const data = await fetchWithTimeout(`${NEWS_API_BASE}/everything`, {
      params: {
        q,
        sortBy: 'publishedAt',
        language: 'en',
        page,
        pageSize: 20,
        apiKey: NEWS_API_KEY
      }
    });
    return data;
  } catch (err) {
    console.error('News API error:', err.message);
    return null;
  }
}

// TheSportsDB calls
async function fetchLeagueInfo(leagueId) {
  try {
    const data = await fetchWithTimeout(
      `${SPORTS_DB_BASE}/${SPORTS_DB_KEY}/lookupleague.php`,
      { params: { id: leagueId } }
    );
    return data;
  } catch (err) {
    console.error('SportsDB error (league):', err.message);
    return null;
  }
}

async function fetchTeamsByLeague(leagueName) {
  try {
    const data = await fetchWithTimeout(
      `${SPORTS_DB_BASE}/${SPORTS_DB_KEY}/search_all_teams.php`,
      { params: { l: leagueName, s: 'Cricket' } }
    );
    return data;
  } catch (err) {
    console.error('SportsDB error (teams):', err.message);
    return null;
  }
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
  fetchTeamsByLeague
};

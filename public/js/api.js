/* ============================================
   CricketVerse – API Client Module
   ============================================ */

const API = {
  BASE_URL: '',  // Same-origin (served by Express)

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.BASE_URL}/api${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Matches
  async getLiveMatches() {
    return this.request('/matches/live');
  },

  async getMatchInfo(id) {
    return this.request(`/matches/${id}/info`);
  },

  async getMatchScorecard(id) {
    return this.request(`/matches/${id}/scorecard`);
  },

  // Players
  async searchPlayers(query) {
    return this.request(`/players/search?q=${encodeURIComponent(query)}`);
  },

  async getPlayer(id) {
    return this.request(`/players/${id}`);
  },

  async getTopPlayers() {
    return this.request('/players');
  },

  // News
  async getNews(category = 'all', page = 1) {
    return this.request(`/news?category=${category}&page=${page}`);
  },

  // Leagues
  async getLeagues() {
    return this.request('/leagues');
  },

  async getLeague(id) {
    return this.request(`/leagues/${id}`);
  },

  async getLeagueStandings(id) {
    return this.request(`/leagues/${id}/standings`);
  },

  async getLeagueFixtures(id) {
    return this.request(`/leagues/${id}/fixtures`);
  },

  async getLeagueTopPlayers(id) {
    return this.request(`/leagues/${id}/top-players`);
  },

  // Stadiums
  async getStadiums() {
    return this.request('/stadiums');
  },

  async getStadium(id) {
    return this.request(`/stadiums/${id}`);
  },

  // Analytics
  async getWinProbability(params) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/analytics/win-probability?${q}`);
  },

  async getRunRateData() {
    return this.request('/analytics/run-rate-graph');
  },

  async getManhattanData() {
    return this.request('/analytics/manhattan');
  },

  async getPlayerPerformance(playerId) {
    return this.request(`/analytics/player-performance?playerId=${playerId}`);
  },

  // Health
  async healthCheck() {
    return this.request('/health');
  }
};

window.API = API;

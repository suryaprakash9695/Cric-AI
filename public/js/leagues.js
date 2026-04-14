/* ============================================
   CricketVerse – Leagues Module
   ============================================ */

const LeaguesModule = {
  leagueData: {},
  activeLeagueTabs: {},

  async loadLeague(leagueId) {
    const containerId = `league-content-${leagueId}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    // If already loaded, skip re-fetching
    if (this.leagueData[leagueId]) {
      this.renderLeague(leagueId, this.leagueData[leagueId], container);
      return;
    }

    container.innerHTML = `
      <div style="text-align:center;padding:60px;">
        <div class="cricket-ball-loader" style="width:50px;height:50px;margin:0 auto 16px;"></div>
        <p style="color:var(--text-secondary);">Loading league data...</p>
      </div>
    `;

    try {
      const [leagueRes, standingsRes, fixturesRes, playersRes] = await Promise.allSettled([
        API.getLeague(leagueId),
        API.getLeagueStandings(leagueId),
        API.getLeagueFixtures(leagueId),
        API.getLeagueTopPlayers(leagueId)
      ]);

      const league = leagueRes.value?.league || {};
      league.pointsTable = standingsRes.value?.standings || league.pointsTable || [];
      league.fixtures = fixturesRes.value?.fixtures || league.fixtures || [];
      league.topPlayers = playersRes.value?.players || league.topPlayers || [];

      this.leagueData[leagueId] = league;
      this.renderLeague(leagueId, league, container);
    } catch (err) {
      container.innerHTML = Utils.errorState(`Could not load ${leagueId.toUpperCase()} data`);
    }
  },

  renderLeague(leagueId, league, container) {
    const activeTab = this.activeLeagueTabs[leagueId] || 'standings';

    const tabContent = {
      standings: this.buildStandingsHTML(league),
      fixtures: this.buildFixturesHTML(league),
      players: this.buildTopPlayersHTML(league)
    };

    container.innerHTML = `
      <div class="league-hero" style="--league-color:${league.color || '#00d4ff'}">
        <span class="league-icon">${league.logo || '🏆'}</span>
        <div class="league-info">
          <h1>${league.name || leagueId.toUpperCase()}</h1>
          <div class="league-season">Season ${league.season || '2025'} • ${league.pointsTable?.length || 0} Teams</div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
            <span style="font-size:0.75rem;color:var(--text-secondary);">📊 ${league.pointsTable?.length || 0} matches played</span>
            <span style="font-size:0.75rem;color:var(--text-secondary);">📅 ${league.fixtures?.length || 0} upcoming</span>
          </div>
        </div>
      </div>

      <div class="league-tabs">
        <button class="league-tab ${activeTab === 'standings' ? 'active' : ''}"
                onclick="LeaguesModule.switchTab('${leagueId}', 'standings', this)">
          📊 Points Table
        </button>
        <button class="league-tab ${activeTab === 'fixtures' ? 'active' : ''}"
                onclick="LeaguesModule.switchTab('${leagueId}', 'fixtures', this)">
          📅 Fixtures
        </button>
        <button class="league-tab ${activeTab === 'players' ? 'active' : ''}"
                onclick="LeaguesModule.switchTab('${leagueId}', 'players', this)">
          👥 Top Players
        </button>
      </div>

      <div class="card animate-fade-in" id="league-tab-content-${leagueId}">
        ${tabContent[activeTab]}
      </div>
    `;
  },

  switchTab(leagueId, tab, btn) {
    this.activeLeagueTabs[leagueId] = tab;
    const league = this.leagueData[leagueId];
    if (!league) return;

    // Update tab button states
    btn.closest('.league-tabs').querySelectorAll('.league-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update content
    const contentDiv = document.getElementById(`league-tab-content-${leagueId}`);
    if (!contentDiv) return;

    const tabContent = {
      standings: this.buildStandingsHTML(league),
      fixtures: this.buildFixturesHTML(league),
      players: this.buildTopPlayersHTML(league)
    };

    contentDiv.innerHTML = tabContent[tab] || '';
    contentDiv.classList.remove('animate-fade-in');
    void contentDiv.offsetWidth; // trigger reflow
    contentDiv.classList.add('animate-fade-in');
  },

  buildStandingsHTML(league) {
    const table = league.pointsTable || [];
    if (!table.length) return Utils.emptyState('No standings data available');

    const rows = table.map((team, idx) => {
      const nrrVal = parseFloat(team.nrr || 0);
      const nrrClass = nrrVal >= 0 ? 'nrr-positive' : 'nrr-negative';
      const zoneClass = idx < 4 ? 'qualifying-zone' : idx >= table.length - 2 ? 'elimination-zone' : '';

      return `
        <tr class="${zoneClass}">
          <td><span class="team-rank">${idx + 1}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.1rem;">${this.getTeamEmoji(team.team)}</span>
              <strong>${team.team}</strong>
            </div>
          </td>
          <td>${team.p || 0}</td>
          <td style="color:var(--accent-success);font-weight:600;">${team.w || 0}</td>
          <td style="color:var(--accent-danger);font-weight:600;">${team.l || 0}</td>
          <td class="pts-column">${team.pts || 0}</td>
          <td class="${nrrClass}">${nrrVal >= 0 ? '+' : ''}${nrrVal.toFixed(3)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="overflow-x:auto;">
        <div style="display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--accent-success);">
            <div style="width:12px;height:12px;border-radius:2px;background:var(--accent-success);opacity:0.5;"></div>
            Qualifying positions
          </div>
          <div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--accent-danger);">
            <div style="width:12px;height:12px;border-radius:2px;background:var(--accent-danger);opacity:0.5;"></div>
            Elimination zone
          </div>
        </div>
        <table class="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th style="text-align:left;">Team</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>PTS</th>
              <th>NRR</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  buildFixturesHTML(league) {
    const fixtures = league.fixtures || [];
    if (!fixtures.length) return Utils.emptyState('No upcoming fixtures scheduled');

    return `
      <div class="fixtures-grid">
        ${fixtures.map(f => `
          <div class="fixture-card">
            <div class="fixture-teams">
              <span class="fixture-team">${this.getTeamEmoji(f.team1)} ${f.team1}</span>
              <span class="fixture-vs">vs</span>
              <span class="fixture-team">${f.team2} ${this.getTeamEmoji(f.team2)}</span>
            </div>
            <div class="fixture-meta">
              <div>${Utils.formatDateTime(f.date)}</div>
              <div class="fixture-venue">📍 ${f.venue || 'TBD'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  buildTopPlayersHTML(league) {
    const players = league.topPlayers || [];
    if (!players.length) return Utils.emptyState('No player data available');

    const rows = players.map((p, idx) => {
      const roleClass = p.role?.toLowerCase().includes('bowl') ? 'role-bowler' :
                        p.role?.toLowerCase().includes('all') ? 'role-allrounder' : 'role-batsman';

      return `
        <tr>
          <td>
            ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
          </td>
          <td>
            <div>
              <strong>${p.name}</strong>
              <div><span class="role-badge ${roleClass}">${p.role}</span></div>
            </div>
          </td>
          <td>${p.runs > 0 ? `<strong>${p.runs}</strong> runs` : '--'}</td>
          <td>${p.wickets > 0 ? `<strong>${p.wickets}</strong> wkts` : '--'}</td>
        </tr>
      `;
    }).join('');

    return `
      <table class="top-players-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Runs</th>
            <th>Wickets</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  getTeamEmoji(team = '') {
    const t = team.toLowerCase();
    const emojis = {
      'mumbai indians': '🔵', 'mi': '🔵',
      'chennai super kings': '💛', 'csk': '💛',
      'royal challengers': '🔴', 'rcb': '🔴',
      'kolkata knight riders': '🟣', 'kkr': '🟣',
      'delhi capitals': '💙', 'dc': '💙',
      'punjab kings': '❤️', 'pbks': '❤️',
      'rajasthan royals': '🩷', 'rr': '🩷',
      'sunrisers hyderabad': '🟠', 'srh': '🟠',
      'melbourne stars': '⭐', 'stars': '⭐',
      'sydney sixers': '💚', 'sixers': '💚',
      'perth scorchers': '🔥', 'scorchers': '🔥',
      'trinbago knight riders': '🟣', 'tkr': '🟣',
      'barbados royals': '🩷', 'br': '🩷',
      'jamaica tallawahs': '💛', 'jt': '💛',
      'guyana amazon warriors': '🌿', 'gaw': '🌿'
    };
    return emojis[t] || '🏏';
  },

  // Mini standings for dashboard widget
  async renderMiniStandings() {
    const container = document.getElementById('ipl-mini-standings');
    if (!container) return;

    try {
      const data = await API.getLeagueStandings('ipl');
      const top5 = (data.standings || []).slice(0, 5);

      container.innerHTML = `
        <table class="mini-standings-table">
          <thead>
            <tr><th>Team</th><th>P</th><th>W</th><th>PTS</th></tr>
          </thead>
          <tbody>
            ${top5.map((t, i) => `
              <tr>
                <td>${i < 4 ? '✅' : '❌'} ${t.team.split(' ').slice(-1)[0]}</td>
                <td>${t.p}</td>
                <td>${t.w}</td>
                <td class="pts-cell">${t.pts}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;padding:8px;">Could not load standings</p>';
    }
  }
};

window.LeaguesModule = LeaguesModule;

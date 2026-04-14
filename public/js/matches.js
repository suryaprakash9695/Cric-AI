/* ============================================
   CricketVerse – Matches Module
   ============================================ */

const MatchesModule = {
  allMatches: [],
  currentFilter: 'all',
  refreshInterval: null,
  REFRESH_INTERVAL_MS: 30000,

  async init() {
    await this.loadMatches();
    this.bindFilterButtons();
    this.startAutoRefresh();
  },

  async loadMatches() {
    try {
      const data = await API.getLiveMatches();
      this.allMatches = data.matches || [];
      this.renderDashboardMatches();
      this.renderLiveMatchesPage();
      this.updateStats();
      this.updateLiveTicker();
      this.updateLiveBadge();
    } catch (err) {
      console.error('Failed to load matches:', err);
      document.getElementById('dashboard-matches').innerHTML =
        Utils.errorState('Could not load matches', 'window.refreshLiveMatches()');
      document.getElementById('live-matches-grid').innerHTML =
        Utils.errorState('Could not load matches', 'window.refreshLiveMatches()');
    }
  },

  renderDashboardMatches() {
    const container = document.getElementById('dashboard-matches');
    if (!container) return;

    // Show live + recent (max 6 on dashboard)
    const shown = this.allMatches.slice(0, 6);
    container.innerHTML = shown.length
      ? shown.map(m => this.buildMatchCard(m)).join('')
      : Utils.emptyState('No matches currently available', '🏏');

    container.classList.add('stagger-children');
  },

  renderLiveMatchesPage() {
    const container = document.getElementById('live-matches-grid');
    if (!container) return;
    this.applyFilter(this.currentFilter, container);
  },

  applyFilter(filter, container) {
    this.currentFilter = filter;
    let filtered = this.allMatches;

    if (filter === 'live') {
      filtered = this.allMatches.filter(m => m.ms === 'live' || (m.matchStarted && !m.matchEnded));
    } else if (filter === 'upcoming') {
      filtered = this.allMatches.filter(m => m.ms === 'upcoming' || !m.matchStarted);
    } else if (filter === 'result') {
      filtered = this.allMatches.filter(m => m.ms === 'result' || m.matchEnded);
    } else if (['test', 'odi', 't20'].includes(filter)) {
      filtered = this.allMatches.filter(m =>
        (m.matchType || '').toLowerCase().includes(filter)
      );
    }

    if (container) {
      container.innerHTML = filtered.length
        ? filtered.map(m => this.buildMatchCard(m, true)).join('')
        : Utils.emptyState(`No ${filter} matches found`, '🏏');
      container.classList.add('stagger-children');
    }
  },

  buildMatchCard(match, large = false) {
    const status = Utils.getStatusClass(match);
    const statusLabel = Utils.getStatusLabel(match);
    const format = (match.matchType || 'cricket').toUpperCase();
    const teams = match.teamInfo || [];
    const scores = match.score || [];
    const isLive = status === 'live';
    const truncatedName = match.name || 'Match';
    const venue = match.venue || 'Venue TBD';

    const renderTeamRow = (teamName, idx) => {
      const teamInfo = teams.find(t => t.name === teamName) || teams[idx] || {};
      const score = scores[idx] || {};
      const flagImg = teamInfo.img
        ? `<img src="${teamInfo.img}" alt="${teamName}" class="team-flag" onerror="this.outerHTML='<span class=team-flag-placeholder>${Utils.getFlagEmoji(teamName)}</span>'">`
        : `<span class="team-flag-placeholder">${Utils.getFlagEmoji(teamName)}</span>`;

      const runsDisplay = score.r !== undefined
        ? `<span class="score-runs">${score.r}/${score.w ?? 0}</span>
           <span class="score-overs">${score.o ? `(${score.o} ov)` : ''}</span>`
        : `<span class="score-runs" style="color:var(--text-muted)">--</span>`;

      return `
        <div class="team-row">
          <div class="team-identity">
            ${flagImg}
            <div>
              <div class="team-name">${teamName}</div>
              <div class="team-shortname">${teamInfo.shortname || ''}</div>
            </div>
          </div>
          <div class="team-score">${runsDisplay}</div>
        </div>
      `;
    };

    const team1 = match.teams?.[0] || 'Team 1';
    const team2 = match.teams?.[1] || 'Team 2';

    return `
      <div class="match-card ${isLive ? 'live-match hover-float' : 'hover-float'} animate-fade-in"
           onclick="MatchesModule.openScorecard('${match.id}')"
           role="button" tabindex="0"
           aria-label="${match.name}">
        <div class="match-card-header">
          <span class="match-type-badge ${status}">${statusLabel}</span>
          <span class="match-format" style="${Utils.getFormatBadgeStyle(format)};padding:3px 8px;border-radius:20px;font-size:0.65rem;font-weight:700;">${format}</span>
        </div>
        <div class="match-teams">
          ${renderTeamRow(team1, 0)}
          <div class="match-divider"></div>
          ${renderTeamRow(team2, 1)}
        </div>
        <div class="match-status ${isLive ? 'live-status' : ''}">
          ${match.status || 'Match in progress'}
        </div>
        <div class="match-footer">
          <span class="match-venue">📍 ${Utils.truncate(venue, 45)}</span>
          <button class="match-action-btn" onclick="event.stopPropagation();MatchesModule.openScorecard('${match.id}')">
            ${isLive ? 'Live →' : 'Details →'}
          </button>
        </div>
      </div>
    `;
  },

  async openScorecard(matchId) {
    const modal = document.getElementById('scorecard-modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    modal.classList.add('active');
    modalBody.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div class="cricket-ball-loader" style="width:50px;height:50px;margin:0 auto 16px;"></div>
        <p style="color:var(--text-secondary);">Loading scorecard...</p>
      </div>
    `;

    try {
      const [matchData, scorecardData] = await Promise.allSettled([
        API.getMatchInfo(matchId),
        API.getMatchScorecard(matchId)
      ]);

      const match = matchData.value?.data || this.allMatches.find(m => m.id === matchId) || {};
      const scorecard = scorecardData.value?.data || {};

      modalTitle.textContent = match.name || 'Match Scorecard';
      modalBody.innerHTML = this.buildScorecardHTML(match, scorecard);
    } catch (err) {
      modalBody.innerHTML = Utils.errorState('Failed to load scorecard');
    }
  },

  buildScorecardHTML(match, scorecard) {
    const status = Utils.getStatusClass(match);
    const team1 = match.teams?.[0] || 'Team 1';
    const team2 = match.teams?.[1] || 'Team 2';

    let inningsHTML = '';
    if (scorecard.innings?.length) {
      inningsHTML = scorecard.innings.map(inn => `
        <div class="inning-section">
          <div class="inning-header">
            <span>${inn.inning}</span>
            <span class="inning-total">${inn.total?.r || 0}/${inn.total?.w || 0} (${inn.total?.o || 0} ov)</span>
          </div>
          ${inn.batsman?.length ? `
            <table class="scorecard-table">
              <thead>
                <tr>
                  <th>Batsman</th>
                  <th>Dismissal</th>
                  <th>R</th><th>B</th>
                  <th>4s</th><th>6s</th><th>SR</th>
                </tr>
              </thead>
              <tbody>
                ${inn.batsman.map(b => `
                  <tr>
                    <td><strong>${b.name}</strong></td>
                    <td class="dismissal">${b.dismissal || 'not out'}</td>
                    <td><strong>${b.r}</strong></td>
                    <td>${b.b}</td>
                    <td>${b.fours}</td>
                    <td>${b.sixes}</td>
                    <td>${b.sr}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          ${inn.bowlers?.length ? `
            <div class="bowling-section-label">Bowling</div>
            <table class="scorecard-table">
              <thead>
                <tr>
                  <th>Bowler</th><th>O</th><th>M</th>
                  <th>R</th><th>W</th><th>Econ</th>
                </tr>
              </thead>
              <tbody>
                ${inn.bowlers.map(b => `
                  <tr>
                    <td><strong>${b.name}</strong></td>
                    <td>${b.o}</td><td>${b.m}</td>
                    <td>${b.r}</td>
                    <td><strong style="color:var(--accent-primary)">${b.w}</strong></td>
                    <td>${b.econ}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
        </div>
      `).join('');
    } else {
      inningsHTML = `
        <div style="padding:20px;text-align:center;color:var(--text-secondary);">
          <p>Scorecard data not yet available for this match</p>
        </div>
      `;
    }

    return `
      <div class="scorecard-wrapper">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
          <div>
            <div style="font-weight:800;font-size:1.1rem;">${team1} <span style="color:var(--text-muted)">vs</span> ${team2}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:3px;">📍 ${match.venue || 'N/A'} • ${Utils.formatDate(match.date)}</div>
          </div>
          <span class="match-type-badge ${status}">${Utils.getStatusLabel(match)}</span>
        </div>
        <div style="background:rgba(0,212,255,0.06);border:1px solid var(--border-accent);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:0.85rem;color:var(--accent-primary);font-weight:600;">
          ${match.status || 'Match in progress'}
        </div>
        ${inningsHTML}
      </div>
    `;
  },

  updateStats() {
    const live = this.allMatches.filter(m => m.ms === 'live' || (m.matchStarted && !m.matchEnded)).length;
    const upcoming = this.allMatches.filter(m => m.ms === 'upcoming' || !m.matchStarted).length;
    const completed = this.allMatches.filter(m => m.ms === 'result' || m.matchEnded).length;

    const liveEl = document.getElementById('stat-live-count');
    const upEl = document.getElementById('stat-upcoming-count');
    const comEl = document.getElementById('stat-completed-count');
    const badge = document.getElementById('live-count-badge');

    if (liveEl) Utils.animateCounter(liveEl, live);
    if (upEl) Utils.animateCounter(upEl, upcoming);
    if (comEl) Utils.animateCounter(comEl, completed);
    if (badge) badge.textContent = live;
  },

  updateLiveTicker() {
    const ticker = document.getElementById('ticker-content');
    if (!ticker || !this.allMatches.length) return;

    const liveMatches = this.allMatches.filter(m =>
      m.ms === 'live' || (m.matchStarted && !m.matchEnded)
    );

    if (!liveMatches.length) {
      ticker.innerHTML = '<span>No live matches right now</span>';
      return;
    }

    const tickerText = liveMatches.map(m => {
      const score = Utils.formatScore(m.score);
      return `${m.teams?.[0] || 'Team A'} vs ${m.teams?.[1] || 'Team B'}: ${score} • ${m.status || ''}`;
    }).join('   ◆   ');

    ticker.innerHTML = `<span>${tickerText}</span>`;
  },

  updateLiveBadge() {
    const liveCount = this.allMatches.filter(m =>
      m.ms === 'live' || (m.matchStarted && !m.matchEnded)
    ).length;
    const badge = document.getElementById('live-count-badge');
    if (badge) badge.textContent = liveCount;
  },

  bindFilterButtons() {
    document.querySelectorAll('#page-live .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#page-live .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const container = document.getElementById('live-matches-grid');
        this.applyFilter(btn.dataset.filter, container);
      });
    });

    // Close modal
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      document.getElementById('scorecard-modal').classList.remove('active');
    });

    document.getElementById('scorecard-modal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
    });
  },

  startAutoRefresh() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      this.loadMatches();
    }, this.REFRESH_INTERVAL_MS);
  },

  stopAutoRefresh() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
};

// Global refresh function
window.refreshLiveMatches = async () => {
  const btn = document.getElementById('refresh-btn');
  if (btn) {
    btn.querySelector('.refresh-icon').style.animation = 'spin 0.8s linear infinite';
  }
  await MatchesModule.loadMatches();
  if (btn) {
    btn.querySelector('.refresh-icon').style.animation = '';
  }
  Notifications.success('Matches Refreshed', 'Live data updated successfully');
};

window.MatchesModule = MatchesModule;

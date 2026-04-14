/* ============================================
   CricketVerse – Players Module
   ============================================ */

const PlayersModule = {
  featuredPlayers: [],
  searchResults: [],

  async init() {
    await this.loadFeaturedPlayers();
    this.bindEvents();
  },

  async loadFeaturedPlayers() {
    try {
      const data = await API.getTopPlayers();
      this.featuredPlayers = data.players || [];
      this.renderFeaturedPlayers();
    } catch (err) {
      document.getElementById('featured-players-grid').innerHTML =
        Utils.errorState('Could not load players');
    }
  },

  renderFeaturedPlayers() {
    const grid = document.getElementById('featured-players-grid');
    if (!grid) return;
    grid.innerHTML = this.featuredPlayers.map(p => this.buildPlayerCard(p)).join('');
    grid.classList.add('stagger-children');
  },

  buildPlayerCard(player) {
    const stats = player.stats || {};
    const odiStats = stats.odi || {};
    const t20Stats = stats.t20 || {};

    const avatarHtml = player.playerImg
      ? `<img src="${player.playerImg}" alt="${player.name}" class="player-avatar" onerror="this.outerHTML='<div class=player-avatar-placeholder>${Utils.getFlagEmoji(player.country)}</div>'">`
      : `<div class="player-avatar-placeholder">${Utils.getFlagEmoji(player.country)}</div>`;

    return `
      <div class="player-card hover-float animate-fade-in"
           onclick="PlayersModule.openProfile('${player.id}')"
           role="button" tabindex="0"
           aria-label="View ${player.name} profile">
        ${avatarHtml}
        <div class="player-card-name">${player.name}</div>
        <div class="player-card-country">${Utils.getFlagEmoji(player.country)} ${player.country}</div>
        <div class="player-card-role">${player.role || 'Cricketer'}</div>
        <div class="player-quick-stats">
          <div class="player-quick-stat">
            <span class="player-quick-stat-val">${odiStats.runs ? Utils.formatNumber(odiStats.runs) : '--'}</span>
            <span class="player-quick-stat-label">ODI Runs</span>
          </div>
          <div class="player-quick-stat">
            <span class="player-quick-stat-val">${odiStats.avg || '--'}</span>
            <span class="player-quick-stat-label">Average</span>
          </div>
          <div class="player-quick-stat">
            <span class="player-quick-stat-val">${odiStats.centuries || '--'}</span>
            <span class="player-quick-stat-label">100s</span>
          </div>
        </div>
      </div>
    `;
  },

  async openProfile(playerId) {
    const modal = document.getElementById('player-modal');
    const modalBody = document.getElementById('player-modal-body');
    const modalTitle = document.getElementById('player-modal-title');

    modal.classList.add('active');
    modalBody.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div class="cricket-ball-loader" style="width:50px;height:50px;margin:0 auto 16px;"></div>
        <p style="color:var(--text-secondary);">Loading player profile...</p>
      </div>
    `;

    try {
      const data = await API.getPlayer(playerId);
      const player = data.player;
      modalTitle.textContent = `${player.name} – Player Profile`;
      modalBody.innerHTML = this.buildProfileHTML(player);
      this.initFormatTabs();
      // Load performance chart
      this.loadPerformanceChart(playerId);
    } catch (err) {
      modalBody.innerHTML = Utils.errorState('Could not load player profile');
    }
  },

  buildProfileHTML(player) {
    const stats = player.stats || {};
    const formats = ['test', 'odi', 't20'];

    const avatarHtml = player.playerImg
      ? `<img src="${player.playerImg}" alt="${player.name}" class="player-profile-img" onerror="this.style.display='none'">`
      : `<div class="player-avatar-placeholder" style="width:100px;height:100px;font-size:2.5rem;">${Utils.getFlagEmoji(player.country)}</div>`;

    const formatStatsHtml = (format) => {
      const s = stats[format] || {};
      if (!Object.keys(s).length) return `<p style="color:var(--text-muted);text-align:center;padding:20px;">No ${format.toUpperCase()} data available</p>`;

      return `
        <table class="stats-table">
          <thead>
            <tr>
              <th>Matches</th><th>Runs</th><th>Avg</th>
              <th>SR</th><th>100s</th><th>50s</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${s.matches || 0}</td>
              <td class="highlight">${Utils.formatNumber(s.runs || 0)}</td>
              <td>${s.avg || '--'}</td>
              <td>${s.sr || '--'}</td>
              <td class="highlight">${s.centuries || 0}</td>
              <td>${s.fifties || 0}</td>
            </tr>
          </tbody>
        </table>
      `;
    };

    return `
      <div class="player-profile-header">
        ${avatarHtml}
        <div>
          <div class="player-profile-name">${player.name}</div>
          <div class="player-profile-meta">
            ${Utils.getFlagEmoji(player.country)} ${player.country} 
            ${player.role ? `• <strong>${player.role}</strong>` : ''}
          </div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
            ${player.battingStyle ? `<span style="font-size:0.75rem;color:var(--text-secondary)">🏏 ${player.battingStyle}</span>` : ''}
            ${player.bowlingStyle ? `<span style="font-size:0.75rem;color:var(--text-secondary)">🎳 ${player.bowlingStyle}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="format-tabs">
        ${formats.map((f, i) => `
          <button class="format-tab-btn ${i === 0 ? 'active' : ''}" 
                  data-format="${f}" 
                  onclick="PlayersModule.switchFormatTab('${f}')">
            ${f.toUpperCase()}
          </button>
        `).join('')}
      </div>

      ${formats.map(f => `
        <div class="format-stats-panel" data-panel="${f}" ${f !== 'test' ? 'style="display:none"' : ''}>
          ${formatStatsHtml(f)}
        </div>
      `).join('')}

      <div style="margin-top:20px;">
        <h4 style="font-weight:700;margin-bottom:12px;font-size:0.9rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em;">
          📊 Recent Form (Last 5 Matches)
        </h4>
        <div id="recent-form-chart" style="height:180px;background:var(--bg-secondary);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);">
          <canvas id="player-perf-canvas"></canvas>
        </div>
      </div>
    `;
  },

  switchFormatTab(format) {
    document.querySelectorAll('.format-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.format === format);
    });
    document.querySelectorAll('.format-stats-panel').forEach(panel => {
      panel.style.display = panel.dataset.panel === format ? 'block' : 'none';
    });
  },

  initFormatTabs() {
    // Already handled via onclick in HTML
  },

  async loadPerformanceChart(playerId) {
    try {
      const data = await API.getPlayerPerformance(playerId);
      const canvas = document.getElementById('player-perf-canvas');
      if (!canvas || !data.last5) return;

      canvas.style.width = '100%';
      canvas.style.height = '160px';

      const labels = data.last5.map(m => m.match);
      const runs = data.last5.map(m => m.runs);

      if (window._playerChart) window._playerChart.destroy();

      window._playerChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Runs',
            data: runs,
            backgroundColor: runs.map(r =>
              r >= 100 ? 'rgba(255,215,0,0.8)' :
              r >= 50 ? 'rgba(0,212,255,0.7)' :
              'rgba(0,212,255,0.35)'
            ),
            borderColor: 'rgba(0,212,255,0.6)',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#8892a4', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#8892a4', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true }
          }
        }
      });
    } catch (err) {
      console.warn('Could not load performance chart:', err);
    }
  },

  async search(query) {
    if (!query || query.length < 2) return;

    const resultsDiv = document.getElementById('player-search-results');
    if (resultsDiv) {
      resultsDiv.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-secondary);">Searching...</div>`;
    }

    try {
      const data = await API.searchPlayers(query);
      this.searchResults = data.players || [];

      if (resultsDiv) {
        if (!this.searchResults.length) {
          resultsDiv.innerHTML = Utils.emptyState(`No players found for "${query}"`, '👤');
          return;
        }
        resultsDiv.innerHTML = `
          <h3 style="margin-bottom:16px;font-size:0.9rem;color:var(--text-secondary);">
            Found ${this.searchResults.length} player(s) for "${query}"
          </h3>
          <div class="players-grid stagger-children">
            ${this.searchResults.map(p => this.buildPlayerCard(p)).join('')}
          </div>
        `;
      }
    } catch (err) {
      if (resultsDiv) resultsDiv.innerHTML = Utils.errorState('Search failed. Try again.');
    }
  },

  bindEvents() {
    const searchInput = document.getElementById('player-search-input');
    const searchBtn = document.getElementById('player-search-btn');
    const closeBtn = document.getElementById('player-modal-close');
    const modal = document.getElementById('player-modal');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const q = searchInput?.value.trim();
        if (q) this.search(q);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim();
          if (q) this.search(q);
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (modal) modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
};

window.PlayersModule = PlayersModule;

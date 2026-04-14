/* ============================================
   CricketVerse – Main App Orchestrator
   ============================================ */

const App = {
  currentPage: 'dashboard',
  pageHistory: [],
  isInitialized: false,

  // Page → module initializer map
  PAGE_MODULES: {
    dashboard: () => App.initDashboard(),
    live: () => App.initLivePage(),
    historical: () => App.initHistoricalPage(),
    ipl: () => LeaguesModule.loadLeague('ipl'),
    bbl: () => LeaguesModule.loadLeague('bbl'),
    cpl: () => LeaguesModule.loadLeague('cpl'),
    players: () => PlayersModule.init(),
    analytics: () => AnalyticsModule.init(),
    map: () => MapModule.init(),
    news: () => NewsModule.init()
  },

  async boot() {
    // Update loading progress
    this.updateLoadingProgress();

    try {
      // Initialize modules that are always needed
      Notifications.init();
      this.bindNavigation();
      this.bindSearch();
      this.bindThemeToggle();
      this.bindSidebar();
      this.bindMobileMenu();
      this.startClock();
      this.populateYearFilter();

      // Init dashboard (first page)
      await this.initDashboard();

      this.isInitialized = true;
    } catch (err) {
      console.error('App boot error:', err);
      Notifications.error('Startup Error', 'Some features may not load correctly.');
    } finally {
      // Hide loading screen
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.classList.add('hidden');
      }, 800);
    }

    // Start demo notifications after a delay
    setTimeout(() => Notifications.startSimulation(), 5000);
  },

  updateLoadingProgress() {
    // Already animated via CSS, just log
    console.info('🏏 CricketVerse booting...');
  },

  // ============ NAVIGATION ============

  bindNavigation() {
    document.querySelectorAll('.nav-item[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(link.dataset.page);
      });
    });
  },

  async navigateTo(page) {
    if (page === this.currentPage && this.isInitialized) return;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Hide all pages, show target
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
      targetPage.classList.add('active');
      targetPage.classList.add('page-enter');
      setTimeout(() => targetPage.classList.remove('page-enter'), 400);
    }

    // Update breadcrumb
    this.updateBreadcrumb(page);

    // Close mobile sidebar
    this.closeMobileSidebar();

    // Run page module initializer
    const initFn = this.PAGE_MODULES[page];
    if (initFn) {
      try {
        await initFn();
      } catch (err) {
        console.error(`Page init error [${page}]:`, err.message);
      }
    }

    this.pageHistory.push(this.currentPage);
    this.currentPage = page;
  },

  updateBreadcrumb(page) {
    const labels = {
      dashboard: '🏠 Dashboard',
      live: '🔴 Live Matches',
      historical: '📚 Historical Explorer',
      ipl: '🏆 IPL 2025',
      bbl: '🌟 Big Bash League',
      cpl: '🌴 Caribbean Premier League',
      players: '👤 Player Profiles',
      analytics: '📈 Analytics Hub',
      map: '🗺️ Stadium Map',
      news: '📰 Cricket News'
    };
    const el = document.getElementById('current-page-title');
    if (el) el.textContent = labels[page] || page;
  },

  // ============ DASHBOARD ============

  async initDashboard() {
    // Load matches (handles its own rendering)
    await MatchesModule.loadMatches();

    // Load mini news
    await NewsModule.loadNews('all', 1);

    // Load mini IPL standings
    await LeaguesModule.renderMiniStandings();

    // Load win probability widget
    AnalyticsModule.loadWinProbWidget();
  },

  // ============ LIVE PAGE ============

  initLivePage() {
    // Matches already loaded; just re-render with all matches
    MatchesModule.renderLiveMatchesPage();
  },

  // ============ HISTORICAL PAGE ============

  initHistoricalPage() {
    // Render empty state with search prompt
    const results = document.getElementById('historical-results');
    if (results && !results.hasChildNodes()) {
      results.innerHTML = `
        <div style="text-align:center;padding:60px;color:var(--text-secondary);">
          <div style="font-size:3rem;margin-bottom:16px;">📚</div>
          <p style="font-size:1rem;margin-bottom:8px;">Use the filters above to explore historical match data</p>
          <p style="font-size:0.85rem;color:var(--text-muted);">Data sourced from Cricsheet database</p>
        </div>
      `;
    }
  },

  // ============ SEARCH ============

  bindSearch() {
    const input = document.getElementById('global-search');
    const dropdown = document.getElementById('search-dropdown');
    if (!input || !dropdown) return;

    const performSearch = Utils.debounce(async (q) => {
      if (q.length < 2) { dropdown.classList.remove('active'); return; }

      dropdown.classList.add('active');
      dropdown.innerHTML = `<div class="search-result-item" style="color:var(--text-muted);">Searching...</div>`;

      try {
        const data = await API.searchPlayers(q);
        const players = (data.players || []).slice(0, 6);

        if (!players.length) {
          dropdown.innerHTML = `<div class="search-result-item" style="color:var(--text-muted);">No results for "${q}"</div>`;
          return;
        }

        dropdown.innerHTML = players.map(p => `
          <div class="search-result-item"
               onclick="App.handleSearchSelect('${p.id}', '${p.name}')"
               role="option">
            <span style="font-size:1.2rem;">${Utils.getFlagEmoji(p.country)}</span>
            <div>
              <div style="font-weight:600;font-size:0.85rem;">${p.name}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${p.country} • ${p.role || 'Player'}</div>
            </div>
          </div>
        `).join('');
      } catch {
        dropdown.innerHTML = `<div class="search-result-item" style="color:var(--text-muted);">Search unavailable</div>`;
      }
    }, 400);

    input.addEventListener('input', (e) => performSearch(e.target.value.trim()));

    input.addEventListener('focus', () => {
      if (input.value.length >= 2) dropdown.classList.add('active');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('active');
        input.blur();
      }
      if (e.key === 'Enter' && input.value.trim().length >= 2) {
        dropdown.classList.remove('active');
        this.navigateTo('players');
        setTimeout(() => {
          const pi = document.getElementById('player-search-input');
          if (pi) {
            pi.value = input.value;
            PlayersModule.search(input.value);
          }
        }, 300);
      }
    });
  },

  async handleSearchSelect(playerId, playerName) {
    const dropdown = document.getElementById('search-dropdown');
    const input = document.getElementById('global-search');
    if (dropdown) dropdown.classList.remove('active');
    if (input) input.value = playerName;

    await this.navigateTo('players');
    setTimeout(() => PlayersModule.openProfile(playerId), 300);
  },

  // ============ THEME ============

  bindThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    const savedTheme = localStorage.getItem('cv-theme') || 'dark';
    this.applyTheme(savedTheme);

    btn.addEventListener('click', () => {
      const current = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
      localStorage.setItem('cv-theme', next);
    });
  },

  applyTheme(theme) {
    document.body.classList.toggle('light-mode', theme === 'light');
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const icon = btn.querySelector('.moon-icon');
      if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  },

  // ============ SIDEBAR ============

  bindSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('cv-sidebar', sidebar.classList.contains('collapsed') ? 'collapsed' : 'open');
    });

    // Restore saved state
    const saved = localStorage.getItem('cv-sidebar');
    if (saved === 'collapsed') sidebar.classList.add('collapsed');
  },

  bindMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn) menuBtn.addEventListener('click', () => this.openMobileSidebar());
    if (overlay) overlay.addEventListener('click', () => this.closeMobileSidebar());
  },

  openMobileSidebar() {
    document.getElementById('sidebar')?.classList.add('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeMobileSidebar() {
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.remove('active');
    document.body.style.overflow = '';
  },

  // ============ CLOCK ============

  startClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;

    const updateClock = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    };

    updateClock();
    setInterval(updateClock, 1000);
  },

  // ============ YEAR FILTER ============

  populateYearFilter() {
    const select = document.getElementById('hist-year');
    if (select) select.innerHTML = Utils.generateYearOptions(1975, new Date().getFullYear());
  }
};

// ============ HISTORICAL DATA LOADER ============

window.loadHistoricalData = async () => {
  const year = document.getElementById('hist-year')?.value;
  const team = document.getElementById('hist-team')?.value;
  const format = document.getElementById('hist-format')?.value;
  const tournament = document.getElementById('hist-tournament')?.value;

  const resultsDiv = document.getElementById('historical-results');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = `
    <div style="text-align:center;padding:40px;">
      <div class="cricket-ball-loader" style="width:50px;height:50px;margin:0 auto 16px;"></div>
      <p style="color:var(--text-secondary);">Searching Cricsheet database...</p>
    </div>
  `;

  // Generate mock historical data
  await new Promise(r => setTimeout(r, 800));

  const tourney = tournament || 'International Series';
  const teamName = team || 'Various Teams';
  const yearLabel = year || '2000-2025';

  const mockResults = Array.from({ length: 8 }, (_, i) => {
    const teams = [
      ['India', 'Australia'], ['England', 'Pakistan'], ['South Africa', 'New Zealand'],
      ['West Indies', 'Sri Lanka'], ['Bangladesh', 'Zimbabwe'], ['India', 'England'],
      ['Australia', 'Pakistan'], ['South Africa', 'West Indies']
    ];
    const [t1, t2] = teams[i % teams.length];
    const formats = ['Test', 'ODI', 'T20I'];
    const fmt = format ? format.toUpperCase() : formats[i % 3];
    const runs1 = Math.floor(Math.random() * 200) + 150;
    const runs2 = Math.floor(Math.random() * 200) + 120;
    const winner = runs1 > runs2 ? t1 : t2;
    const margin = Math.abs(runs1 - runs2);
    const gameYear = year || (2000 + Math.floor(Math.random() * 25));

    return {
      id: `hist-${i}`,
      name: `${t1} vs ${t2} – ${fmt}`,
      date: new Date(parseInt(gameYear), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      venue: ['MCG, Melbourne', "Lord's, London", 'Eden Gardens, Kolkata', 'Newlands, Cape Town', 'SSC, Colombo'][i % 5],
      result: `${winner} won by ${margin} runs`,
      team1: t1, team2: t2,
      score1: `${runs1}/${Math.floor(Math.random() * 5) + 5}`,
      score2: `${runs2}/10`,
      format: fmt,
      tournament: tournament ? tournament.replace(/_/g, ' ').toUpperCase() : 'International'
    };
  });

  // Filter by team if specified
  const filtered = team
    ? mockResults.filter(m => m.team1 === team || m.team2 === team)
    : mockResults;

  if (!filtered.length) {
    resultsDiv.innerHTML = Utils.emptyState(`No matches found for selected filters`, '📭');
    Notifications.warning('No Results', 'Try adjusting your search filters');
    return;
  }

  resultsDiv.innerHTML = `
    <div style="margin-bottom:16px;color:var(--text-secondary);font-size:0.85rem;">
      Found <strong style="color:var(--text-primary);">${filtered.length}</strong> matches
      ${team ? `for <strong style="color:var(--accent-primary);">${team}</strong>` : ''}
      ${year ? `in <strong style="color:var(--accent-primary);">${year}</strong>` : ''}
    </div>
    <div class="stagger-children">
      ${filtered.map(m => `
        <div class="historical-match-card hover-float">
          <div class="hist-match-header">
            <div class="hist-match-name">🏏 ${m.name}</div>
            <div class="hist-match-date">${Utils.formatDate(m.date)}</div>
          </div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:10px;">
            <div class="hist-stat-box" style="flex:1;min-width:100px;background:var(--bg-secondary);border-radius:8px;padding:10px;text-align:center;">
              <span class="hist-stat-val">${m.score1}</span>
              <span class="hist-stat-label">${m.team1}</span>
            </div>
            <div style="display:flex;align-items:center;padding:0 8px;color:var(--text-muted);">vs</div>  
            <div class="hist-stat-box" style="flex:1;min-width:100px;background:var(--bg-secondary);border-radius:8px;padding:10px;text-align:center;">
              <span class="hist-stat-val">${m.score2}</span>
              <span class="hist-stat-label">${m.team2}</span>
            </div>
          </div>
          <div class="hist-match-result">🏆 ${m.result}</div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;flex-wrap:wrap;gap:6px;">
            <div class="hist-match-venue">📍 ${m.venue}</div>
            <div style="font-size:0.72rem;">
              <span style="${Utils.getFormatBadgeStyle(m.format)};padding:2px 8px;border-radius:10px;font-size:0.65rem;font-weight:700;">${m.format}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  Notifications.success('Matches Found', `Showing ${filtered.length} historical matches`);
};

// ============ GLOBAL HELPERS ============

window.navigateTo = (page) => App.navigateTo(page);

// ============ DOM READY ============

document.addEventListener('DOMContentLoaded', () => {
  App.boot();
});

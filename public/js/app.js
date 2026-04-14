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

  // Strict live data policy applies. We use an empty state pointing to the API restriction.
  resultsDiv.innerHTML = Utils.emptyState(`Historical data API not currently enabled.`, '📭');
  Notifications.warning('No live historical data', 'Historical datasets require premium or specific historical endpoints.');
  return;
};

// ============ GLOBAL HELPERS ============

window.navigateTo = (page) => App.navigateTo(page);

// ============ DOM READY ============

document.addEventListener('DOMContentLoaded', () => {
  App.boot();
});

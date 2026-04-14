/* ============================================
   CricketVerse – Stadium Map Module (Leaflet.js)
   ============================================ */

const MapModule = {
  map: null,
  markers: [],
  stadiums: [],
  initialized: false,

  async init() {
    if (this.initialized) return;
    await this.loadStadiums();
    this.initMap();
    this.renderStadiumList();
    this.initialized = true;
  },

  async loadStadiums() {
    try {
      const data = await API.getStadiums();
      this.stadiums = data.stadiums || [];
    } catch (err) {
      console.warn('Could not load stadiums:', err);
      this.stadiums = [];
    }
  },

  initMap() {
    const mapEl = document.getElementById('cricket-map');
    if (!mapEl || !window.L) return;

    // Destroy existing map instance if any
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Initialize map centered on cricket world
    this.map = L.map('cricket-map', {
      center: [20, 75],
      zoom: 2,
      minZoom: 2,
      maxZoom: 15,
      zoomControl: true
    });

    // Add dark tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add stadium markers
    this.stadiums.forEach(stadium => this.addMarker(stadium));

    // Add fullscreen-like interaction
    mapEl.style.cursor = 'grab';
  },

  addMarker(stadium) {
    if (!this.map || !window.L) return;

    // Create custom cricket icon
    const cricketIcon = L.divIcon({
      className: '',
      html: `
        <div style="
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #00d4ff, #7c3aed);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 12px rgba(0,0,0,0.5);
          border: 2px solid rgba(255,255,255,0.2);
          cursor: pointer;
        ">
          <span style="transform: rotate(45deg); font-size: 14px;">🏟️</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([stadium.lat, stadium.lng], { icon: cricketIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="min-width:180px;font-family:'Inter',sans-serif;">
          <div class="map-popup-name">🏟️ ${stadium.name}</div>
          <div class="map-popup-meta">📍 ${stadium.city}, ${stadium.country}</div>
          <div class="map-popup-meta" style="margin-top:4px;">
            👥 Capacity: ${stadium.capacity?.toLocaleString() || 'N/A'}
          </div>
          <div class="map-popup-matches">🏏 ${stadium.matches} Tests / ODIs played</div>
          <button onclick="MapModule.showStadiumDetail(${stadium.id})"
            style="margin-top:10px;width:100%;background:linear-gradient(135deg,#00d4ff,#7c3aed);color:white;border:none;padding:7px;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px;font-family:inherit;">
            View Details
          </button>
        </div>
      `, {
        maxWidth: 250
      });

    marker.on('click', () => this.showStadiumDetail(stadium.id));
    this.markers.push({ marker, stadiumId: stadium.id });
  },

  async showStadiumDetail(stadiumId) {
    const panel = document.getElementById('stadium-info-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div class="cricket-ball-loader" style="width:40px;height:40px;margin:0 auto 12px;"></div>
        <p style="color:var(--text-secondary);font-size:0.85rem;">Loading stadium info...</p>
      </div>
    `;

    try {
      const data = await API.getStadium(stadiumId);
      const s = data.stadium;
      this.renderStadiumPanel(s, panel);

      // Pan map to stadium
      const stadiumData = this.stadiums.find(st => st.id === stadiumId);
      if (stadiumData && this.map) {
        this.map.flyTo([stadiumData.lat, stadiumData.lng], 8, { duration: 1.5 });
      }
    } catch (err) {
      panel.innerHTML = Utils.errorState('Could not load stadium details');
    }
  },

  renderStadiumPanel(stadium, panel) {
    const records = stadium.records || {};
    const recentMatches = stadium.recentMatches || [];

    panel.innerHTML = `
      <div class="stadium-detail">
        <div class="stadium-detail-header">
          <div class="stadium-detail-name">🏟️ ${stadium.name}</div>
          <div class="stadium-detail-location">📍 ${stadium.city}, ${stadium.country}</div>
        </div>

        <div class="stadium-stats-mini">
          <div class="stadium-stat-item">
            <span class="stadium-stat-val">${stadium.capacity?.toLocaleString() || 'N/A'}</span>
            <span class="stadium-stat-label">Capacity</span>
          </div>
          <div class="stadium-stat-item">
            <span class="stadium-stat-val">${stadium.matches || 0}</span>
            <span class="stadium-stat-label">Matches</span>
          </div>
        </div>

        ${records && Object.keys(records).length ? `
          <div class="stadium-records">
            <div class="stadium-records-title">📊 Ground Records</div>
            ${records.highestScore ? `
              <div class="record-item">
                <span class="record-label">Highest Score</span>
                <span class="record-value">${records.highestScore}</span>
              </div>
            ` : ''}
            ${records.lowestScore ? `
              <div class="record-item">
                <span class="record-label">Lowest Score</span>
                <span class="record-value">${records.lowestScore}</span>
              </div>
            ` : ''}
            ${records.mostRuns ? `
              <div class="record-item">
                <span class="record-label">Most Runs</span>
                <span class="record-value">${records.mostRuns.player}: ${records.mostRuns.runs}</span>
              </div>
            ` : ''}
            ${records.mostWickets ? `
              <div class="record-item">
                <span class="record-label">Most Wickets</span>
                <span class="record-value">${records.mostWickets.player}: ${records.mostWickets.wickets}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${recentMatches.length ? `
          <div class="stadium-recent">
            <div class="stadium-records-title" style="margin-bottom:8px;">🕐 Recent Matches</div>
            ${recentMatches.map(m => `
              <div class="recent-match-item">
                <div class="recent-match-name">${m.match}</div>
                <div class="recent-match-result">${m.result}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  renderStadiumList() {
    const container = document.getElementById('stadiums-list');
    if (!container) return;

    container.innerHTML = `
      <h2 class="section-title" style="grid-column:1/-1;margin-bottom:4px;">🌍 All Cricket Grounds</h2>
      ${this.stadiums.map(s => `
        <div class="stadium-mini-card hover-float animate-fade-in"
             onclick="MapModule.showStadiumDetail(${s.id})"
             role="button" tabindex="0">
          <div class="stadium-mini-name">🏟️ ${s.name}</div>
          <div class="stadium-mini-meta">📍 ${s.city}, ${s.country}</div>
          <div class="stadium-mini-meta" style="margin-top:4px;">
            👥 ${s.capacity?.toLocaleString() || 'N/A'} • 🏏 ${s.matches} matches
          </div>
        </div>
      `).join('')}
    `;

    container.classList.add('stagger-children');
  }
};

window.MapModule = MapModule;

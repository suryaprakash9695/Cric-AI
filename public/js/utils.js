/* ============================================
   CricketVerse – Utility Functions
   ============================================ */

const Utils = {
  // Format date
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  // Format date with time
  formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { 
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  // Time ago
  timeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return this.formatDate(dateStr);
  },

  // Format large numbers
  formatNumber(n) {
    if (!n && n !== 0) return '-';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  },

  // Get match status badge class
  getStatusClass(match) {
    const ms = (match.ms || match.status || '').toLowerCase();
    if (ms === 'live' || match.matchStarted && !match.matchEnded) return 'live';
    if (ms === 'upcoming' || ms === 'preview' || !match.matchStarted) return 'upcoming';
    return 'result';
  },

  // Get status display label
  getStatusLabel(match) {
    const ms = (match.ms || '').toLowerCase();
    if (ms === 'live' || (match.matchStarted && !match.matchEnded)) {
      return '<span class="live-dot"></span> LIVE';
    }
    if (ms === 'upcoming' || !match.matchStarted) return '⏳ UPCOMING';
    return '✅ COMPLETED';
  },

  // Get flag emoji for country
  getFlagEmoji(country) {
    const flags = {
      'India': '🇮🇳', 'Australia': '🇦🇺', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Pakistan': '🇵🇰', 'South Africa': '🇿🇦', 'New Zealand': '🇳🇿',
      'West Indies': '🏏', 'Sri Lanka': '🇱🇰', 'Bangladesh': '🇧🇩',
      'Afghanistan': '🇦🇫', 'Zimbabwe': '🇿🇼', 'Ireland': '🇮🇪',
      'Netherlands': '🇳🇱', 'UAE': '🇦🇪', 'USA': '🇺🇸', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Namibia': '🇳🇦', 'Papua New Guinea': '🇵🇬', 'Oman': '🇴🇲'
    };
    return flags[country] || '🏏';
  },

  // Format score display
  formatScore(score) {
    if (!score || !score.length) return '--';
    return score.map(s => `${s.r || 0}/${s.w || 0} (${s.o || 0})`).join(' | ');
  },

  // Calculate run rate
  calcRunRate(runs, overs) {
    if (!overs || overs === 0) return '0.00';
    return (runs / overs).toFixed(2);
  },

  // Get format badge color
  getFormatBadgeStyle(format) {
    const styles = {
      test: 'background:rgba(124,58,237,0.15);color:#a78bfa;border:1px solid rgba(124,58,237,0.3)',
      odi: 'background:rgba(0,212,255,0.1);color:#00d4ff;border:1px solid rgba(0,212,255,0.2)',
      t20: 'background:rgba(255,107,53,0.1);color:#ff6b35;border:1px solid rgba(255,107,53,0.3)',
      t20i: 'background:rgba(255,107,53,0.1);color:#ff6b35;border:1px solid rgba(255,107,53,0.3)'
    };
    const f = (format || '').toLowerCase().replace(/\s+/g, '');
    return styles[f] || styles.odi;
  },

  // Safe innerHTML setter  
  setHTML(elementId, html) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = html;
  },

  // Debounce
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  // Deep clone
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Truncate text
  truncate(text, len = 100) {
    if (!text) return '';
    return text.length > len ? text.slice(0, len) + '...' : text;
  },

  // Generate year options
  generateYearOptions(from = 2000, to = new Date().getFullYear()) {
    let html = '<option value="">All Years</option>';
    for (let y = to; y >= from; y--) {
      html += `<option value="${y}">${y}</option>`;
    }
    return html;
  },

  // Animate number counter
  animateCounter(el, target, duration = 600) {
    if (!el) return;
    const start = 0;
    const step = target / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 16);
  },

  // Create element safely
  createElement(tag, classes = '', attrs = {}) {
    const el = document.createElement(tag);
    if (classes) el.className = classes;
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  },

  // Error state HTML
  errorState(message = 'Failed to load data', onRetry) {
    return `
      <div class="error-state" style="text-align:center;padding:40px;color:var(--text-secondary);">
        <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
        <p style="margin-bottom:16px;">${message}</p>
        ${onRetry ? `<button class="btn-primary" onclick="${onRetry}">Try Again</button>` : ''}
      </div>
    `;
  },

  // Empty state HTML  
  emptyState(message = 'No data available', icon = '📭') {
    return `
      <div class="empty-state" style="text-align:center;padding:40px;color:var(--text-secondary);">
        <div style="font-size:2.5rem;margin-bottom:12px;">${icon}</div>
        <p>${message}</p>
      </div>
    `;
  }
};

window.Utils = Utils;

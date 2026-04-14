/* ============================================
   CricketVerse – Notification System Module
   ============================================ */

const Notifications = {
  container: null,
  queue: [],
  activeNotifications: [],
  maxVisible: 4,

  init() {
    this.container = document.getElementById('notification-container');
  },

  // Show a notification
  show(title, body = '', type = 'info', duration = 5000) {
    if (!this.container) this.init();

    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️', wicket: '🎯', milestone: '⭐', match: '🏏' };
    const icon = icons[type] || icons.info;

    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.id = id;
    notif.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        ${body ? `<div class="notification-body">${body}</div>` : ''}
      </div>
      <button onclick="Notifications.dismiss('${id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.9rem;padding:2px 6px;border-radius:4px;" aria-label="Close notification">✕</button>
    `;

    this.container.appendChild(notif);
    this.activeNotifications.push(id);

    // Trim if too many
    if (this.activeNotifications.length > this.maxVisible) {
      this.dismiss(this.activeNotifications[0]);
    }

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  },

  // Dismiss a notification
  dismiss(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hiding');
    setTimeout(() => {
      el.remove();
      this.activeNotifications = this.activeNotifications.filter(n => n !== id);
    }, 300);
  },

  // Shortcut methods
  success(title, body, duration) { return this.show(title, body, 'success', duration); },
  error(title, body, duration) { return this.show(title, body, 'error', duration); },
  info(title, body, duration) { return this.show(title, body, 'info', duration); },
  warning(title, body, duration) { return this.show(title, body, 'warning', duration); },

  // Cricket-specific notifications
  wicket(batsmanName, bowlerName, newScore) {
    return this.show(
      `🎯 WICKET! ${batsmanName} is out!`,
      `Taken by ${bowlerName}. Score: ${newScore}`,
      'wicket',
      8000
    );
  },

  milestone(playerName, achievement) {
    return this.show(
      `⭐ MILESTONE! ${playerName}`,
      achievement,
      'milestone',
      8000
    );
  },

  matchStart(team1, team2) {
    return this.show(
      `🏏 Match Started!`,
      `${team1} vs ${team2} is now LIVE`,
      'match',
      6000
    );
  },

  }
};

window.Notifications = Notifications;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Notifications.init();
});

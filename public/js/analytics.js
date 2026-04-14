/* ============================================
   CricketVerse – Analytics Module
   ============================================ */

const AnalyticsModule = {
  charts: {},

  CHART_DEFAULTS: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8892a4', font: { family: 'Inter', size: 11 }, boxWidth: 12 }
      },
      tooltip: {
        backgroundColor: '#141d2e',
        borderColor: 'rgba(0,212,255,0.2)',
        borderWidth: 1,
        titleColor: '#e8eaf0',
        bodyColor: '#8892a4',
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        ticks: { color: '#8892a4', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' }
      },
      y: {
        ticks: { color: '#8892a4', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        beginAtZero: true
      }
    }
  },

  async init() {
    // Wait until charts are visible
    await this.loadRunRateChart();
    await this.loadManhattanChart();
    this.loadRadarChart();
    this.loadWinProbChart();
    this.loadWinProbWidget();
  },

  destroyChart(key) {
    if (this.charts[key]) {
      this.charts[key].destroy();
      delete this.charts[key];
    }
  },

  async loadRunRateChart() {
    const canvas = document.getElementById('run-rate-chart');
    if (!canvas) return;

    try {
      const data = await API.getRunRateData();
      const overs = data.overs || [];

      this.destroyChart('runRate');
      this.charts.runRate = new Chart(canvas, {
        type: 'line',
        data: {
          labels: overs.map(o => `Ov ${o.over}`),
          datasets: [
            {
              label: 'Runs per Over',
              data: overs.map(o => o.runs),
              borderColor: '#00d4ff',
              backgroundColor: 'rgba(0,212,255,0.08)',
              borderWidth: 2,
              pointBackgroundColor: '#00d4ff',
              pointRadius: 4,
              pointHoverRadius: 7,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Cumulative Run Rate',
              data: overs.map(o => parseFloat(o.runRate)),
              borderColor: '#ff6b35',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [5, 4],
              pointRadius: 3,
              tension: 0.4
            }
          ]
        },
        options: {
          ...this.CHART_DEFAULTS,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            ...this.CHART_DEFAULTS.plugins,
            legend: { ...this.CHART_DEFAULTS.plugins.legend, display: true }
          }
        }
      });
    } catch (err) {
      console.warn('Run rate chart error:', err);
    }
  },

  async loadManhattanChart() {
    const canvas = document.getElementById('manhattan-chart');
    if (!canvas) return;

    try {
      const data = await API.getManhattanData();
      const inn1 = data.innings1 || [];
      const inn2 = data.innings2 || [];

      this.destroyChart('manhattan');
      this.charts.manhattan = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: inn1.map(o => `${o.over}`),
          datasets: [
            {
              label: 'Innings 1',
              data: inn1.map(o => o.runs),
              backgroundColor: inn1.map(o =>
                o.wickets > 0 ? 'rgba(255,71,87,0.8)' : 'rgba(0,212,255,0.6)'
              ),
              borderColor: inn1.map(o =>
                o.wickets > 0 ? '#ff4757' : '#00d4ff'
              ),
              borderWidth: 1,
              borderRadius: 3,
              barPercentage: 0.45
            },
            {
              label: 'Innings 2',
              data: inn2.map(o => o.runs),
              backgroundColor: inn2.map(o =>
                o.wickets > 0 ? 'rgba(255,45,85,0.6)' : 'rgba(255,107,53,0.5)'
              ),
              borderColor: inn2.map(o =>
                o.wickets > 0 ? '#ff2d55' : '#ff6b35'
              ),
              borderWidth: 1,
              borderRadius: 3,
              barPercentage: 0.45
            }
          ]
        },
        options: {
          ...this.CHART_DEFAULTS,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            ...this.CHART_DEFAULTS.plugins,
            legend: { ...this.CHART_DEFAULTS.plugins.legend, display: true }
          }
        }
      });
    } catch (err) {
      console.warn('Manhattan chart error:', err);
    }
  },

  loadRadarChart() {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;

    this.destroyChart('radar');
    this.charts.radar = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Batting Avg', 'Strike Rate', 'Centuries', 'Consistency', 'Wickets', 'Economy'],
        datasets: [
          {
            label: 'Virat Kohli',
            data: [92, 78, 95, 88, 20, 30],
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0,212,255,0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#00d4ff',
            pointRadius: 4
          },
          {
            label: 'Babar Azam',
            data: [88, 75, 80, 85, 18, 35],
            borderColor: '#ff6b35',
            backgroundColor: 'rgba(255,107,53,0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#ff6b35',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#8892a4', font: { family: 'Inter', size: 11 }, boxWidth: 12 }
          },
          tooltip: {
            backgroundColor: '#141d2e',
            borderColor: 'rgba(0,212,255,0.2)',
            borderWidth: 1,
            titleColor: '#e8eaf0',
            bodyColor: '#8892a4',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          r: {
            ticks: { color: '#8892a4', backdropColor: 'transparent', font: { size: 9 } },
            grid: { color: 'rgba(255,255,255,0.07)' },
            angleLines: { color: 'rgba(255,255,255,0.07)' },
            pointLabels: { color: '#8892a4', font: { size: 10 } },
            min: 0,
            max: 100
          }
        }
      }
    });
  },

  loadWinProbChart() {
    const canvas = document.getElementById('win-prob-chart');
    if (!canvas) return;

    // Generate timeline data
    const overs = Array.from({ length: 20 }, (_, i) => i + 1);
    const team1Prob = overs.map(o => {
      const base = 50;
      const noise = (Math.random() - 0.5) * 15;
      const trend = (o / 20) * 20;
      return Math.max(10, Math.min(90, base + trend + noise));
    });
    const team2Prob = team1Prob.map(p => 100 - p);

    this.destroyChart('winProb');
    this.charts.winProb = new Chart(canvas, {
      type: 'line',
      data: {
        labels: overs.map(o => `Ov ${o}`),
        datasets: [
          {
            label: 'India Win %',
            data: team1Prob,
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0,212,255,0.06)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.5,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'Australia Win %',
            data: team2Prob,
            borderColor: '#ff6b35',
            backgroundColor: 'rgba(255,107,53,0.05)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.5,
            pointRadius: 3,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        ...this.CHART_DEFAULTS,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          ...this.CHART_DEFAULTS.plugins,
          legend: { ...this.CHART_DEFAULTS.plugins.legend, display: true }
        },
        scales: {
          ...this.CHART_DEFAULTS.scales,
          y: {
            ...this.CHART_DEFAULTS.scales.y,
            max: 100,
            ticks: {
              ...this.CHART_DEFAULTS.scales.y.ticks,
              callback: val => `${val}%`
            }
          }
        }
      }
    });
  },

  async loadWinProbWidget() {
    try {
      const data = await API.getWinProbability({
        team1runs: 342,
        team2runs: 210,
        target: 343,
        overs: 41.2,
        maxOvers: 50,
        wickets: 4
      });

      const t1Prob = parseFloat(data.team1WinProbability);
      const t2Prob = parseFloat(data.team2WinProbability);

      const bar1 = document.getElementById('prob-bar-t1');
      const bar2 = document.getElementById('prob-bar-t2');
      const rrrVal = document.getElementById('rrr-val');
      const pressureVal = document.getElementById('pressure-val');
      const resourcesVal = document.getElementById('resources-val');

      if (bar1) { bar1.style.width = `${t1Prob}%`; bar1.textContent = `${t1Prob}%`; }
      if (bar2) { bar2.style.width = `${t2Prob}%`; bar2.textContent = `${t2Prob}%`; }
      if (rrrVal) rrrVal.textContent = data.requiredRunRate;
      if (pressureVal) pressureVal.textContent = data.winFactors?.pressureIndex || '--';
      if (resourcesVal) resourcesVal.textContent = data.winFactors?.resourcesConsumed || '--';

      // Update team names from live match
      const matches = MatchesModule?.allMatches || [];
      const liveMatch = matches.find(m => m.ms === 'live' || m.matchStarted);
      if (liveMatch) {
        const t1El = document.getElementById('prob-team1');
        const t2El = document.getElementById('prob-team2');
        if (t1El) t1El.textContent = liveMatch.teams?.[0] || 'Team 1';
        if (t2El) t2El.textContent = liveMatch.teams?.[1] || 'Team 2';
      }
    } catch (err) {
      console.warn('Win prob widget error:', err);
    }
  }
};

// Global function for "Refresh" button
window.loadRunRateChart = () => {
  AnalyticsModule.loadRunRateChart();
  Notifications.info('Charts Refreshed', 'Analytics data updated');
};

window.AnalyticsModule = AnalyticsModule;

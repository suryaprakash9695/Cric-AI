/* ============================================
   CricketVerse – News Module
   ============================================ */

const NewsModule = {
  currentCategory: 'all',
  currentPage: 1,
  allArticles: [],
  hasMore: true,

  async init() {
    this.bindCategoryButtons();
    await this.loadNews('all', 1);
  },

  async loadNews(category = 'all', page = 1, append = false) {
    this.currentCategory = category;
    this.currentPage = page;

    const grid = document.getElementById('news-grid');
    const loadMoreBtn = document.getElementById('load-more-news');

    if (!append && grid) {
      grid.innerHTML = `
        <div class="skeleton-card tall"></div>
        <div class="skeleton-card tall"></div>
        <div class="skeleton-card tall"></div>
        <div class="skeleton-card tall"></div>
      `;
    }

    try {
      const data = await API.getNews(category, page);
      const articles = data.articles || [];

      if (append) {
        this.allArticles = [...this.allArticles, ...articles];
      } else {
        this.allArticles = articles;
      }

      this.hasMore = articles.length >= 6;

      if (grid) {
        if (!append) {
          grid.innerHTML = '';
        }
        if (!articles.length && !append) {
          grid.innerHTML = Utils.emptyState('No news articles found for this category', '📰');
          return;
        }

        articles.forEach((article, idx) => {
          const card = this.buildNewsCard(article, idx);
          grid.insertAdjacentHTML('beforeend', card);
        });

        grid.classList.add('stagger-children');
      }

      if (loadMoreBtn) {
        loadMoreBtn.style.display = this.hasMore ? 'inline-block' : 'none';
      }

      // Render mini news on dashboard
      if (page === 1 && !append) {
        this.renderMiniNews(articles.slice(0, 4));
      }

    } catch (err) {
      console.error('News load error:', err);
      if (grid && !append) {
        grid.innerHTML = Utils.errorState('Could not load news', 'NewsModule.loadNews()');
      }
    }
  },

  buildNewsCard(article, idx = 0) {
    const cat = article.category || this.currentCategory;
    const catLabel = cat === 'international' ? '🌍 International' :
                     cat === 'domestic' ? '🏠 Domestic' :
                     cat === 'trending' ? '🔥 Trending' : '📰 Cricket';

    const imgHtml = article.urlToImage
      ? `<img src="${article.urlToImage}" 
             alt="${Utils.truncate(article.title, 60)}"
             class="news-card-image"
             loading="lazy"
             onerror="this.outerHTML='<div class=news-card-image-placeholder>📰</div>'">`
      : `<div class="news-card-image-placeholder">📰</div>`;

    const timeAgo = Utils.timeAgo(article.publishedAt);
    const source = article.source?.name || 'Cricket News';
    const title = article.title || 'Cricket Update';
    const desc = article.description || 'Click to read the full story.';

    return `
      <div class="news-card hover-float animate-fade-in" 
           onclick="NewsModule.openArticle(${idx})"
           role="button" tabindex="0"
           aria-label="${Utils.truncate(title, 80)}">
        ${imgHtml}
        <div class="news-card-body">
          <span class="news-card-category ${cat}">${catLabel}</span>
          <div class="news-card-title">${title}</div>
          <div class="news-card-desc">${desc}</div>
          <div class="news-card-meta">
            <span class="news-card-source">📡 ${source}</span>
            <span>${timeAgo}</span>
          </div>
        </div>
      </div>
    `;
  },

  openArticle(idx) {
    const article = this.allArticles[idx];
    if (!article) return;

    if (article.url && article.url !== '#') {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    } else {
      Notifications.info(
        `📰 ${Utils.truncate(article.title, 60)}`,
        article.description || 'Full article URL not provided by the API.'
      );
    }
  },

  renderMiniNews(articles) {
    const container = document.getElementById('news-mini');
    if (!container || !articles.length) return;

    container.innerHTML = articles.slice(0, 4).map((a, idx) => `
      <div class="news-mini-item" onclick="NewsModule.openArticle(${idx})" role="button" tabindex="0">
        <span style="font-size:1.2rem;">📰</span>
        <div class="news-mini-content">
          <div class="news-mini-title">${Utils.truncate(a.title, 70)}</div>
          <div class="news-mini-meta">${a.source?.name || 'News'} • ${Utils.timeAgo(a.publishedAt)}</div>
        </div>
      </div>
    `).join('');
  },

  bindCategoryButtons() {
    document.querySelectorAll('.news-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.news-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadNews(btn.dataset.cat, 1, false);
      });
    });
  }
};

// Global load more function
window.loadMoreNews = () => {
  NewsModule.loadNews(
    NewsModule.currentCategory,
    NewsModule.currentPage + 1,
    true
  );
};

window.NewsModule = NewsModule;

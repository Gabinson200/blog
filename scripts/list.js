/*
 * list.js
 *
 * Handles rendering of the article list for a given category and optional
 * subcategory. It reads query parameters from the URL, filters
 * articles.json accordingly and generates article cards. Each card
 * includes the title, publication date and summary with a link to the
 * full article. If no articles are found for the requested filter, a
 * friendly message is displayed.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Fetch article metadata
  fetch('articles.json')
    .then((resp) => resp.json())
    .then((articles) => {
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category');
      const subcategory = params.get('subcategory');
      const filtered = articles.filter((article) => {
        if (category && article.category !== category) return false;
        if (subcategory && article.subcategory !== subcategory) return false;
        return true;
      });
      renderList(filtered, category, subcategory);
    })
    .catch((err) => {
      console.error('Failed to load articles.json:', err);
    });
});

/**
 * Render the list of articles to the page.
 *
 * @param {Array} articles
 * @param {string|null} category
 * @param {string|null} subcategory
 */
function renderList(articles, category, subcategory) {
  const heading = document.getElementById('list-heading');
  const container = document.getElementById('articles-container');
  if (!container || !heading) return;
  // Build heading text
  let title = 'Articles';
  if (category) {
    title = `Articles in ${capitalise(category)}`;
    if (subcategory) {
      title = `Articles in ${capitalise(category)} / ${capitalise(subcategory)}`;
    }
  }
  heading.textContent = title;
  container.innerHTML = '';
  if (articles.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No articles found.';
    container.appendChild(empty);
    return;
  }
  // Sort by date descending
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  articles.forEach((article) => {
    const card = document.createElement('div');
    card.className = 'article-card';
    const h3 = document.createElement('h3');
    const link = document.createElement('a');
    link.href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    link.textContent = article.title;
    h3.appendChild(link);
    card.appendChild(h3);
    // Meta info
    const meta = document.createElement('div');
    meta.className = 'meta';
    const date = new Date(article.date);
    meta.textContent = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    card.appendChild(meta);
    // Summary
    const summary = document.createElement('p');
    summary.textContent = article.summary || '';
    card.appendChild(summary);
    container.appendChild(card);
  });
}

/**
 * Capitalise the first letter of a string.
 *
 * @param {string} str
 * @returns {string}
 */
function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
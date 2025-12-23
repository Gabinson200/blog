/*
 * main.js
 *
 * This script runs on every page and is responsible for building the
 * site-wide navigation and, for the index page, rendering a list of
 * available categories and subcategories based on the metadata in
 * articles.json. Categories and subcategories are inferred from each
 * article entry in the JSON file. Adding a new article and updating
 * articles.json is all that's required to update navigation and
 * listings across the site.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Fetch the article manifest and then initialise navigation
  fetch('articles.json')
    .then((resp) => resp.json())
    .then((articles) => {
      const categories = collectCategories(articles);
      buildNavigation(categories);
      // If we're on the index page render the categories grid
      const categoriesContainer = document.getElementById('categories');
      if (categoriesContainer) {
        buildCategoriesGrid(categories, categoriesContainer);
      }
    })
    .catch((err) => {
      console.error('Failed to load articles.json:', err);
    });
});

/**
 * Collect unique categories and subcategories from the list of articles.
 * Returns an object mapping category -> array of subcategories (unique).
 *
 * @param {Array} articles
 */
function collectCategories(articles) {
  const map = {};
  articles.forEach((article) => {
    const { category, subcategory } = article;
    if (!category) return;
    if (!map[category]) {
      map[category] = new Set();
    }
    if (subcategory) {
      map[category].add(subcategory);
    }
  });
  // Convert Sets to sorted arrays for easier iteration
  const result = {};
  Object.keys(map).forEach((cat) => {
    result[cat] = Array.from(map[cat]).sort();
  });
  return result;
}

/**
 * Build the top navigation bar listing all categories.
 *
 * @param {Object} categories
 */
/* In scripts/main.js */

function buildNavigation(categories) {
  const navList = document.getElementById('category-list');
  if (!navList) return;
  navList.innerHTML = '';
  
  // 1. Categories
  Object.keys(categories).sort().forEach((cat) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `list.html?category=${encodeURIComponent(cat)}`;
      a.textContent = capitalise(cat);
      li.appendChild(a);
      navList.appendChild(li);
    });

  // 2. Mindmap Link
  const mindLi = document.createElement('li');
  const mindA = document.createElement('a');
  mindA.href = 'mindmap.html';
  mindA.textContent = 'Mindmap';
  mindLi.appendChild(mindA);
  navList.appendChild(mindLi);

  // 3. NEW: Webring Link
  const ringLi = document.createElement('li');
  const ringA = document.createElement('a');
  ringA.href = 'webring.html';
  ringA.textContent = 'Webring';
  ringLi.appendChild(ringA);
  navList.appendChild(ringLi);
}

/**
 * Render category cards on the homepage. Each card lists
 * subcategories as individual links.
 *
 * @param {Object} categories
 * @param {HTMLElement} container
 */
function buildCategoriesGrid(categories, container) {
  container.innerHTML = '';
  Object.keys(categories)
    .sort()
    .forEach((cat) => {
      const card = document.createElement('div');
      card.className = 'category-card';
      const heading = document.createElement('h3');
      heading.textContent = capitalise(cat);
      card.appendChild(heading);
      const subList = document.createElement('ul');
      subList.className = 'subcategory-list';
      const subs = categories[cat];
      if (subs.length === 0) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `list.html?category=${encodeURIComponent(cat)}`;
        a.textContent = 'View all';
        li.appendChild(a);
        subList.appendChild(li);
      } else {
        subs.forEach((sub) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `list.html?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(sub)}`;
          a.textContent = capitalise(sub);
          li.appendChild(a);
          subList.appendChild(li);
        });
      }
      card.appendChild(subList);
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

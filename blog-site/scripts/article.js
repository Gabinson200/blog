/*
 * article.js
 *
 * Loads an individual article based on the slug in the URL. Metadata is
 * looked up in articles.json to determine the correct file location. The
 * markdown content is then fetched, YAML front‑matter is stripped and
 * parsed for additional information such as title and date. The body
 * markdown is converted to HTML using the Marked library. This file
 * assumes marked.min.js has been loaded beforehand.
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const params = new URLSearchParams(location.search);
    const raw = params.get('slug') || '';
    if (!raw) throw new Error('Missing ?slug=');

    // Normalize slug: decode, strip leading "./", "/", and any "content/"
    let slug = decodeURIComponent(raw)
      .replace(/^(\.\/)+/, '')     // remove leading "./"
      .replace(/^\/+/, '')         // remove leading "/"
      .replace(/^content\//i, ''); // remove leading "content/"

    const mdPath = `./content/${slug}.md`;
    console.log('Fetching markdown from:', mdPath);

    const resp = await fetch(mdPath);
    if (!resp.ok) throw new Error(`Failed to load markdown from ${mdPath}`);

    const md = await resp.text();
    document.getElementById('article-content').innerHTML = marked.parse(md);

    // (Optional) set title from articles.json if you have it loaded:
    // const article = (window.articles || []).find(a => a.slug === slug);
    // document.getElementById('article-title').textContent = article?.title || slug;

  } catch (err) {
    console.error(err);
    document.getElementById('article-content').innerHTML =
      `<p style="color:red;">Error: ${err.message}</p>`;
  }
});

/**
 * Build the file path for a markdown article based on its metadata.
 *
 * @param {Object} meta
 * @returns {string}
 */
function buildMarkdownPath(meta) {
  const parts = ['content'];
  if (meta.category) parts.push(meta.category);
  if (meta.subcategory) parts.push(meta.subcategory);
  parts.push(`${meta.slug}.md`);
  return parts.join('/');
}

/**
 * Display the article on the page by parsing front‑matter and
 * converting markdown to HTML.
 *
 * @param {string} markdown
 * @param {Object} metaFromManifest
 */
function displayArticle(markdown, metaFromManifest) {
  // Extract front matter if present
  let meta = {};
  let body = markdown;
  if (markdown.startsWith('---')) {
    const endIdx = markdown.indexOf('\n---', 3);
    if (endIdx !== -1) {
      const fm = markdown.slice(3, endIdx).trim();
      meta = parseFrontMatter(fm);
      body = markdown.slice(endIdx + 4);
    }
  }
  // Merge metadata from manifest and front matter
  const title = meta.title || metaFromManifest.title || 'Untitled';
  const dateStr = meta.date || metaFromManifest.date;
  const date = dateStr ? new Date(dateStr) : null;
  // Set page title
  document.title = `${title} - Science & Programming Blog`;
  // Populate DOM
  const titleEl = document.getElementById('article-title');
  const metaEl = document.getElementById('article-meta');
  const contentEl = document.getElementById('article-content');
  if (titleEl) titleEl.textContent = title;
  if (metaEl) {
    const pieces = [];
    if (date) {
      pieces.push(
        date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    }
    if (meta.tags && Array.isArray(meta.tags)) {
      pieces.push('Tags: ' + meta.tags.join(', '));
    }
    metaEl.textContent = pieces.join(' \u2022 ');
  }
  if (contentEl) {
    // Convert markdown to HTML using marked
    const html = marked.parse(body);
    contentEl.innerHTML = html;

    // Tell MathJax to typeset the new content
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([contentEl]).catch((err) =>
        console.error('MathJax typeset failed:', err)
      );
    }
  }
}

/**
 * Render an error message on the page.
 *
 * @param {string} message
 */
function renderError(message) {
  const article = document.getElementById('article');
  if (article) {
    article.innerHTML = `<p>${message}</p>`;
  }
}

/**
 * Very basic YAML front matter parser. Supports simple
 * key: value pairs and arrays defined with square brackets. This is
 * sufficient for the small amount of metadata used in this site.
 *
 * @param {string} text
 * @returns {Object}
 */
function parseFrontMatter(text) {
  const lines = text.split(/\r?\n/);
  const result = {};
  lines.forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // Arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      // Remove brackets and split by comma
      const arrStr = value.slice(1, -1).trim();
      if (arrStr.length === 0) {
        result[key] = [];
      } else {
        result[key] = arrStr.split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, ''));
      }
    } else {
      result[key] = value;
    }
  });
  return result;
}

/*
 * article.js
 *
 * Loads an individual article based on the slug in the URL. Metadata is
 * looked up in articles.json (if present) to provide title/date/tags. The
 * markdown content is then fetched, optional YAML front-matter is parsed,
 * and the body markdown is converted to HTML using Marked. After injecting
 * content, MathJax v3 is asked to typeset any LaTeX found.
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const params = new URLSearchParams(location.search);
    const raw = params.get('slug') || '';
    if (!raw) throw new Error('Missing ?slug=');

    // Normalize slug: decode, strip leading "./", "/", and any "content/"
    const slug = normalizeSlug(raw);

    // Build relative path (important for project pages under /blog/)
    const mdPath = `./content/${slug}.md`;
    console.log('[article] Fetching markdown from:', mdPath);

    // Fetch markdown file
    const resp = await fetch(mdPath, { cache: 'no-store' });
    if (!resp.ok) {
      throw new Error(`Failed to load markdown from ${mdPath}`);
    }
    const md = await resp.text();

    // Try to load metadata from articles.json (optional)
    let metaFromManifest = {};
    try {
      const metaResp = await fetch('./articles.json', { cache: 'no-store' });
      if (metaResp.ok) {
        const all = await metaResp.json();
        metaFromManifest = Array.isArray(all)
          ? (all.find(a => normalizeSlug(a.slug || '') === slug) || {})
          : {};
      }
    } catch {
      // non-fatal; continue without manifest metadata
    }

    // Render the article (handles front-matter, title, meta, and MathJax)
    await displayArticle(md, metaFromManifest);

  } catch (err) {
    console.error(err);
    renderError(`<span style="color:red;">Error:</span> ${escapeHtml(err.message)}`);
  }
});

/**
 * Normalize a slug coming from the URL or manifest into a path under /content
 * (no leading "./", no leading "/", no leading "content/").
 */
function normalizeSlug(raw) {
  return decodeURIComponent(raw)
    .replace(/^(\.\/)+/, '')    // remove leading "./"
    .replace(/^\/+/, '')        // remove leading "/"
    .replace(/^content\//i, ''); // remove leading "content/"
}

/**
 * Build the file path for a markdown article based on its metadata.
 * (Kept for compatibility; not used by the main flow.)
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
 * Display the article on the page by parsing front-matter and converting
 * markdown to HTML. Also updates title/meta and triggers MathJax typesetting.
 *
 * @param {string} markdown
 * @param {Object} metaFromManifest
 */
async function displayArticle(markdown, metaFromManifest = {}) {
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

  // Merge metadata from manifest and front matter (front matter wins)
  const merged = { ...metaFromManifest, ...meta };
  const title = merged.title || metaFromManifest.title || 'Untitled';
  const dateStr = merged.date || metaFromManifest.date || '';
  const date = dateStr ? new Date(dateStr) : null;

  // Set document <title>
  document.title = `${title} - Science & Programming Blog`;

  // Populate DOM
  const titleEl = document.getElementById('article-title');
  const metaEl = document.getElementById('article-meta');
  const contentEl = document.getElementById('article-content');

  if (titleEl) titleEl.textContent = title;

  if (metaEl) {
    const pieces = [];
    if (date && !isNaN(date)) {
      pieces.push(
        date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    }
    const tags = merged.tags || merged.keywords || [];
    if (Array.isArray(tags) && tags.length) {
      pieces.push('Tags: ' + tags.join(', '));
    }
    metaEl.textContent = pieces.join(' \u2022 ');
  }

  if (contentEl) {
    // Convert markdown to HTML using marked
    contentEl.innerHTML = marked.parse(body);

    // Typeset MathJax after content is injected
    await typesetMath(contentEl);
  }
}

/**
 * Ask MathJax v3 to typeset the given element. If MathJax hasn't loaded yet,
 * this waits for the script to finish loading first.
 *
 * @param {HTMLElement} el
 */
async function typesetMath(el) {
  // If MathJax hasn't been added yet, nothing to do.
  if (!window.MathJax) return;

  // If startup not ready yet, wait for the loader script (id="MathJax-script")
  if (!MathJax.startup) {
    const mjScript = document.getElementById('MathJax-script');
    if (mjScript && !mjScript.dataset._bound) {
      mjScript.dataset._bound = '1';
      await new Promise((res) => mjScript.addEventListener('load', res, { once: true }));
    }
  }

  if (MathJax.typesetPromise) {
    try {
      await MathJax.typesetPromise([el]);
    } catch (e) {
      console.error('MathJax typeset failed:', e);
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
 * Very basic YAML front matter parser. Supports simple key: value pairs and
 * arrays defined with square brackets.
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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Arrays: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrStr = value.slice(1, -1).trim();
      result[key] = arrStr.length
        ? arrStr.split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
        : [];
    } else {
      result[key] = value;
    }
  });
  return result;
}

/**
 * Minimal HTML escaper for safe error rendering.
 */
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

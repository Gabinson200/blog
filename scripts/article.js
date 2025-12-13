document.addEventListener('DOMContentLoaded', async () => {
  try {
    const params = new URLSearchParams(location.search);
    const raw = params.get('slug') || '';
    if (!raw) throw new Error('Missing ?slug=');

    // Normalize slug
    const slug = normalizeSlug(raw);

    // Build relative path
    const mdPath = `./content/${slug}.md`;
    console.log('[article] Fetching markdown from:', mdPath);

    // Absolute URL for the MD file
    const mdUrlAbs = new URL(mdPath, window.location.href);
    const mdDirUrl = new URL('./', mdUrlAbs);

    // Fetch markdown file
    const resp = await fetch(mdPath, { cache: 'no-store' });
    if (!resp.ok) {
      throw new Error(`Failed to load markdown from ${mdPath}`);
    }
    let markdown = await resp.text();

    // Try to load metadata
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
      // non-fatal
    }

    // Parse front matter
    const { frontMatter, body } = extractFrontMatter(markdown);
    markdown = body;

    // Optional per-article images base
    let imagesBaseDirUrl = null;
    if (frontMatter.imagesBase) {
      const cleaned = String(frontMatter.imagesBase).replace(/\\/g, '/').replace(/^\/+/, '');
      const baseCandidate = `./content/${cleaned}${cleaned.endsWith('/') ? '' : '/'}`;
      imagesBaseDirUrl = new URL(baseCandidate, window.location.href);
    }

    // Merge metadata
    const merged = { ...metaFromManifest, ...frontMatter };
    const title = merged.title || metaFromManifest.title || 'Untitled';
    const dateStr = merged.date || metaFromManifest.date || '';
    const date = dateStr ? new Date(dateStr) : null;

    document.title = `${title} - Science & Programming Blog`;

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

    // --- FIX: Robust Renderer for both New (v12+) and Old Marked Versions ---
    const renderer = {
      heading(arg1, arg2) {
        // New Marked (v12+): arg1 is a token object
        if (typeof arg1 === 'object' && arg1 !== null) {
          const token = arg1;
          const level = token.depth || 1;

          // Plain text (no HTML) for the slug/id
          const plainText = token.text || '';

          // Full inline HTML (this keeps [links](...) etc.)
          const innerHtml = this.parser && this.parser.parseInline
            ? this.parser.parseInline(token.tokens || [])
            : plainText;

          const id = slugify(plainText);
          return `<h${level} id="${id}">${innerHtml}</h${level}>`;
        }

        // Old Marked: fall back to simple behavior
        const text = arg1 || '';
        const level = arg2 || 1;
        const id = slugify(text);
        return `<h${level} id="${id}">${text}</h${level}>`;
      }
    };


    // Configure Marked
    if (window.marked?.use) {
      marked.use({
        renderer, 
        extensions: [{
          name: 'mathBlock',
          level: 'block',
          start(src) { const i = src.indexOf('$$'); return i < 0 ? undefined : i; },
          tokenizer(src) {
            const m = src.match(/^\$\$([\s\S]*?)\$\$/);
            if (!m) return;
            return { type: 'mathBlock', raw: m[0], text: m[1].trim() };
          },
          renderer(tok) {
            return `$$\n${tok.text}\n$$`;
          }
        }]
      });
    }

    // Marked options
    if (window.marked?.setOptions) {
      marked.setOptions({
        gfm: true,
        breaks: false,
        mangle: false,
        headerIds: false,
        // baseUrl: mdDirUrl.pathname // <-- REMOVED: Conflicting with anchors
      });
    }

    // --- Pre-process Obsidian Links: [[#Heading]] -> [Heading](#heading) ---
    markdown = markdown.replace(/\[\[#([^\]]+)\]\]/g, (match, captureGroup) => {
      const linkText = captureGroup;
      const linkId = slugify(linkText);
      return `[${linkText}](#${linkId})`;
    });

    // Render markdown -> HTML
    if (!contentEl) throw new Error('Missing #article-content container');
    const html = (typeof marked?.parse === 'function') ? marked.parse(markdown) : marked(markdown);
    contentEl.innerHTML = html;

    // Rewrite relative URLs after render
    rewriteLinksAndMedia(contentEl, mdDirUrl, imagesBaseDirUrl);

    // Lazy-load & async decode images
    contentEl.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      img.decoding = 'async';
    });

    // Apply Syntax Highlighting
    if (window.hljs) {
      hljs.highlightAll();
    }

    await typesetMath(contentEl);

    // Check if this is a reload and if we have saved state for this specific article
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry && navEntry.type === 'reload') {
      try {
        const savedState = JSON.parse(sessionStorage.getItem('scrollState'));
        // Only restore if the saved slug matches the current slug
        // (This prevents jumping down if you reload, then quickly navigate elsewhere)
        if (savedState && savedState.slug === raw) { 
          // Slight delay to ensure images/layout have stabilized
          setTimeout(() => {
            window.scrollTo(0, savedState.scrollY);
          }, 10);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // --- SCROLL FIX: If URL has #hash, scroll to it now that content exists ---
    if (window.location.hash) {
      const hashId = window.location.hash.substring(1);
      // Wait a tick for DOM to settle
      setTimeout(() => {
        const target = document.getElementById(hashId);
        if (target) target.scrollIntoView();
      }, 0);
    }

  } catch (err) {
    console.error(err);
    renderError(`<span style="color:red;">Error:</span> ${escapeHtml(err.message)}`);
  }
});

// ... [Existing Helpers] ...

function normalizeSlug(raw) {
  return decodeURIComponent(raw)
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '')
    .replace(/^content\//i, '');
}

function extractFrontMatter(markdown) {
  if (!markdown.startsWith('---')) return { frontMatter: {}, body: markdown };
  const endIdx = markdown.indexOf('\n---', 3);
  if (endIdx === -1) return { frontMatter: {}, body: markdown };
  const fmText = markdown.slice(3, endIdx).trim();
  const frontMatter = parseFrontMatter(fmText);
  const body = markdown.slice(endIdx + 4);
  return { frontMatter, body };
}

function parseFrontMatter(text) {
  const lines = text.split(/\r?\n/);
  const result = {};
  lines.forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
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

async function typesetMath(el) {
  if (!window.MathJax) return;
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

function renderError(message) {
  const article = document.getElementById('article');
  if (article) {
    article.innerHTML = `<p>${message}</p>`;
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isAbsoluteUrl(u) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(u) || /^[a-z]+:/i.test(u);
}

function resolveRelativeUrl(raw, mdDirUrl, imagesBaseDirUrl) {
  if (!raw) return raw;
  let url = raw.replace(/\\/g, '/').trim();

  // 1. In-page anchors: leave alone
  if (url.startsWith('#')) return url;

  // 2. Links to the article template or other top-level pages: leave alone
  if (url.startsWith('article.html?slug=')) return url;
  // (optional, if you ever link these from markdown too)
  // if (url === 'index.html' || url === 'list.html' || url === 'mindmap.html') return url;

  if (isAbsoluteUrl(url)) return url;
  if (url.startsWith('/')) return url;
  if (url.startsWith('content/')) {
    const abs = new URL(`./${url}`, window.location.href);
    return abs.pathname + abs.search + abs.hash;
  }
  if (imagesBaseDirUrl && url.startsWith('@img/')) {
    const abs = new URL(url.slice(5), imagesBaseDirUrl);
    return abs.pathname + abs.search + abs.hash;
  }
  const abs = new URL(url, mdDirUrl);
  return abs.pathname + abs.search + abs.hash;
}

function rewriteSrcset(el, attr, mdDirUrl, imagesBaseDirUrl) {
  const srcset = el.getAttribute(attr);
  if (!srcset) return;
  const parts = srcset.split(',').map(s => s.trim()).filter(Boolean);
  const rewritten = parts.map(part => {
    const m = part.match(/^(\S+)(\s+.+)?$/);
    if (!m) return part;
    const url = resolveRelativeUrl(m[1], mdDirUrl, imagesBaseDirUrl);
    const descriptor = (m[2] || '');
    return `${url}${descriptor}`;
  }).join(', ');
  el.setAttribute(attr, rewritten);
}

function rewriteLinksAndMedia(container, mdDirUrl, imagesBaseDirUrl) {
  container.querySelectorAll('img, a, video, audio, source').forEach((el) => {
    const attr = el.tagName === 'A' ? 'href' : 'src';
    const val = el.getAttribute(attr);
    if (val) {
      el.setAttribute(attr, resolveRelativeUrl(val, mdDirUrl, imagesBaseDirUrl));
    }
    if (el.hasAttribute('srcset')) {
      rewriteSrcset(el, 'srcset', mdDirUrl, imagesBaseDirUrl);
    }
  });
}

window.addEventListener('beforeunload', () => {
  // Only save if we are on an article page
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (slug) {
    const state = {
      slug: slug,
      scrollY: window.scrollY
    };
    sessionStorage.setItem('scrollState', JSON.stringify(state));
  }
});

// --- HELPER ---
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

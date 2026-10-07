document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('article-content');
  const title = document.getElementById('article-title');
  const meta = document.getElementById('article-meta');
  const rawSlug = new URLSearchParams(location.search).get('slug') || '';
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

  let blocks = [];
  let stopWatchingImages = () => {};

  try {
    if (!rawSlug) throw new Error('Missing ?slug=');
    if (!content) throw new Error('Missing #article-content');

    const slug = normalizeSlug(rawSlug);
    const mdURL = new URL('./content/' + slug + '.md', location.href);
    const mdDir = new URL('./', mdURL);

    const response = await fetch(mdURL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Could not load ' + mdURL.pathname);
    }

    let lastSource = await response.text();
    let manifest = {};

    try {
      const response = await fetch('./articles.json', {
        cache: 'no-store'
      });

      if (response.ok) {
        const articles = await response.json();

        manifest = articles.find(
          a => normalizeSlug(a.slug || '') === slug
        ) || {};
      }
    } catch (error) {
      console.debug('[article] Metadata unavailable:', error);
    }

    configureMarked();
    await window.MathJax?.startup?.promise;

    async function update(source, preserveScroll) {
      const { frontMatter, body } = extractFrontMatter(source);
      const template = document.createElement('template');

      template.innerHTML = marked.parse(
        body.replace(
          /\[\[#([^\]]+)\]\]/g,
          (_, text) => '[' + text + '](#' + slugify(text) + ')'
        )
      );

      rewriteLinksAndMedia(
        template.content,
        mdDir,
        getImagesBase(frontMatter)
      );

      // Compare BEFORE highlighting or MathJax changes the generated HTML.
      const available = new Map();

      for (const block of blocks) {
        if (!available.has(block.key)) {
          available.set(block.key, []);
        }

        available.get(block.key).push(block);
      }

      const next = [];
      const changed = [];

      for (let node of Array.from(template.content.childNodes)) {
        if (node.nodeType === Node.COMMENT_NODE) continue;

        if (node.nodeType === Node.TEXT_NODE) {
          if (!node.textContent.trim()) continue;

          const wrapper = document.createElement('div');
          wrapper.append(node);
          node = wrapper;
        }

        const key = node.outerHTML;
        const existing = available.get(key)?.shift();
        const block = existing || { key, node };

        next.push(block);

        if (!existing) {
          changed.push(block);
        }
      }

      // Prepare changed blocks at the article's width while the existing
      // article remains visible and fully usable.
      const stage = document.createElement('div');
      stage.className = content.className;
      stage.setAttribute('aria-hidden', 'true');
      stage.inert = true;

      stage.style.cssText =
        'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;' +
        'box-sizing:border-box;margin:0;z-index:-1;';

      stage.style.width =
        content.getBoundingClientRect().width + 'px';

      content.after(stage);

      let committed = false;

      try {
        for (const block of changed) {
          stage.append(block.node);
        }

        stage.querySelectorAll('pre code').forEach(node => {
          if (window.hljs) {
            hljs.highlightElement(node);
          }
        });

        stage.querySelectorAll('img').forEach(img => {
          // Hidden staging content must load without waiting to enter
          // the viewport.
          img.loading = 'eager';
          img.decoding = 'async';
        });

        if (changed.length && window.MathJax?.typesetPromise) {
          await MathJax.typesetPromise(
            changed.map(block => block.node)
          );
        }

        // Start layout/font loading while the old article remains visible.
        stage.getBoundingClientRect();

        await settleWithin(
          Promise.all([
            document.fonts?.ready,
            ...Array.from(
              stage.querySelectorAll('img'),
              waitForImage
            )
          ]),
          2000
        );

        await new Promise(resolve => requestAnimationFrame(() => {
          stopWatchingImages();

          // Capture NOW, so scrolling during preparation is respected.
          const anchor = preserveScroll
            ? captureAnchor(blocks, next)
            : null;

          const root = document.documentElement;
          const oldAnchorStyle = root.style.overflowAnchor;
          const oldMinHeight = content.style.minHeight;

          root.style.overflowAnchor = 'none';

          // Prevent a temporary height reduction while nodes are moved.
          content.style.minHeight =
            content.getBoundingClientRect().height + 'px';

          const retained = new Set(next);
          const removed = blocks.filter(
            block => !retained.has(block)
          );

          if (removed.length) {
            window.MathJax?.typesetClear?.(
              removed.map(block => block.node)
            );
          }

          updateMetadata(
            manifest,
            frontMatter,
            title,
            meta
          );

          // Keep unchanged nodes connected, including images and
          // rendered math.
          let cursor = content.firstChild;

          for (const block of next) {
            if (block.node === cursor) {
              cursor = cursor.nextSibling;
            } else {
              content.insertBefore(block.node, cursor);
            }
          }

          while (cursor) {
            const following = cursor.nextSibling;
            cursor.remove();
            cursor = following;
          }

          blocks = next;
          content.style.minHeight = oldMinHeight;

          restoreAnchor(anchor);

          committed = true;
          stage.remove();

          requestAnimationFrame(() => {
            root.style.overflowAnchor = oldAnchorStyle;
            stopWatchingImages = watchLateImages(content, blocks);
            resolve();
          });
        }));
      } finally {
        if (!committed && changed.length) {
          window.MathJax?.typesetClear?.(
            changed.map(block => block.node)
          );
        }

        stage.remove();
      }
    }

    await update(lastSource, false);

    stopWatchingImages();
    restoreInitialPosition(rawSlug);
    stopWatchingImages = watchLateImages(content, blocks);

    if (isLocal) {
      console.log('[article] Live Markdown preview enabled');

      // Schedule the NEXT request only after fetch + render have finished.
      // There can never be two requests/renders in flight from this loop.
      async function poll() {
        try {
          if (!document.hidden) {
            const url = new URL(mdURL);
            url.searchParams.set('live', Date.now());

            const response = await fetch(url, {
              cache: 'no-store'
            });

            if (response.ok) {
              const source = await response.text();

              if (source !== lastSource) {
                await update(source, true);

                // Only mark a successful render as applied.
                lastSource = source;
              }
            }
          }
        } catch (error) {
          console.debug(
            '[article] Live preview update failed:',
            error
          );
        } finally {
          setTimeout(poll, 75);
        }
      }

      setTimeout(poll, 75);
    }
  } catch (error) {
    console.error(error);

    if (content) {
      content.textContent = 'Error: ' + error.message;
    }
  }
});


function configureMarked() {
  marked.use({
    renderer: {
      heading(arg, oldLevel) {
        const modern = typeof arg === 'object' && arg !== null;

        const level = modern ? arg.depth : oldLevel;
        const text = modern ? arg.text : arg;
        const html = modern
          ? this.parser.parseInline(arg.tokens || [])
          : arg;

        return (
          '<h' + level + ' id="' + slugify(text) + '">' +
          html +
          '</h' + level + '>'
        );
      }
    },

    extensions: [{
      name: 'mathBlock',
      level: 'block',

      start(source) {
        const index = source.indexOf('$$');
        return index < 0 ? undefined : index;
      },

      tokenizer(source) {
        const match = /^\$\$([\s\S]*?)\$\$/.exec(source);

        if (match) {
          return {
            type: 'mathBlock',
            raw: match[0],
            text: match[1].trim()
          };
        }
      },

      renderer(token) {
        // Give display math a stable block to reuse on subsequent updates.
        return (
          '<div class="math-block">$$\n' +
          escapeHtml(token.text) +
          '\n$$</div>\n'
        );
      }
    }]
  });

  marked.setOptions({
    gfm: true,
    breaks: false
  });
}


function captureAnchor(previous, next) {
  const fallback = {
    node: null,
    top: 0,
    y: window.scrollY,
    x: window.scrollX
  };

  // At the top, keep the beginning of the article visible.
  if (window.scrollY < 1) {
    return fallback;
  }

  const index = previous.findIndex(
    block => block.node.getBoundingClientRect().bottom > 0
  );

  if (index < 0) {
    return fallback;
  }

  const old = previous[index];
  const top = old.node.getBoundingClientRect().top;

  if (next.includes(old)) {
    return {
      ...fallback,
      node: old.node,
      top
    };
  }

  // The visible block changed. Locate its replacement between
  // surviving neighbours.
  let before = index - 1;

  while (before >= 0 && !next.includes(previous[before])) {
    before--;
  }

  let after = index + 1;

  while (
    after < previous.length &&
    !next.includes(previous[after])
  ) {
    after++;
  }

  const start = before >= 0
    ? next.indexOf(previous[before]) + 1
    : 0;

  const end = after < previous.length
    ? next.indexOf(previous[after])
    : next.length;

  if (start < end) {
    const replacement = next[
      Math.min(start + index - before - 1, end - 1)
    ];

    return {
      ...fallback,
      node: replacement.node,
      top
    };
  }

  // A deletion has no replacement: hold the nearest surviving neighbour.
  const neighbour = previous[after] || previous[before];

  return neighbour
    ? {
        ...fallback,
        node: neighbour.node,
        top: neighbour.node.getBoundingClientRect().top
      }
    : fallback;
}


function restoreAnchor(anchor) {
  if (!anchor) return;

  const top = anchor.node?.isConnected
    ? (
        window.scrollY +
        anchor.node.getBoundingClientRect().top -
        anchor.top
      )
    : anchor.y;

  window.scrollTo({
    left: anchor.x,
    top,
    behavior: 'instant'
  });
}


function waitForImage(img) {
  if (img.complete) {
    return (
      img.decode?.().catch(() => {}) ||
      Promise.resolve()
    );
  }

  return new Promise(resolve => {
    const done = () => {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
      resolve();
    };

    img.addEventListener('load', done);
    img.addEventListener('error', done);
  });
}


function settleWithin(promise, milliseconds) {
  let timer;

  return Promise.race([
    promise,
    new Promise(resolve => {
      timer = setTimeout(resolve, milliseconds);
    })
  ]).finally(() => clearTimeout(timer));
}


function watchLateImages(content, blocks) {
  const pending = Array.from(
    content.querySelectorAll('img')
  ).filter(img => !img.complete);

  if (!pending.length || !window.ResizeObserver) {
    return () => {};
  }

  const anchor = captureAnchor(blocks, blocks);

  const observer = new ResizeObserver(() => {
    restoreAnchor(anchor);
  });

  const events = [
    'wheel',
    'touchstart',
    'pointerdown',
    'keydown'
  ];

  let timer;

  function stop() {
    observer.disconnect();
    clearTimeout(timer);

    events.forEach(event => {
      window.removeEventListener(event, stop, true);
    });
  }

  observer.observe(content);

  // Stop compensating as soon as the user interacts with the page.
  events.forEach(event => {
    window.addEventListener(event, stop, {
      capture: true,
      passive: true
    });
  });

  timer = setTimeout(stop, 10000);

  Promise.all(pending.map(waitForImage)).then(() => {
    requestAnimationFrame(() => {
      // Allow the observer to handle the final size change.
      requestAnimationFrame(stop);
    });
  });

  return stop;
}


function restoreInitialPosition(slug) {
  const reload =
    performance.getEntriesByType('navigation')[0]?.type === 'reload';

  if (reload) {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem('scrollState')
      );

      if (
        saved?.slug === slug &&
        Number.isFinite(saved.scrollY)
      ) {
        window.scrollTo({
          left: 0,
          top: saved.scrollY,
          behavior: 'instant'
        });

        return;
      }
    } catch {}
  }

  if (location.hash) {
    let id = location.hash.slice(1);

    try {
      id = decodeURIComponent(id);
    } catch {}

    (
      document.getElementById(id) ||
      document.getElementById(slugify(id))
    )?.scrollIntoView();
  }
}


window.addEventListener('beforeunload', () => {
  const slug = new URLSearchParams(location.search).get('slug');

  if (!slug) return;

  try {
    sessionStorage.setItem(
      'scrollState',
      JSON.stringify({
        slug,
        scrollY: window.scrollY
      })
    );
  } catch {}
});


function normalizeSlug(value) {
  return decodeURIComponent(value)
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '')
    .replace(/^content\//i, '');
}


function extractFrontMatter(source) {
  const match =
    /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);

  if (!match) {
    return {
      frontMatter: {},
      body: source
    };
  }

  const frontMatter = {};

  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');

    if (colon < 0) continue;

    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();

    if (/^(['"])[\s\S]*\1$/.test(value)) {
      value = value.slice(1, -1);
    }

    if (
      value.startsWith('[') &&
      value.endsWith(']')
    ) {
      const inner = value.slice(1, -1).trim();

      frontMatter[key] = inner
        ? inner.split(',').map(item =>
            item.trim().replace(/^['"]|['"]$/g, '')
          )
        : [];
    } else {
      frontMatter[key] = value;
    }
  }

  return {
    frontMatter,
    body: source.slice(match[0].length)
  };
}


function updateMetadata(
  manifest,
  frontMatter,
  titleEl,
  metaEl
) {
  const data = {
    ...manifest,
    ...frontMatter
  };

  const title =
    data.title ||
    manifest.title ||
    'Untitled';

  document.title = title + ' - Science & Programming Blog';

  if (titleEl && titleEl.textContent !== title) {
    titleEl.textContent = title;
  }

  const pieces = [];
  const date = data.date ? new Date(data.date) : null;

  if (date && !isNaN(date)) {
    pieces.push(
      date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    );
  }

  const tags = data.tags || data.keywords || [];

  if (Array.isArray(tags) && tags.length) {
    pieces.push('Tags: ' + tags.join(', '));
  }

  const text = pieces.join(' • ');

  if (metaEl && metaEl.textContent !== text) {
    metaEl.textContent = text;
  }
}


function getImagesBase(frontMatter) {
  if (!frontMatter.imagesBase) {
    return null;
  }

  const path = String(frontMatter.imagesBase)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');

  return new URL(
    './content/' +
    path +
    (path.endsWith('/') ? '' : '/'),
    location.href
  );
}


function resolveRelativeUrl(raw, mdDir, imagesBase) {
  if (!raw) return raw;

  const url = raw.replace(/\\/g, '/').trim();

  if (
    /^(?:#|\/|[a-z][a-z0-9+.-]*:)/i.test(url) ||
    url.startsWith('article.html?slug=')
  ) {
    return url;
  }

  const absolute = url.startsWith('content/')
    ? new URL('./' + url, location.href)
    : imagesBase && url.startsWith('@img/')
      ? new URL(url.slice(5), imagesBase)
      : new URL(url, mdDir);

  return (
    absolute.pathname +
    absolute.search +
    absolute.hash
  );
}


function rewriteLinksAndMedia(
  container,
  mdDir,
  imagesBase
) {
  container.querySelectorAll(
    'img, a, video, audio, source'
  ).forEach(node => {
    const attr = node.tagName === 'A' ? 'href' : 'src';

    if (node.hasAttribute(attr)) {
      node.setAttribute(
        attr,
        resolveRelativeUrl(
          node.getAttribute(attr),
          mdDir,
          imagesBase
        )
      );
    }

    if (node.hasAttribute('srcset')) {
      const srcset = node.getAttribute('srcset')
        .split(',')
        .map(part => {
          const match = /^(\S+)(\s+.*)?$/.exec(part.trim());

          return match
            ? (
                resolveRelativeUrl(
                  match[1],
                  mdDir,
                  imagesBase
                ) +
                (match[2] || '')
              )
            : part;
        })
        .join(', ');

      node.setAttribute('srcset', srcset);
    }

    if (node.hasAttribute('poster')) {
      node.setAttribute(
        'poster',
        resolveRelativeUrl(
          node.getAttribute('poster'),
          mdDir,
          imagesBase
        )
      );
    }
  });
}


function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}


function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
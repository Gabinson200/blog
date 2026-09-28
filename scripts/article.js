document.addEventListener('DOMContentLoaded', async () => {
  try {
    const params = new URLSearchParams(location.search);
    const raw = params.get('slug') || '';

    if (!raw) {
      throw new Error('Missing ?slug=');
    }

    // ----------------------------------------------------------
    // ARTICLE PATH
    // ----------------------------------------------------------

    const slug = normalizeSlug(raw);

    const mdPath = `./content/${slug}.md`;

    console.log('[article] Fetching markdown from:', mdPath);

    // Absolute URL for the Markdown file.
    // Used to resolve relative images, links, etc.
    const mdUrlAbs = new URL(mdPath, window.location.href);
    const mdDirUrl = new URL('./', mdUrlAbs);

    // ----------------------------------------------------------
    // FETCH MARKDOWN
    // ----------------------------------------------------------

    const resp = await fetch(mdPath, {
      cache: 'no-store'
    });

    if (!resp.ok) {
      throw new Error(
        `Failed to load markdown from ${mdPath}`
      );
    }

    let markdownSource = await resp.text();

    // Keep the original source so the live-preview loop can detect
    // whether the Markdown file has actually changed.
    let lastMarkdownSource = markdownSource;

    // ----------------------------------------------------------
    // LOAD ARTICLE METADATA MANIFEST
    // ----------------------------------------------------------

    let metaFromManifest = {};

    try {
      const metaResp = await fetch('./articles.json', {
        cache: 'no-store'
      });

      if (metaResp.ok) {
        const all = await metaResp.json();

        metaFromManifest = Array.isArray(all)
          ? (
              all.find(
                (article) =>
                  normalizeSlug(article.slug || '') === slug
              ) || {}
            )
          : {};
      }
    } catch (error) {
      console.debug(
        '[article] Could not load articles.json:',
        error
      );
    }

    // ----------------------------------------------------------
    // PARSE FRONT MATTER
    // ----------------------------------------------------------

    let {
      frontMatter,
      body: markdown
    } = extractFrontMatter(markdownSource);

    // ----------------------------------------------------------
    // IMAGE BASE DIRECTORY
    // ----------------------------------------------------------

    let imagesBaseDirUrl =
      getImagesBaseDirUrl(frontMatter);

    // ----------------------------------------------------------
    // ARTICLE ELEMENTS
    // ----------------------------------------------------------

    const titleEl =
      document.getElementById('article-title');

    const metaEl =
      document.getElementById('article-meta');

    const contentEl =
      document.getElementById('article-content');

    if (!contentEl) {
      throw new Error(
        'Missing #article-content container'
      );
    }

    // ----------------------------------------------------------
    // ARTICLE TITLE / DATE / TAGS
    // ----------------------------------------------------------

    updateArticleMetadata(
      metaFromManifest,
      frontMatter,
      titleEl,
      metaEl
    );

    // ----------------------------------------------------------
    // MARKED RENDERER
    // ----------------------------------------------------------

    /*
     * Custom heading renderer.
     *
     * This gives every heading an ID so Markdown links such as:
     *
     * [DFT Output](#dft-output)
     *
     * work correctly.
     *
     * Supports both newer and older versions of Marked.
     */

    const renderer = {
      heading(arg1, arg2) {
        // New Marked versions:
        // arg1 is a token object.
        if (
          typeof arg1 === 'object' &&
          arg1 !== null
        ) {
          const token = arg1;

          const level =
            token.depth || 1;

          const plainText =
            token.text || '';

          const innerHtml =
            this.parser &&
            this.parser.parseInline
              ? this.parser.parseInline(
                  token.tokens || []
                )
              : plainText;

          const id =
            slugify(plainText);

          return (
            `<h${level} id="${id}">` +
            `${innerHtml}` +
            `</h${level}>`
          );
        }

        // Old Marked versions.
        const text =
          arg1 || '';

        const level =
          arg2 || 1;

        const id =
          slugify(text);

        return (
          `<h${level} id="${id}">` +
          `${text}` +
          `</h${level}>`
        );
      }
    };

    // ----------------------------------------------------------
    // CONFIGURE MARKED
    // ----------------------------------------------------------

    if (window.marked?.use) {
      marked.use({
        renderer,

        extensions: [
          {
            name: 'mathBlock',

            level: 'block',

            start(src) {
              const index =
                src.indexOf('$$');

              return index < 0
                ? undefined
                : index;
            },

            tokenizer(src) {
              const match =
                src.match(
                  /^\$\$([\s\S]*?)\$\$/
                );

              if (!match) {
                return;
              }

              return {
                type: 'mathBlock',
                raw: match[0],
                text: match[1].trim()
              };
            },

            renderer(token) {
              return (
                `$$\n` +
                `${token.text}\n` +
                `$$`
              );
            }
          }
        ]
      });
    }

    if (window.marked?.setOptions) {
      marked.setOptions({
        gfm: true,
        breaks: false,
        mangle: false,
        headerIds: false
      });
    }

    // ----------------------------------------------------------
    // INITIAL ARTICLE RENDER
    // ----------------------------------------------------------

    await renderMarkdown(
      markdown,
      contentEl,
      mdDirUrl,
      imagesBaseDirUrl
    );

    // ----------------------------------------------------------
    // RESTORE SCROLL POSITION AFTER MANUAL PAGE RELOAD
    // ----------------------------------------------------------

    const navEntry =
      performance.getEntriesByType(
        'navigation'
      )[0];

    if (
      navEntry &&
      navEntry.type === 'reload'
    ) {
      try {
        const savedState =
          JSON.parse(
            sessionStorage.getItem(
              'scrollState'
            )
          );

        if (
          savedState &&
          savedState.slug === raw
        ) {
          setTimeout(() => {
            window.scrollTo(
              0,
              savedState.scrollY
            );
          }, 10);
        }
      } catch (error) {
        console.debug(
          '[article] Could not restore scroll state:',
          error
        );
      }
    }

    // ----------------------------------------------------------
    // SCROLL TO HEADING IF URL CONTAINS A HASH
    // ----------------------------------------------------------

    if (window.location.hash) {
      const hashId =
        window.location.hash.substring(1);

      setTimeout(() => {
        const target =
          document.getElementById(hashId);

        if (target) {
          target.scrollIntoView();
        }
      }, 0);
    }

    // ==========================================================
    // LOCAL LIVE MARKDOWN PREVIEW
    // ==========================================================
    //
    // This section only runs when viewing the website locally.
    //
    // Example:
    //
    // http://127.0.0.1:5500/article.html?slug=...
    //
    // It DOES NOT run on GitHub Pages.
    //
    // Every 400ms:
    //
    // 1. Fetch the Markdown file.
    // 2. Compare it to the previous version.
    // 3. If unchanged -> do nothing.
    // 4. If changed -> rerender #article-content only.
    //
    // The browser page itself is never reloaded.
    // ==========================================================

    const isLocalDevelopment =
      location.hostname === '127.0.0.1' ||
      location.hostname === 'localhost' ||
      location.hostname === '[::1]';

    if (isLocalDevelopment) {
      console.log(
        '[article] Live Markdown preview enabled'
      );

      let liveUpdateInProgress = false;

      setInterval(async () => {
        // Don't waste requests while this browser tab
        // isn't visible.
        if (document.hidden) {
          return;
        }

        // Prevent overlapping updates if MathJax or
        // Markdown rendering takes longer than the
        // polling interval.
        if (liveUpdateInProgress) {
          return;
        }

        try {
          /*
           * Date.now() is added to the URL to prevent
           * the browser or local server from returning
           * a cached copy of the Markdown file.
           */
          const liveUrl =
            `${mdPath}?live=${Date.now()}`;

          const response =
            await fetch(liveUrl, {
              cache: 'no-store'
            });

          if (!response.ok) {
            return;
          }

          const newSource =
            await response.text();

          // File did not change.
          if (
            newSource ===
            lastMarkdownSource
          ) {
            return;
          }

          liveUpdateInProgress = true;

          console.log(
            '[article] Markdown changed — updating preview'
          );

          // Store the newest version.
          lastMarkdownSource =
            newSource;

          // Parse front matter again because the user
          // may also be editing article metadata.
          const parsed =
            extractFrontMatter(
              newSource
            );

          const newFrontMatter =
            parsed.frontMatter;

          const newMarkdown =
            parsed.body;

          // Update the image base in case imagesBase:
          // changed in the front matter.
          imagesBaseDirUrl =
            getImagesBaseDirUrl(
              newFrontMatter
            );

          // Update title/date/tags live as well.
          updateArticleMetadata(
            metaFromManifest,
            newFrontMatter,
            titleEl,
            metaEl
          );

          // Replace ONLY the article contents.
          await renderMarkdown(
            newMarkdown,
            contentEl,
            mdDirUrl,
            imagesBaseDirUrl
          );
        } catch (error) {
          console.debug(
            '[article] Live preview check failed:',
            error
          );
        } finally {
          liveUpdateInProgress = false;
        }
      }, 75);
    }
  } catch (err) {
    console.error(err);

    renderError(
      `<span style="color:red;">Error:</span> ` +
      `${escapeHtml(err.message)}`
    );
  }
});


// ============================================================
// FRONT MATTER / METADATA
// ============================================================

function normalizeSlug(raw) {
  return decodeURIComponent(raw)
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '')
    .replace(/^content\//i, '');
}


function extractFrontMatter(markdown) {
  if (!markdown.startsWith('---')) {
    return {
      frontMatter: {},
      body: markdown
    };
  }

  const endIdx =
    markdown.indexOf(
      '\n---',
      3
    );

  if (endIdx === -1) {
    return {
      frontMatter: {},
      body: markdown
    };
  }

  const fmText =
    markdown
      .slice(3, endIdx)
      .trim();

  const frontMatter =
    parseFrontMatter(fmText);

  const body =
    markdown.slice(
      endIdx + 4
    );

  return {
    frontMatter,
    body
  };
}


function parseFrontMatter(text) {
  const lines =
    text.split(/\r?\n/);

  const result = {};

  lines.forEach((line) => {
    const idx =
      line.indexOf(':');

    if (idx === -1) {
      return;
    }

    const key =
      line
        .slice(0, idx)
        .trim();

    let value =
      line
        .slice(idx + 1)
        .trim();

    // Remove matching quotes.
    if (
      (
        value.startsWith('"') &&
        value.endsWith('"')
      ) ||
      (
        value.startsWith("'") &&
        value.endsWith("'")
      )
    ) {
      value =
        value.slice(1, -1);
    }

    // Parse simple array syntax:
    //
    // tags: [math, fourier, dft]
    //
    if (
      value.startsWith('[') &&
      value.endsWith(']')
    ) {
      const arrStr =
        value
          .slice(1, -1)
          .trim();

      result[key] =
        arrStr.length
          ? arrStr
              .split(',')
              .map((item) =>
                item
                  .trim()
                  .replace(
                    /^['"]|['"]$/g,
                    ''
                  )
              )
          : [];
    } else {
      result[key] =
        value;
    }
  });

  return result;
}


function getImagesBaseDirUrl(frontMatter) {
  if (!frontMatter?.imagesBase) {
    return null;
  }

  const cleaned =
    String(frontMatter.imagesBase)
      .replace(/\\/g, '/')
      .replace(/^\/+/, '');

  const baseCandidate =
    `./content/${cleaned}` +
    `${cleaned.endsWith('/') ? '' : '/'}`;

  return new URL(
    baseCandidate,
    window.location.href
  );
}


function updateArticleMetadata(
  metaFromManifest,
  frontMatter,
  titleEl,
  metaEl
) {
  const merged = {
    ...metaFromManifest,
    ...frontMatter
  };

  const title =
    merged.title ||
    metaFromManifest.title ||
    'Untitled';

  const dateStr =
    merged.date ||
    metaFromManifest.date ||
    '';

  const date =
    dateStr
      ? new Date(dateStr)
      : null;

  document.title =
    `${title} - Science & Programming Blog`;

  if (titleEl) {
    titleEl.textContent =
      title;
  }

  if (!metaEl) {
    return;
  }

  const pieces = [];

  if (
    date &&
    !isNaN(date)
  ) {
    pieces.push(
      date.toLocaleDateString(
        undefined,
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
      )
    );
  }

  const tags =
    merged.tags ||
    merged.keywords ||
    [];

  if (
    Array.isArray(tags) &&
    tags.length
  ) {
    pieces.push(
      'Tags: ' +
      tags.join(', ')
    );
  }

  metaEl.textContent =
    pieces.join(' • ');
}


// ============================================================
// MARKDOWN RENDERING
// ============================================================

async function renderMarkdown(
  markdown,
  contentEl,
  mdDirUrl,
  imagesBaseDirUrl
) {
  /*
   * Convert Obsidian-style heading links:
   *
   * [[#Heading]]
   *
   * into:
   *
   * [Heading](#heading)
   */

  markdown =
    markdown.replace(
      /\[\[#([^\]]+)\]\]/g,
      (
        match,
        captureGroup
      ) => {
        const linkText =
          captureGroup;

        const linkId =
          slugify(linkText);

        return (
          `[${linkText}]` +
          `(#${linkId})`
        );
      }
    );

  /*
   * Tell MathJax that its existing rendered elements
   * are about to be removed.
   *
   * This is particularly important during live updates.
   */

  if (
    window.MathJax?.typesetClear
  ) {
    try {
      MathJax.typesetClear(
        [contentEl]
      );
    } catch (error) {
      console.debug(
        '[article] MathJax clear failed:',
        error
      );
    }
  }

  // ----------------------------------------------------------
  // MARKDOWN -> HTML
  // ----------------------------------------------------------

  const html =
    typeof marked?.parse ===
    'function'
      ? marked.parse(markdown)
      : marked(markdown);

  contentEl.innerHTML =
    html;

  // ----------------------------------------------------------
  // FIX RELATIVE LINKS / IMAGES
  // ----------------------------------------------------------

  rewriteLinksAndMedia(
    contentEl,
    mdDirUrl,
    imagesBaseDirUrl
  );

  // ----------------------------------------------------------
  // IMAGE SETTINGS
  // ----------------------------------------------------------

  contentEl
    .querySelectorAll('img')
    .forEach((img) => {
      if (
        !img.hasAttribute(
          'loading'
        )
      ) {
        img.setAttribute(
          'loading',
          'lazy'
        );
      }

      img.decoding =
        'async';
    });

  // ----------------------------------------------------------
  // SYNTAX HIGHLIGHTING
  // ----------------------------------------------------------

  if (window.hljs) {
    contentEl
      .querySelectorAll(
        'pre code'
      )
      .forEach((block) => {
        try {
          hljs.highlightElement(
            block
          );
        } catch (error) {
          console.debug(
            '[article] Highlighting failed:',
            error
          );
        }
      });
  }

  // ----------------------------------------------------------
  // MATHJAX
  // ----------------------------------------------------------

  await typesetMath(
    contentEl
  );
}


// ============================================================
// MATHJAX
// ============================================================

async function typesetMath(el) {
  if (!window.MathJax) {
    return;
  }

  /*
   * article.html loads MathJax asynchronously.
   *
   * If it has not finished loading yet, wait for
   * the script's load event.
   */

  if (!MathJax.startup) {
    const mjScript =
      document.getElementById(
        'MathJax-script'
      );

    if (
      mjScript &&
      !mjScript.dataset._bound
    ) {
      mjScript.dataset._bound =
        '1';

      await new Promise(
        (resolve) => {
          mjScript.addEventListener(
            'load',
            resolve,
            {
              once: true
            }
          );
        }
      );
    }
  }

  if (
    MathJax.typesetPromise
  ) {
    try {
      await MathJax.typesetPromise(
        [el]
      );
    } catch (error) {
      console.error(
        'MathJax typeset failed:',
        error
      );
    }
  }
}


// ============================================================
// URL / MEDIA HELPERS
// ============================================================

function isAbsoluteUrl(url) {
  return (
    /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(
      url
    ) ||
    /^[a-z]+:/i.test(
      url
    )
  );
}


function resolveRelativeUrl(
  raw,
  mdDirUrl,
  imagesBaseDirUrl
) {
  if (!raw) {
    return raw;
  }

  let url =
    raw
      .replace(/\\/g, '/')
      .trim();

  // In-page heading links.
  if (
    url.startsWith('#')
  ) {
    return url;
  }

  // Links to another article.
  if (
    url.startsWith(
      'article.html?slug='
    )
  ) {
    return url;
  }

  // Absolute external URLs.
  if (
    isAbsoluteUrl(url)
  ) {
    return url;
  }

  // Absolute site paths.
  if (
    url.startsWith('/')
  ) {
    return url;
  }

  // Already starts at content/
  if (
    url.startsWith(
      'content/'
    )
  ) {
    const abs =
      new URL(
        `./${url}`,
        window.location.href
      );

    return (
      abs.pathname +
      abs.search +
      abs.hash
    );
  }

  /*
   * Optional alias:
   *
   * @img/image.png
   *
   * resolves using the article's imagesBase
   * front-matter setting.
   */

  if (
    imagesBaseDirUrl &&
    url.startsWith('@img/')
  ) {
    const abs =
      new URL(
        url.slice(5),
        imagesBaseDirUrl
      );

    return (
      abs.pathname +
      abs.search +
      abs.hash
    );
  }

  // Otherwise resolve relative to the
  // directory containing the Markdown file.
  const abs =
    new URL(
      url,
      mdDirUrl
    );

  return (
    abs.pathname +
    abs.search +
    abs.hash
  );
}


function rewriteSrcset(
  el,
  attr,
  mdDirUrl,
  imagesBaseDirUrl
) {
  const srcset =
    el.getAttribute(attr);

  if (!srcset) {
    return;
  }

  const parts =
    srcset
      .split(',')
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);

  const rewritten =
    parts
      .map((part) => {
        const match =
          part.match(
            /^(\S+)(\s+.+)?$/
          );

        if (!match) {
          return part;
        }

        const url =
          resolveRelativeUrl(
            match[1],
            mdDirUrl,
            imagesBaseDirUrl
          );

        const descriptor =
          match[2] || '';

        return (
          `${url}${descriptor}`
        );
      })
      .join(', ');

  el.setAttribute(
    attr,
    rewritten
  );
}


function rewriteLinksAndMedia(
  container,
  mdDirUrl,
  imagesBaseDirUrl
) {
  container
    .querySelectorAll(
      'img, a, video, audio, source'
    )
    .forEach((el) => {
      const attr =
        el.tagName === 'A'
          ? 'href'
          : 'src';

      const value =
        el.getAttribute(attr);

      if (value) {
        el.setAttribute(
          attr,
          resolveRelativeUrl(
            value,
            mdDirUrl,
            imagesBaseDirUrl
          )
        );
      }

      if (
        el.hasAttribute(
          'srcset'
        )
      ) {
        rewriteSrcset(
          el,
          'srcset',
          mdDirUrl,
          imagesBaseDirUrl
        );
      }
    });
}


// ============================================================
// SCROLL STATE
// ============================================================

window.addEventListener(
  'beforeunload',
  () => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const slug =
      params.get('slug');

    if (!slug) {
      return;
    }

    const state = {
      slug,
      scrollY:
        window.scrollY
    };

    sessionStorage.setItem(
      'scrollState',
      JSON.stringify(state)
    );
  }
);


// ============================================================
// ERROR HANDLING
// ============================================================

function renderError(message) {
  const article =
    document.getElementById(
      'article'
    );

  if (article) {
    article.innerHTML =
      `<p>${message}</p>`;
  }
}


function escapeHtml(value) {
  return String(value)
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#39;'
    );
}


// ============================================================
// HEADING SLUG HELPER
// ============================================================

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(
      /\s+/g,
      '-'
    )
    .replace(
      /[^\w\-]+/g,
      ''
    )
    .replace(
      /\-\-+/g,
      '-'
    );
}
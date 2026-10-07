/*
 * semantic.js
 *
 * Interactive semantic article graph for semantic.html.
 *
 * semantic-index.json (built by scripts/build-embeddings.mjs) holds every
 * article's chunk embeddings. The reader enters 1, 2 or 4 concepts, which are
 * embedded in the browser (scripts/semantic-worker.js), and every article is
 * placed by comparing its chunks with those concepts:
 *
 *   1 concept   X = similarity to the concept (1D, stacked as a beeswarm)
 *   2 concepts  X = similarity to concept 1, Y = similarity to concept 2
 *   4 concepts  X = projection onto (concept 2 - concept 1),
 *               Y = projection onto (concept 4 - concept 3)
 *
 * An article's coordinate on an axis is the mean of its top-K chunk scores,
 * where chunks are ranked by relevance to that axis (similarity, or the size
 * of the projection for opposing axes). K is set by the slider and defaults to
 * every chunk of the article.
 */

document.addEventListener('DOMContentLoaded', () => {
  const app = createSemanticGraph();
  if (app) app.start();
});

const INDEX_URL = 'semantic-index.json';
const WORKER_URL = 'scripts/semantic-worker.js';

// Categorical colour slots (CSS custom properties defined in semantic.html).
const GROUPS = [
  { key: 'mathematics', label: 'Mathematics', color: 'var(--series-1)' },
  { key: 'programming', label: 'Programming', color: 'var(--series-2)' },
  { key: 'other', label: 'Other', color: 'var(--series-3)' },
];
const GROUP_BY_KEY = new Map(GROUPS.map((g) => [g.key, g]));

const NODE_R = 6;
const NODE_R_ACTIVE = 8.5;
const HIT_RADIUS = 26;
const SLOW = 750;
const FAST = 220;

function createSemanticGraph() {
  const form = document.getElementById('semantic-form');
  const svgEl = document.getElementById('semantic-chart');
  if (!form || !svgEl || !window.d3) return null;

  const els = {
    form,
    svg: d3.select(svgEl),
    card: document.getElementById('chart-card'),
    tooltip: document.getElementById('chart-tooltip'),
    legend: document.getElementById('chart-legend'),
    status: document.getElementById('semantic-status'),
    presets: document.getElementById('presets'),
    slider: document.getElementById('k-slider'),
    kValue: document.getElementById('k-value'),
    plotButton: document.getElementById('plot-button'),
    table: document.getElementById('score-table'),
    inputs: Array.from(form.querySelectorAll('.concept-input')),
    modeRadios: Array.from(form.querySelectorAll('input[name="mode"]')),
  };

  const state = {
    index: null,
    articles: [],
    maxChunks: 1,
    mode: 2,
    conceptsByMode: { 1: [], 2: [], 4: [] },
    plotted: null,        // { mode, terms, axes } currently on screen
    K: Infinity,
    showAllLabels: false,
    active: null,         // article index under the pointer / focused
    tapped: null,         // article previewed by the last touch tap
    lastPointerType: 'mouse',
    positions: new Map(), // slug -> { x, y } target positions on screen
    requestId: 0,
  };

  const conceptCache = new Map();
  const embedder = createEmbedder(setStatus);
  const chart = createChart();

  // --------------------------------------------------------------------------
  // Startup
  // --------------------------------------------------------------------------

  async function start() {
    setStatus('Loading article index…');
    try {
      const resp = await fetch(INDEX_URL);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      state.index = await resp.json();
    } catch (err) {
      setStatus(`Couldn't load ${INDEX_URL} (${err.message}). Run "npm run build:embeddings" to generate it.`, true);
      return;
    }

    const { index } = state;
    embedder.configure(index.model, index.dtype);
    for (const [term, packed] of Object.entries(index.concepts || {})) {
      conceptCache.set(normalizeTerm(term), decodeVector(packed));
    }

    state.articles = index.articles.map((a, i) => {
      const dims = index.dims;
      const vectors = new Float32Array(a.chunks.length * dims);
      a.chunks.forEach((c, j) => vectors.set(decodeVector(c), j * dims));
      const group = GROUP_BY_KEY.get(String(a.category).toLowerCase()) || GROUP_BY_KEY.get('other');
      return {
        i,
        slug: a.slug,
        title: a.title,
        category: a.category,
        group,
        url: `article.html?slug=${encodeURIComponent(a.slug)}`,
        chunks: a.chunks,
        vectors,
      };
    });
    state.maxChunks = d3.max(state.articles, (a) => a.chunks.length) || 1;

    els.slider.max = String(state.maxChunks);
    els.slider.value = String(Math.min(3, state.maxChunks));

    for (const mode of [1, 2, 4]) {
      state.conceptsByMode[mode] = (index.presets?.[mode]?.[0] || []).slice();
    }

    // Restore a shared view from the URL (?c=a|b&k=5) if present.
    const params = new URLSearchParams(location.search);
    const fromUrl = (params.get('c') || '').split('|').map((t) => t.trim()).filter(Boolean);
    if ([1, 2, 4].includes(fromUrl.length)) {
      state.mode = fromUrl.length;
      state.conceptsByMode[state.mode] = fromUrl;
    }
    const kParam = parseInt(params.get('k'), 10);
    if (kParam >= 1 && kParam <= state.maxChunks) els.slider.value = String(kParam);
    state.K = sliderK();

    buildLegend();
    bindControls();
    setMode(state.mode, { plot: false });
    updateKLabel();
    plot();
  }

  // --------------------------------------------------------------------------
  // Controls
  // --------------------------------------------------------------------------

  function bindControls() {
    els.form.addEventListener('submit', (event) => {
      event.preventDefault();
      state.conceptsByMode[state.mode] = readInputs();
      plot();
    });

    els.modeRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        state.conceptsByMode[state.mode] = readInputs();
        setMode(Number(radio.value), { plot: true });
      });
    });

    // Start fetching the model as soon as someone starts typing a concept.
    els.inputs.forEach((input) => {
      input.addEventListener('focus', () => embedder.warmUp(), { once: true });
    });

    els.slider.addEventListener('input', () => {
      state.K = sliderK();
      updateKLabel();
      if (state.plotted) render(FAST);
    });
    els.slider.addEventListener('change', syncUrl);

    // Re-layout on width changes only (the chart sets its own height).
    let lastWidth = els.card.clientWidth;
    const resize = new ResizeObserver(() => {
      const width = els.card.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      if (state.plotted) render(0);
    });
    resize.observe(els.card);
  }

  function setMode(mode, { plot: shouldPlot }) {
    state.mode = mode;
    els.modeRadios.forEach((r) => { r.checked = Number(r.value) === mode; });

    // Slots: 0 = X (left), 1 = X right, 2 = Y (bottom), 3 = Y top.
    const slotsByMode = { 1: [0], 2: [0, 2], 4: [0, 1, 2, 3] };
    const placeholders = {
      1: ['concept'],
      2: ['concept 1', 'concept 2'],
      4: ['left', 'right', 'bottom', 'top'],
    };
    const labels = {
      1: ['Concept'],
      2: ['X axis concept', 'Y axis concept'],
      4: ['X axis left concept', 'X axis right concept', 'Y axis bottom concept', 'Y axis top concept'],
    };
    const slots = slotsByMode[mode];
    const concepts = state.conceptsByMode[mode];
    els.inputs.forEach((input) => {
      const slot = Number(input.dataset.slot);
      const pos = slots.indexOf(slot);
      input.hidden = pos === -1;
      if (pos === -1) return;
      input.value = concepts[pos] || '';
      input.placeholder = placeholders[mode][pos];
      input.setAttribute('aria-label', labels[mode][pos]);
    });
    els.form.querySelectorAll('.between').forEach((el) => { el.hidden = mode !== 4; });
    els.form.querySelector('[data-axis="y"]').hidden = mode === 1;
    els.form.querySelectorAll('.axis-name').forEach((el) => { el.hidden = mode === 1; });

    buildPresets();
    if (shouldPlot) plot();
  }

  function readInputs() {
    const slotsByMode = { 1: [0], 2: [0, 2], 4: [0, 1, 2, 3] };
    return slotsByMode[state.mode].map((slot) => els.inputs[slot].value.trim());
  }

  function buildPresets() {
    els.presets.textContent = '';
    const presets = state.index?.presets?.[state.mode] || [];
    if (!presets.length) return;
    const label = document.createElement('span');
    label.className = 'control-label';
    label.textContent = 'Try:';
    els.presets.appendChild(label);
    presets.forEach((terms) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';
      chip.textContent = state.mode === 4
        ? `${terms[0]} ↔ ${terms[1]} / ${terms[2]} ↔ ${terms[3]}`
        : terms.join(' · ');
      chip.addEventListener('click', () => {
        state.conceptsByMode[state.mode] = terms.slice();
        setMode(state.mode, { plot: true });
      });
      els.presets.appendChild(chip);
    });
  }

  function buildLegend() {
    els.legend.textContent = '';
    const present = new Set(state.articles.map((a) => a.group.key));
    GROUPS.filter((g) => present.has(g.key)).forEach((g) => {
      const item = document.createElement('span');
      item.className = 'legend-item';
      const dot = document.createElement('span');
      dot.className = 'legend-dot';
      dot.style.background = g.color;
      item.append(dot, document.createTextNode(g.label));
      els.legend.appendChild(item);
    });
    const spacer = document.createElement('span');
    spacer.className = 'legend-spacer';
    const toggle = document.createElement('label');
    toggle.className = 'legend-toggle';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.addEventListener('change', () => {
      state.showAllLabels = box.checked;
      render(FAST);
    });
    toggle.append(box, document.createTextNode('Label all articles'));
    els.legend.append(spacer, toggle);
  }

  function sliderK() {
    const k = Number(els.slider.value);
    return k >= state.maxChunks ? Infinity : k;
  }

  function updateKLabel() {
    const text = state.K === Infinity
      ? `All chunks (K = N, max ${state.maxChunks})`
      : `K = ${state.K} (or all, if an article has fewer)`;
    els.kValue.textContent = text;
    els.slider.setAttribute('aria-valuetext', state.K === Infinity ? 'All chunks' : `${state.K} chunks`);
  }

  function setStatus(message, isError = false) {
    els.status.textContent = message || '';
    els.status.classList.toggle('error', Boolean(isError));
  }

  function syncUrl() {
    if (!state.plotted) return;
    const params = new URLSearchParams();
    params.set('c', state.plotted.terms.join('|'));
    if (state.K !== Infinity) params.set('k', String(state.K === Infinity ? state.maxChunks : state.K));
    history.replaceState(null, '', `${location.pathname}?${params}`);
  }

  // --------------------------------------------------------------------------
  // Scoring
  // --------------------------------------------------------------------------

  async function plot() {
    const mode = state.mode;
    const terms = state.conceptsByMode[mode].map((t) => t.trim());
    if (terms.length !== mode || terms.some((t) => !t)) {
      setStatus(`Enter ${mode === 1 ? 'a concept' : `all ${mode} concepts`} to plot.`, true);
      return;
    }
    const requestId = ++state.requestId;
    const needsModel = terms.some((t) => !conceptCache.has(normalizeTerm(t)));
    if (needsModel) setBusy(true);

    let vectors;
    try {
      vectors = await conceptVectors(terms);
    } catch (err) {
      if (requestId === state.requestId) {
        setBusy(false);
        setStatus(`Couldn't embed those concepts: ${err.message}. The example concepts above still work offline.`, true);
      }
      return;
    }
    if (requestId !== state.requestId) return; // a newer request superseded this one
    setBusy(false);

    let axes;
    if (mode === 4) {
      const dx = difference(vectors[1], vectors[0]);
      const dy = difference(vectors[3], vectors[2]);
      if (!dx || !dy) {
        setStatus('The two concepts on an axis mean the same thing to the model. Pick two different concepts.', true);
        return;
      }
      axes = [
        makeAxis('projection', dx, { from: terms[0], to: terms[1] }),
        makeAxis('projection', dy, { from: terms[2], to: terms[3] }),
      ];
    } else {
      axes = vectors.map((v, i) => makeAxis('similarity', v, { term: terms[i] }));
    }

    state.plotted = { mode, terms, axes };
    setStatus('');
    syncUrl();
    render(SLOW);
  }

  async function conceptVectors(terms) {
    const keys = terms.map(normalizeTerm);
    const missing = [...new Set(keys.filter((k) => !conceptCache.has(k)))];
    if (missing.length) {
      const vectors = await embedder.embed(missing);
      missing.forEach((k, i) => conceptCache.set(k, Float32Array.from(vectors[i])));
    }
    return keys.map((k) => conceptCache.get(k));
  }

  /**
   * Score every chunk of every article against one axis and pre-sort them by
   * relevance, so the top-K mean for any K is a prefix-sum lookup.
   */
  function makeAxis(kind, direction, labels) {
    const dims = state.index.dims;
    const perArticle = state.articles.map((article) => {
      const n = article.chunks.length;
      const scores = new Float64Array(n);
      for (let c = 0; c < n; c++) {
        let s = 0;
        const off = c * dims;
        for (let d = 0; d < dims; d++) s += article.vectors[off + d] * direction[d];
        scores[c] = s;
      }
      const order = d3.range(n).sort(kind === 'similarity'
        ? (a, b) => scores[b] - scores[a]
        : (a, b) => Math.abs(scores[b]) - Math.abs(scores[a]));
      const prefix = new Float64Array(n + 1);
      order.forEach((c, j) => { prefix[j + 1] = prefix[j] + scores[c]; });
      return { scores, order, prefix };
    });

    // Axis range covers every possible K so positions stay comparable while
    // the slider moves.
    let lo = Infinity;
    let hi = -Infinity;
    perArticle.forEach(({ prefix }) => {
      for (let k = 1; k < prefix.length; k++) {
        const v = prefix[k] / k;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    });
    const pad = (hi - lo || 0.1) * 0.06;
    return { kind, labels, perArticle, domain: [lo - pad, hi + pad] };
  }

  function axisValue(axis, articleIndex) {
    const { prefix } = axis.perArticle[articleIndex];
    const k = Math.min(state.K, prefix.length - 1);
    return prefix[k] / k;
  }

  function usedK(article) {
    return Math.min(state.K, article.chunks.length);
  }

  // --------------------------------------------------------------------------
  // Rendering
  // --------------------------------------------------------------------------

  function render(duration) {
    const { mode, axes } = state.plotted;
    const values = axes.map((axis) => state.articles.map((a) => axisValue(axis, a.i)));
    const layout = chart.layout(mode);
    const x = d3.scaleLinear().domain(axes[0].domain).range([layout.left, layout.right]);
    const y = mode === 1
      ? null
      : d3.scaleLinear().domain(axes[1].domain).range([layout.bottom, layout.top]);

    // Target positions.
    let positions;
    if (mode === 1) {
      positions = beeswarm(values[0].map((v) => x(v)), layout);
    } else {
      positions = state.articles.map((a) => ({ x: x(values[0][a.i]), y: y(values[1][a.i]) }));
    }
    state.positions = new Map(state.articles.map((a) => [a.slug, positions[a.i]]));

    chart.drawAxes({ mode, axes, x, y, layout, duration });
    chart.drawNodes({ positions, values, duration });
    chart.drawLabels({ labelled: pickLabels(mode, values, positions, layout), duration });
    renderTable(values);
    if (state.active !== null) showTooltip(state.active);

    const axisText = mode === 4
      ? `X from ${axes[0].labels.from} to ${axes[0].labels.to}, Y from ${axes[1].labels.from} to ${axes[1].labels.to}`
      : axes.map((ax, i) => `${i ? 'Y' : 'X'} = similarity to ${ax.labels.term}`).join(', ');
    els.svg.attr('aria-label', `Semantic graph of ${state.articles.length} articles. ${axisText}.`);
  }

  /** Stack nodes vertically so a 1D axis doesn't collapse into one overlapping line. */
  function beeswarm(xs, layout) {
    const cy = (layout.top + layout.bottom) / 2;
    const nodes = state.articles.map((a) => {
      const prev = state.positions.get(a.slug);
      return { x: prev ? prev.x : xs[a.i], y: prev ? prev.y : cy + (a.i % 7 - 3), tx: xs[a.i] };
    });
    const sim = d3.forceSimulation(nodes)
      .force('x', d3.forceX((d) => d.tx).strength(1))
      .force('y', d3.forceY(cy).strength(0.05))
      .force('collide', d3.forceCollide(NODE_R + 2).iterations(3))
      .stop();
    for (let t = 0; t < 200; t++) sim.tick();
    return nodes.map((n) => ({
      x: Math.max(layout.left, Math.min(layout.right, n.x)),
      y: Math.max(layout.top, Math.min(layout.bottom, n.y)),
    }));
  }

  /**
   * Direct-label a few extreme articles (or all, if asked). Returns a map of
   * article index -> { x, y, anchor, leader }; labels never cover another
   * label or dot. On the 1D axis the best matches tend to cluster, so their
   * labels go in lanes above the beeswarm with a thin leader line.
   */
  function pickLabels(mode, values, positions, layout) {
    const idx = state.articles.map((a) => a.i);
    if (state.showAllLabels) {
      return new Map(idx.map((i) => {
        const side = fitsRight(state.articles[i].title, positions[i], layout) ? 'right' : 'left';
        return [i, sidePlacement(positions[i], side)];
      }));
    }

    const placed = [];
    const chosen = new Map();
    const free = (box, self) => !placed.some((b) => overlaps(b, box))
      && !positions.some((p, j) => j !== self && circleHitsBox(p, box));

    if (mode === 1) {
      const top = idx.sort((a, b) => values[0][b] - values[0][a]).slice(0, 6);
      const swarmTop = d3.min(positions, (p) => p.y) - NODE_R;
      for (const i of top) {
        const p = positions[i];
        const w = labelWidth(state.articles[i].title);
        const x = Math.max(layout.left, Math.min(layout.right - w, p.x - w / 2));
        for (let lane = 0; lane < 5; lane++) {
          const baseline = swarmTop - 10 - lane * 17;
          if (baseline - 12 < 2) break;
          const box = { x, y: baseline - 12, w, h: 16 };
          if (!free(box, i)) continue;
          placed.push(box);
          chosen.set(i, { x: x + w / 2, y: baseline, anchor: 'middle', leader: [p.x, p.y - NODE_R - 1, p.x, baseline + 3] });
          break;
        }
      }
      return chosen;
    }

    let candidates;
    if (mode === 2) {
      const byX = idx.slice().sort((a, b) => values[0][b] - values[0][a]).slice(0, 3);
      const byY = idx.slice().sort((a, b) => values[1][b] - values[1][a]).slice(0, 3);
      candidates = interleave(byX, byY);
    } else {
      const lists = [
        idx.slice().sort((a, b) => values[0][b] - values[0][a]),
        idx.slice().sort((a, b) => values[0][a] - values[0][b]),
        idx.slice().sort((a, b) => values[1][b] - values[1][a]),
        idx.slice().sort((a, b) => values[1][a] - values[1][b]),
      ].map((l) => l.slice(0, 2));
      candidates = interleave(...lists);
    }
    for (const i of candidates) {
      if (chosen.has(i)) continue;
      const title = state.articles[i].title;
      const sides = fitsRight(title, positions[i], layout) ? ['right', 'left', 'above', 'below'] : ['left', 'above', 'below'];
      for (const side of sides) {
        const box = labelBox(title, positions[i], side);
        if (box.x < layout.left - 40 || box.x + box.w > layout.right + 16 || box.y < 0) continue;
        if (!free(box, i)) continue;
        placed.push(box);
        chosen.set(i, sidePlacement(positions[i], side));
        break;
      }
    }
    return chosen;
  }

  function renderTable(values) {
    const { mode, axes } = state.plotted;
    const table = d3.select(els.table);
    const headers = ['Article', 'Category']
      .concat(axes.map((ax) => (mode === 4 ? `${ax.labels.from} ↔ ${ax.labels.to}` : `“${ax.labels.term}”`)))
      .concat(['Chunks used', 'Most relevant section']);
    table.selectAll('thead').data([0]).join('thead').selectAll('tr').data([0]).join('tr')
      .selectAll('th').data(headers).join('th')
      .attr('class', (_, i) => (i >= 2 && i < 2 + axes.length + 1 ? 'num' : null))
      .text((d) => d);

    const rows = state.articles.slice().sort((a, b) => values[0][b.i] - values[0][a.i]);
    const tr = table.selectAll('tbody').data([0]).join('tbody')
      .selectAll('tr').data(rows, (d) => d.slug).join('tr');
    tr.order();
    tr.selectAll('td').data((a) => {
      const best = bestChunk(axes[0], a);
      return [
        { link: a.url, text: a.title },
        { cat: a.group, text: a.group.label },
        ...axes.map((_, j) => ({ num: true, text: formatScore(values[j][a.i], mode === 4) })),
        { num: true, text: `${usedK(a)} / ${a.chunks.length}` },
        best.h
          ? { link: `${a.url}${best.a ? `#${best.a}` : ''}`, text: best.h }
          : { text: '(introduction)' },
      ];
    }).join('td')
      .attr('class', (d) => (d.num ? 'num' : null))
      .each(function (d) {
        const td = d3.select(this);
        td.selectAll('*').remove();
        td.text(null);
        if (d.link) {
          td.append('a').attr('href', d.link).text(d.text);
        } else if (d.cat) {
          td.append('span').attr('class', 'cat-dot').style('background', d.cat.color);
          td.append('span').text(d.text);
        } else {
          td.text(d.text);
        }
      });
  }

  function bestChunk(axis, article) {
    const { order } = axis.perArticle[article.i];
    return article.chunks[order[0]] || {};
  }

  // --------------------------------------------------------------------------
  // Hover / focus / tooltip
  // --------------------------------------------------------------------------

  function nearestArticle(px, py) {
    let best = null;
    let bestD = HIT_RADIUS * HIT_RADIUS;
    for (const a of state.articles) {
      const p = state.positions.get(a.slug);
      if (!p) continue;
      const d = (p.x - px) ** 2 + (p.y - py) ** 2;
      if (d < bestD) { bestD = d; best = a.i; }
    }
    return best;
  }

  function setActive(i) {
    if (state.active === i) return;
    state.active = i;
    chart.highlight(i === null ? null : state.articles[i].slug);
    if (i === null) hideTooltip();
    else showTooltip(i);
  }

  function showTooltip(i) {
    if (!state.plotted) return;
    const { mode, axes } = state.plotted;
    const a = state.articles[i];
    const tip = els.tooltip;
    tip.textContent = '';

    const title = document.createElement('div');
    title.className = 'tt-title';
    title.textContent = a.title;
    const cat = document.createElement('div');
    cat.className = 'tt-cat';
    cat.textContent = `${a.group.label} · top ${usedK(a)} of ${a.chunks.length} chunks`;
    tip.append(title, cat);

    axes.forEach((axis, j) => {
      const value = axisValue(axis, i);
      const row = document.createElement('div');
      row.className = 'tt-row';
      const v = document.createElement('span');
      v.className = 'tt-value';
      v.textContent = formatScore(value, mode === 4);
      const label = document.createElement('span');
      label.className = 'tt-axis';
      if (mode === 4) {
        const toward = value >= 0 ? axis.labels.to : axis.labels.from;
        label.textContent = `${j ? 'Y' : 'X'}: toward “${toward}”`;
      } else {
        label.textContent = `${axes.length > 1 ? (j ? 'Y: ' : 'X: ') : ''}similarity to “${axis.labels.term}”`;
      }
      row.append(v, label);
      tip.appendChild(row);
      const best = bestChunk(axis, a);
      const section = document.createElement('div');
      section.className = 'tt-section';
      section.textContent = `best match: ${best.h ? `§ ${best.h}` : 'introduction'}`;
      tip.appendChild(section);
    });

    const best = bestChunk(axes[0], a);
    if (best.t) {
      const quote = document.createElement('div');
      quote.className = 'tt-excerpt';
      quote.textContent = `“${best.t.length > 170 ? `${best.t.slice(0, 170).replace(/\s+\S*$/, '')}…` : best.t}”`;
      tip.appendChild(quote);
    }
    const hint = document.createElement('div');
    hint.className = 'tt-hint';
    hint.textContent = state.lastPointerType === 'touch' ? 'Tap again to open the article' : 'Click to open the article';
    tip.appendChild(hint);

    // Position next to the node, flipped to stay inside the card.
    const p = state.positions.get(a.slug);
    const svgBox = els.svg.node().getBoundingClientRect();
    const cardBox = els.card.getBoundingClientRect();
    const nx = svgBox.left - cardBox.left + p.x;
    const ny = svgBox.top - cardBox.top + p.y;
    tip.classList.add('is-visible');
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let left = nx + 14;
    if (left + tw > cardBox.width - 4) left = nx - 14 - tw;
    left = Math.max(4, left);
    // Above the node if it fits, else below it (may extend past the card).
    let top = ny - th - 10;
    if (top < 4) top = ny + 14;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function hideTooltip() {
    els.tooltip.classList.remove('is-visible');
  }

  function setBusy(busy) {
    els.card.classList.toggle('is-busy', busy);
    els.plotButton.disabled = busy;
    els.plotButton.textContent = busy ? 'Loading…' : 'Plot';
    if (busy) setStatus('Embedding your concepts…');
  }

  // --------------------------------------------------------------------------
  // Chart (D3)
  // --------------------------------------------------------------------------

  function createChart() {
    const svg = els.svg;
    const gGridX = svg.append('g').attr('class', 'grid grid-x');
    const gGridY = svg.append('g').attr('class', 'grid grid-y');
    const zeroX = svg.append('line').attr('class', 'zero-line').style('opacity', 0);
    const zeroY = svg.append('line').attr('class', 'zero-line').style('opacity', 0);
    const gAxisX = svg.append('g').attr('class', 'axis axis-x');
    const gAxisY = svg.append('g').attr('class', 'axis axis-y');
    const titles = {
      x: svg.append('text').attr('class', 'axis-title').attr('text-anchor', 'middle'),
      xFrom: svg.append('text').attr('class', 'axis-title').attr('text-anchor', 'start'),
      xTo: svg.append('text').attr('class', 'axis-title').attr('text-anchor', 'end'),
      y: svg.append('text').attr('class', 'axis-title').attr('text-anchor', 'middle'),
      yFrom: svg.append('text').attr('class', 'axis-title').attr('text-anchor', 'start'),
      yTo: svg.append('text').attr('class', 'axis-title').attr('text-anchor', 'end'),
    };
    const gLeaders = svg.append('g').attr('class', 'leaders');
    const gNodes = svg.append('g').attr('class', 'nodes');
    const gLabels = svg.append('g').attr('class', 'labels');

    // Pointer: nearest node within HIT_RADIUS is the hover target.
    svg.on('pointerdown', (event) => { state.lastPointerType = event.pointerType || 'mouse'; });
    svg.on('pointermove', (event) => {
      if (!state.plotted || event.pointerType === 'touch') return;
      const [px, py] = d3.pointer(event);
      setActive(nearestArticle(px, py));
    });
    svg.on('pointerleave', (event) => {
      if (event.pointerType !== 'touch') setActive(null);
    });
    svg.on('click', (event) => {
      if (!state.plotted) return;
      const [px, py] = d3.pointer(event);
      const onNode = event.target.closest && event.target.closest('a.node');
      const hit = onNode ? d3.select(onNode).datum().i : nearestArticle(px, py);
      if (hit === null) {
        state.tapped = null;
        setActive(null);
        return;
      }
      // Touch: first tap previews, second tap opens. (detail === 0 means the
      // click came from the keyboard, which always follows the link.)
      if (event.detail !== 0 && state.lastPointerType === 'touch' && state.tapped !== hit) {
        event.preventDefault();
        state.tapped = hit;
        setActive(hit);
        return;
      }
      if (!onNode) window.location.href = state.articles[hit].url;
    });

    function layout(mode) {
      const width = Math.max(300, els.svg.node().parentNode.clientWidth - 16);
      const height = mode === 1
        ? Math.round(Math.max(220, Math.min(300, width * 0.3)))
        : Math.round(Math.max(340, Math.min(620, width * 0.6)));
      svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
      const left = mode === 1 ? 20 : 62;
      return { width, height, left, right: width - 20, top: 18, bottom: height - 52 };
    }

    function drawAxes({ mode, axes, x, y, layout: L, duration }) {
      const t = svg.transition('axes').duration(duration).ease(d3.easeCubicInOut);
      const fmt = d3.format('.2f');
      const xTicks = Math.max(3, Math.round((L.right - L.left) / 90));
      const yTicks = Math.max(3, Math.round((L.bottom - L.top) / 60));

      gAxisX.attr('transform', `translate(0,${L.bottom})`)
        .transition(t).call(d3.axisBottom(x).ticks(xTicks).tickFormat(fmt).tickSizeOuter(0));
      gGridX.transition(t).style('opacity', 1)
        .call(d3.axisBottom(x).ticks(xTicks).tickSize(L.bottom - L.top).tickFormat(''))
        .attr('transform', `translate(0,${L.top})`);

      if (y) {
        gAxisY.attr('transform', `translate(${L.left},0)`)
          .transition(t).style('opacity', 1)
          .call(d3.axisLeft(y).ticks(yTicks).tickFormat(fmt).tickSizeOuter(0));
        gGridY.attr('transform', `translate(${L.left},0)`)
          .transition(t).style('opacity', 1)
          .call(d3.axisLeft(y).ticks(yTicks).tickSize(-(L.right - L.left)).tickFormat(''));
      } else {
        gAxisY.transition(t).style('opacity', 0);
        gGridY.transition(t).style('opacity', 0);
      }

      // Zero lines mark the neutral point of an opposing axis.
      const showZeroX = mode === 4 && x.domain()[0] < 0 && x.domain()[1] > 0;
      const showZeroY = mode === 4 && y && y.domain()[0] < 0 && y.domain()[1] > 0;
      zeroX.transition(t).style('opacity', showZeroX ? 1 : 0)
        .attr('x1', showZeroX ? x(0) : L.left).attr('x2', showZeroX ? x(0) : L.left)
        .attr('y1', L.top).attr('y2', L.bottom);
      zeroY.transition(t).style('opacity', showZeroY ? 1 : 0)
        .attr('y1', showZeroY ? y(0) : L.bottom).attr('y2', showZeroY ? y(0) : L.bottom)
        .attr('x1', L.left).attr('x2', L.right);

      // Axis titles are generated from the concepts.
      const titleY = L.bottom + 42;
      const midX = (L.left + L.right) / 2;
      const midY = (L.top + L.bottom) / 2;
      const q = (s) => `“${s}”`;
      if (mode === 4) {
        titles.x.text('');
        titles.xFrom.attr('x', L.left).attr('y', titleY).text(`← ${axes[0].labels.from}`);
        titles.xTo.attr('x', L.right).attr('y', titleY).text(`${axes[0].labels.to} →`);
        titles.y.text('');
        titles.yFrom.attr('transform', `translate(16,${L.bottom}) rotate(-90)`).text(`← ${axes[1].labels.from}`);
        titles.yTo.attr('transform', `translate(16,${L.top}) rotate(-90)`).text(`${axes[1].labels.to} →`);
      } else {
        titles.xFrom.text('');
        titles.xTo.text('');
        titles.yFrom.text('');
        titles.yTo.text('');
        titles.x.attr('x', midX).attr('y', titleY).text(`Similarity to ${q(axes[0].labels.term)} →`);
        titles.y.attr('transform', `translate(16,${midY}) rotate(-90)`)
          .text(mode === 2 ? `Similarity to ${q(axes[1].labels.term)} →` : '');
      }
    }

    function drawNodes({ positions, duration }) {
      const t = svg.transition('nodes').duration(duration).ease(duration >= SLOW ? d3.easeCubicInOut : d3.easeCubicOut);
      gNodes.selectAll('a.node')
        .data(state.articles, (d) => d.slug)
        .join((enter) => {
          const a = enter.append('a')
            .attr('class', 'node')
            .attr('href', (d) => d.url)
            .attr('transform', (d) => `translate(${positions[d.i].x},${positions[d.i].y})`)
            .style('opacity', 0)
            .on('focus', (event, d) => setActive(d.i))
            .on('blur', () => setActive(null));
          a.append('circle')
            .attr('r', NODE_R)
            .style('fill', (d) => d.group.color);
          return a;
        })
        .attr('aria-label', (d) => d.title)
        .transition(t)
        .style('opacity', 1)
        .attr('transform', (d) => `translate(${positions[d.i].x},${positions[d.i].y})`);
      if (state.active !== null) highlight(state.articles[state.active].slug);
    }

    function drawLabels({ labelled, duration }) {
      const t = svg.transition('labels').duration(duration).ease(d3.easeCubicInOut);
      const data = state.articles.filter((a) => labelled.has(a.i));
      const at = (d) => labelled.get(d.i);
      const place = (sel) => sel
        .attr('x', (d) => at(d).x)
        .attr('y', (d) => at(d).y)
        .attr('text-anchor', (d) => at(d).anchor);
      gLabels.selectAll('text.node-label')
        .data(data, (d) => d.slug)
        .join(
          (enter) => enter.append('text')
            .attr('class', 'node-label')
            .style('opacity', 0)
            .text((d) => d.title)
            .call(place),
          (update) => update,
          (exit) => exit.transition(t).style('opacity', 0).remove(),
        )
        .transition(t)
        .style('opacity', 1)
        .call(place);

      const leaders = data.filter((d) => at(d).leader);
      const line = (sel) => sel
        .attr('x1', (d) => at(d).leader[0]).attr('y1', (d) => at(d).leader[1])
        .attr('x2', (d) => at(d).leader[2]).attr('y2', (d) => at(d).leader[3]);
      gLeaders.selectAll('line')
        .data(leaders, (d) => d.slug)
        .join(
          (enter) => enter.append('line').attr('class', 'leader').style('opacity', 0).call(line),
          (update) => update,
          (exit) => exit.transition(t).style('opacity', 0).remove(),
        )
        .transition(t)
        .style('opacity', 1)
        .call(line);
    }

    function highlight(slug) {
      gNodes.selectAll('a.node')
        .classed('is-active', (d) => d.slug === slug)
        .select('circle')
        .attr('r', (d) => (d.slug === slug ? NODE_R_ACTIVE : NODE_R));
      if (slug) gNodes.selectAll('a.node').filter((d) => d.slug === slug).raise();
    }

    return { layout, drawAxes, drawNodes, drawLabels, highlight };
  }

  return { start };
}

// ----------------------------------------------------------------------------
// Embedding worker wrapper
// ----------------------------------------------------------------------------

function createEmbedder(setStatus) {
  let worker = null;
  let model = null;
  let dtype = null;
  let nextId = 1;
  const pending = new Map();
  const files = new Map();

  function failAll(message) {
    pending.forEach(({ reject }) => reject(new Error(message)));
    pending.clear();
    worker = null;
  }

  function ensureWorker() {
    if (worker) return worker;
    try {
      worker = new Worker(WORKER_URL, { type: 'module' });
    } catch (err) {
      throw new Error(`this browser can't run the embedding model (${err.message})`);
    }
    worker.addEventListener('message', ({ data }) => {
      if (data.type === 'progress') {
        if (data.file && data.total) files.set(data.file, { loaded: data.loaded || 0, total: data.total });
        const total = d3.sum(Array.from(files.values()), (f) => f.total);
        const loaded = d3.sum(Array.from(files.values()), (f) => f.loaded);
        if (data.status === 'progress' && total > 0) {
          setStatus(`Downloading the embedding model (one time, ${(total / 1e6).toFixed(0)} MB)… ${Math.round((100 * loaded) / total)}%`);
        }
      } else if (data.type === 'ready') {
        if (!pending.size) setStatus('Embedding model ready: type any concept and press Plot.');
      } else if (data.type === 'result') {
        const job = pending.get(data.id);
        pending.delete(data.id);
        if (job) job.resolve(data.vectors);
      } else if (data.type === 'error') {
        if (data.id && pending.has(data.id)) {
          pending.get(data.id).reject(new Error(data.message));
          pending.delete(data.id);
        } else if (!data.id && pending.size) {
          failAll(data.message);
        }
      }
    });
    worker.addEventListener('error', (event) => {
      event.preventDefault();
      failAll(`the embedding model failed to load${event.message ? ` (${event.message})` : ''}`);
    });
    return worker;
  }

  return {
    configure(modelId, modelDtype) {
      model = modelId;
      dtype = modelDtype;
    },
    warmUp() {
      try {
        ensureWorker().postMessage({ type: 'load', model, dtype });
      } catch (err) {
        console.debug('[semantic] model warm-up failed:', err);
      }
    },
    embed(texts) {
      return new Promise((resolve, reject) => {
        let w;
        try {
          w = ensureWorker();
        } catch (err) {
          reject(err);
          return;
        }
        const id = nextId++;
        pending.set(id, { resolve, reject });
        w.postMessage({ type: 'embed', id, texts, model, dtype });
      });
    },
  };
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/** Concepts are compared case-insensitively (the model is uncased anyway). */
function normalizeTerm(term) {
  return term.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Decode an int8/base64 vector from semantic-index.json into a unit Float32Array. */
function decodeVector({ s, e }) {
  const bin = atob(e);
  const v = new Float32Array(bin.length);
  let norm = 0;
  for (let i = 0; i < bin.length; i++) {
    let q = bin.charCodeAt(i);
    if (q > 127) q -= 256;
    v[i] = q * s;
    norm += v[i] * v[i];
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= norm;
  return v;
}

/** Unit vector pointing from `from` to `to`, or null if they coincide. */
function difference(to, from) {
  const d = new Float32Array(to.length);
  let norm = 0;
  for (let i = 0; i < d.length; i++) {
    d[i] = to[i] - from[i];
    norm += d[i] * d[i];
  }
  norm = Math.sqrt(norm);
  if (norm < 1e-4) return null;
  for (let i = 0; i < d.length; i++) d[i] /= norm;
  return d;
}

function formatScore(value, signed) {
  const s = value.toFixed(3);
  return signed && value > 0 ? `+${s}` : s.replace('-', '−');
}

function interleave(...lists) {
  const out = [];
  const longest = Math.max(...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) lists.forEach((l) => { if (i < l.length) out.push(l[i]); });
  return out;
}

function labelWidth(text) {
  return text.length * 6.3 + 4;
}

function fitsRight(text, p, L) {
  return p.x + NODE_R + 4 + labelWidth(text) <= L.right + 16;
}

/** Text position for a label placed on one side of its dot. */
function sidePlacement(p, side) {
  const dx = { right: NODE_R + 4, left: -(NODE_R + 4), above: 0, below: 0 };
  const dy = { right: 4, left: 4, above: -(NODE_R + 5), below: NODE_R + 13 };
  const anchor = { right: 'start', left: 'end', above: 'middle', below: 'middle' };
  return { x: p.x + dx[side], y: p.y + dy[side], anchor: anchor[side], leader: null };
}

function labelBox(text, p, side) {
  const w = labelWidth(text);
  if (side === 'above') return { x: p.x - w / 2, y: p.y - NODE_R - 18, w, h: 16 };
  if (side === 'below') return { x: p.x - w / 2, y: p.y + NODE_R + 1, w, h: 16 };
  const x = side === 'left' ? p.x - NODE_R - 4 - w : p.x + NODE_R + 4;
  return { x, y: p.y - 8, w, h: 16 };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function circleHitsBox(p, box) {
  const cx = Math.max(box.x, Math.min(p.x, box.x + box.w));
  const cy = Math.max(box.y, Math.min(p.y, box.y + box.h));
  return (p.x - cx) ** 2 + (p.y - cy) ** 2 < (NODE_R + 1) ** 2;
}

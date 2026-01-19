/*
 * mindmap.js
 * Render a force-directed graph where node color & size are determined
 * ONLY by explicit `nodeType` in articles.json:
 *   - "topic", "subtopic", "article", "definition"
 */

document.addEventListener('DOMContentLoaded', () => {
  fetch('articles.json')
    .then(r => r.json())
    .then(articles => {
      const graph = buildGraph(articles);
      renderGraph(graph);
    })
    .catch(err => console.error('Failed to load articles.json:', err));
});

// Fixed style per explicit nodeType (no inference)
const TYPE_STYLE = {
  topic:      { color: '#1976d2', r: 18, stroke: 1.2 },
  subtopic:   { color: '#009688', r: 14, stroke: 1.2 },
  article:    { color: '#7e57c2', r: 10, stroke: 1.0 },
  definition: { color: '#ef6c00', r: 10, stroke: 1.0 }
};
const ALLOWED_TYPES = new Set(Object.keys(TYPE_STYLE));

/** Build nodes & links strictly from JSON (no virtual/grouping nodes). */
function buildGraph(articles) {
  const nodes = articles.map(a => {
    const rawType = String(a.nodeType || 'article').toLowerCase();
    const nodeType = ALLOWED_TYPES.has(rawType) ? rawType : 'article';
    const style = TYPE_STYLE[nodeType];
    return {
      id: a.slug,
      label: a.title || a.slug,
      nodeType,
      r: style.r,
      color: style.color,
      strokeWidth: style.stroke
    };
  });

  const idSet = new Set(nodes.map(n => n.id));
  const links = [];
  for (const a of articles) {
    if (!Array.isArray(a.links)) continue;
    for (const t of a.links) {
      const target = (t || '').trim();
      if (target && idSet.has(target)) {
        links.push({ source: a.slug, target });
      }
    }
  }

  return { nodes, links };
}

/** Render graph into #mindmap */
function renderGraph(graph) {
  const container = document.getElementById('mindmap');
  if (!container) return;
  container.innerHTML = '';

  const width  = container.clientWidth  || 900;
  const height = container.clientHeight || 600;

  const svg = d3.select(container).append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'var(--bg-color)'); // Ensure background matches theme

  // 1. Create a "g" group to hold everything (this is what we will zoom)
  const gContent = svg.append('g');

  // 2. Add Zoom Behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 8]) // Zoom out to 0.1x, in to 8x
    .on('zoom', (event) => {
      gContent.attr('transform', event.transform);
    });

  // Attach zoom to SVG
  svg.call(zoom)
     .on("dblclick.zoom", null); // Disable double-click zoom

  // Define Arrow Markers
  const defs = svg.append('defs');
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 16)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'currentColor');

  // 3. Append links/nodes to gContent (NOT svg)
  const link = gContent.append('g').attr('class', 'links')
    .selectAll('line')
    .data(graph.links)
    .join('line')
    .attr('class', 'link')
    .attr('stroke-width', 1.1)
    .attr('marker-end', 'url(#arrow)');

  const node = gContent.append('g').attr('class', 'nodes')
    .selectAll('g.node')
    .data(graph.nodes)
    .join('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      })
    );

  node.append('circle')
    .attr('r', d => d.r)
    .style('fill', d => d.color)
    .attr('stroke', 'currentColor')
    .attr('stroke-width', d => d.strokeWidth);

  node.append('text')
    .attr('dy', 4)
    .attr('x', d => d.r + 6)
    .text(d => d.label);

  node.on('click', (event, d) => {
    // Check if we are dragging (don't navigate if just dragging)
    if (event.defaultPrevented) return;
    window.location.href = `article.html?slug=${encodeURIComponent(d.id)}`;
  });

  // 4. Forces - Centered but NO clamping
  const simulation = d3.forceSimulation(graph.nodes)
    .force('link', d3.forceLink(graph.links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('collide', d3.forceCollide(d => d.r + 10))
    .force('x', d3.forceX(width / 2).strength(0.05)) // Gentle pull to center
    .force('y', d3.forceY(height / 2).strength(0.05));

  // 5. Tick function - Updates positions freely
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // Legend (Stays fixed on SVG, does not zoom)
  makeLegend(svg, width, [
    { label: 'Topic',      type: 'topic' },
    { label: 'Subtopic',   type: 'subtopic' },
    { label: 'Article',    type: 'article' },
    { label: 'Definition', type: 'definition' }
  ]);
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function makeLegend(svg, width, items) {
  const g = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - 160}, 16)`);

  const row = g.selectAll('g.row')
    .data(items)
    .join('g')
    .attr('class', 'row')
    .attr('transform', (_, i) => `translate(0, ${i * 22})`);

  row.append('circle')
    .attr('r', d => TYPE_STYLE[d.type].r * 0.6)
    .style('fill', d => TYPE_STYLE[d.type].color)
    .attr('stroke', 'currentColor')
    .attr('stroke-width', 1);

  row.append('text')
    .attr('x', 16)
    .attr('y', 4)
    .attr('fill', '#fff')   // <-- make legend text white
    .text(d => d.label);
}

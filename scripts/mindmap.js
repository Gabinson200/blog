/*
 * mindmap.js
 *
 * Builds a force‑directed graph visualising connections between articles.
 * Each node corresponds to an article and edges are defined by the
 * `links` array in articles.json. Clicking a node navigates to the
 * corresponding article page. The graph uses d3 force simulation.
 */

document.addEventListener('DOMContentLoaded', () => {
  fetch('articles.json')
    .then((resp) => resp.json())
    .then((articles) => {
      const graph = buildGraph(articles);
      renderGraph(graph);
    })
    .catch((err) => {
      console.error('Failed to load articles.json:', err);
    });
});

/**
 * Convert article metadata into graph representation.
 *
 * @param {Array} articles
 * @returns {{nodes: Array, links: Array}}
 */
function buildGraph(articles) {
  const nodes = articles.map((a) => ({ id: a.slug, name: a.title, group: a.category || 'default' }));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const links = [];
  articles.forEach((a) => {
    if (Array.isArray(a.links)) {
      a.links.forEach((target) => {
        // Only create link if target exists in graph to avoid broken edges
        if (nodeIds.has(target)) {
          links.push({ source: a.slug, target });
        }
      });
    }
  });
  return { nodes, links };
}

/**
 * Render the force‑directed graph using d3.
 *
 * @param {Object} graph
 */
function renderGraph(graph) {
  const container = document.getElementById('mindmap');
  if (!container) return;
  // Clear previous content
  container.innerHTML = '';
  const width = container.clientWidth;
  const height = container.clientHeight;
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Define arrow marker for directional links (optional)
  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 15)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'var(--accent-color)');

  // Create link and node elements
  const link = svg
    .append('g')
    .attr('stroke-width', 1.5)
    .selectAll('line')
    .data(graph.links)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('marker-end', 'url(#arrow)');

  const node = svg
    .append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll('g')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('class', 'node');

  node
    .append('circle')
    .attr('r', 8)
    .on('click', (event, d) => {
      window.location.href = `article.html?slug=${encodeURIComponent(d.id)}`;
    });

  node
    .append('text')
    .attr('dy', -12)
    .attr('text-anchor', 'middle')
    .text((d) => d.name);

  // Create simulation
  const simulation = d3
    .forceSimulation(graph.nodes)
    .force(
      'link',
      d3
        .forceLink(graph.links)
        .id((d) => d.id)
        .distance(100)
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked);

  // Drag functionality
  node.call(
    d3
      .drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded)
  );

  function ticked() {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    node.attr('transform', (d) => `translate(${d.x},${d.y})`);
  }

  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
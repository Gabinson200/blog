/*
 * mindmap.js
 * Render the knowledge graph in two views, switched with the 2D/3D toggle in
 * the top-right corner of #mindmap:
 *
 *   2D  force-directed graph (drag nodes, scroll/drag to zoom and pan).
 *   3D  static "orbital" layout: every node sits on a tilted ring around the
 *       larger node it links to (topic > subtopic > article), like moons
 *       around a planet. Nothing moves on its own; drag to rotate the camera
 *       and scroll to zoom.
 *
 * Going from 3D to 2D, the camera pulls back while every node's depth is
 * squashed to zero, projecting the graph onto the screen plane; the force
 * layout then relaxes the flattened graph. Going from 2D to 3D, the nodes
 * rise out of the plane into their orbits as the camera moves in.
 *
 * Node color & size are determined ONLY by explicit `nodeType` in
 * articles.json: "topic", "subtopic", "article", "definition".
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
  topic:      { color: '#1976d2', r: 18, stroke: 1.2, rank: 3 },
  subtopic:   { color: '#009688', r: 14, stroke: 1.2, rank: 2 },
  article:    { color: '#7e57c2', r: 10, stroke: 1.0, rank: 1 },
  definition: { color: '#ef6c00', r: 10, stroke: 1.0, rank: 1 }
};
const ALLOWED_TYPES = new Set(Object.keys(TYPE_STYLE));

const TRANSITION_MS = 1700;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      rank: style.rank,
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

// ============================================================
// 3D ORBITAL LAYOUT
// ============================================================

/**
 * Give every node one parent: the largest node it is linked to (in either
 * direction). Between equally sized nodes, the one the node itself links to
 * wins, so "DFT -> Fourier" makes DFT orbit Fourier. Cycles are skipped.
 */
function assignParents(nodes, links) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const candidates = new Map(nodes.map(n => [n, []]));
  links.forEach((l, order) => {
    const s = byId.get(l.source.id || l.source);
    const t = byId.get(l.target.id || l.target);
    if (!s || !t || s === t) return;
    if (t.rank >= s.rank) candidates.get(s).push({ node: t, outgoing: 1, order });
    if (s.rank > t.rank) candidates.get(t).push({ node: s, outgoing: 0, order });
  });

  const parent = new Map();
  for (const n of nodes) {
    const options = candidates.get(n).sort((a, b) =>
      b.node.rank - a.node.rank || b.outgoing - a.outgoing || a.order - b.order);
    for (const { node: p } of options) {
      let up = p;
      while (up && up !== n) up = parent.get(up);
      if (up === n) continue; // would create a cycle
      parent.set(n, p);
      break;
    }
  }
  return parent;
}

/** Small deterministic hash -> [0, 1) so the layout is identical on every load. */
function hash01(str, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const vec = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  scale: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
};

/**
 * Lay out nodes as nested orbital systems. Children sit on rings around their
 * parent; each ring is tilted differently so the system reads as 3D. Returns
 * the rings (for drawing orbit paths) and sets node.P = [x, y, z].
 */
function computeOrbitLayout(nodes, links) {
  const parent = assignParents(nodes, links);
  const children = new Map(nodes.map(n => [n, []]));
  parent.forEach((p, n) => children.get(p).push(n));
  const GAP = 28;
  const MAX_PER_RING = 7;
  // How far a child's own system must stay clear of its siblings. Topic and
  // subtopic systems keep fully apart. Chains of article moons (e -> Euler ->
  // Fourier -> DFT) may interpenetrate a little - their rings are tilted
  // apart in 3D - which stops them from growing the layout geometrically.
  const SOFT = 0.35;
  const reach = m => (m.rank > 1 ? m.extent : m.r + SOFT * (m.extent - m.r));

  // Bottom-up: size every system and split its children evenly into rings.
  function measure(n) {
    const kids = children.get(n);
    kids.forEach(measure);
    kids.sort((a, b) => reach(a) - reach(b) || a.label.localeCompare(b.label));
    n.rings = [];
    let inner = n.r + 34;
    const perRing = Math.ceil(kids.length / Math.ceil(kids.length / MAX_PER_RING));
    for (let i = 0; i < kids.length;) {
      const members = kids.slice(i, i + perRing);
      const maxReach = Math.max(...members.map(reach));
      // Each member gets a slice of the ring proportional to its size.
      const slices = members.map(m => 2 * reach(m) + GAP);
      const arc = d3.sum(slices);
      const radius = Math.max(inner + maxReach, (1.15 * arc) / (2 * Math.PI));
      let acc = 0;
      const angles = slices.map(w => { const a = (2 * Math.PI * (acc + w / 2)) / arc; acc += w; return a; });
      n.rings.push({ radius, members, angles });
      inner = radius + maxReach + GAP;
      i += members.length;
    }
    const last = n.rings[n.rings.length - 1];
    n.extent = last ? last.radius + Math.max(...last.members.map(m => m.extent)) : n.r;
  }

  // Top-down: place children on their tilted rings.
  const rings = [];
  function place(n, P) {
    n.P = P;
    n.rings.forEach((ring, j) => {
      const seed = hash01(n.id, j);
      const tilt = [0.95, -0.55, 1.25, -1.0][j % 4] + (seed - 0.5) * 0.4;
      const spin = seed * Math.PI * 2 + j * 2.1;
      // Ring normal: "up" tipped by `tilt`, then turned by `spin` around up.
      const normal = vec.norm([Math.sin(tilt) * Math.cos(spin), Math.cos(tilt), Math.sin(tilt) * Math.sin(spin)]);
      const u = vec.norm(vec.cross(normal, Math.abs(normal[0]) > 0.9 ? [0, 0, 1] : [1, 0, 0]));
      const v = vec.cross(normal, u);
      const phase = hash01(n.id, 97 + j) * Math.PI * 2;
      rings.push({ center: n, radius: ring.radius, u, v });
      ring.members.forEach((m, k) => {
        const a = phase + ring.angles[k];
        const offset = vec.add(vec.scale(u, Math.cos(a) * ring.radius), vec.scale(v, Math.sin(a) * ring.radius));
        place(m, vec.add(P, offset));
      });
    });
  }

  const roots = nodes.filter(n => !parent.has(n));
  roots.forEach(measure);
  roots.sort((a, b) => b.extent - a.extent || a.label.localeCompare(b.label));
  // Roots side by side along x, alternating slightly in depth.
  let cursor = 0;
  roots.forEach((root, i) => {
    const x = cursor + reach(root) * (i ? 1 : 0);
    place(root, [x, 0, (i % 2 ? -1 : 1) * Math.min(root.extent, 60)]);
    cursor = x + reach(root) + 40;
  });

  // Centre the whole layout on the origin and measure its bounding sphere.
  const c = [0, 1, 2].map(k => (d3.min(nodes, n => n.P[k]) + d3.max(nodes, n => n.P[k])) / 2);
  nodes.forEach(n => { n.P = [n.P[0] - c[0], n.P[1] - c[1], n.P[2] - c[2]]; });
  const radius = d3.max(nodes, n => Math.hypot(...n.P) + n.r) || 1;

  // Precompute each ring as a closed polyline in world space.
  const STEPS = 72;
  rings.forEach(ring => {
    ring.points = d3.range(STEPS).map(i => {
      const a = (2 * Math.PI * i) / STEPS;
      return vec.add(ring.center.P, vec.add(vec.scale(ring.u, Math.cos(a) * ring.radius), vec.scale(ring.v, Math.sin(a) * ring.radius)));
    });
  });

  return { rings, radius };
}

// ============================================================
// RENDERING
// ============================================================

/** Render graph into #mindmap */
function renderGraph(graph) {
  const container = document.getElementById('mindmap');
  if (!container) return;
  container.querySelectorAll('svg').forEach(el => el.remove());

  let width  = container.clientWidth  || 900;
  let height = container.clientHeight || 600;

  const svg = d3.select(container).insert('svg', ':first-child')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'var(--bg-color)'); // Ensure background matches theme

  // 1. Create a "g" group to hold everything (this is what we will zoom)
  const gContent = svg.append('g');

  // 2. Add Zoom Behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 8]) // Zoom out to 0.1x, in to 8x
    .on('zoom', (event) => {
      if (view.mode === '2d') gContent.attr('transform', event.transform);
    });

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

  // 3. Append rings/links/nodes to gContent (NOT svg)
  const layout3d = computeOrbitLayout(graph.nodes, graph.links);

  const orbit = gContent.append('g').attr('class', 'orbits')
    .selectAll('path')
    .data(layout3d.rings)
    .join('path')
    .attr('class', 'orbit')
    .style('display', 'none');

  const link = gContent.append('g').attr('class', 'links')
    .selectAll('line')
    .data(graph.links)
    .join('line')
    .attr('class', 'link')
    .attr('stroke-width', 1.1)
    .attr('marker-end', 'url(#arrow)');

  const nodeLayer = gContent.append('g').attr('class', 'nodes');
  const node = nodeLayer
    .selectAll('g.node')
    .data(graph.nodes)
    .join('g')
    .attr('class', 'node')
    .call(d3.drag()
      .filter(event => view.mode === '2d' && !event.ctrlKey && !event.button)
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

  const nodeElement = new Map();
  node.each(function (d) { nodeElement.set(d, this); });

  node.append('circle')
    .attr('r', d => d.r)
    .style('fill', d => d.color)
    .attr('stroke', 'currentColor')
    .attr('stroke-width', d => d.strokeWidth);

  const labelOffset = d => `translate(${d.r + 6},0)`;
  const label = node.append('text')
    .attr('dy', 4)
    .attr('transform', labelOffset)
    .text(d => d.label);

  node.on('click', (event, d) => {
    // Check if we are dragging (don't navigate if just dragging)
    if (event.defaultPrevented) return;
    if (view.mode !== '2d' && view.mode !== '3d') return;
    if (view.mode === '3d' && pointer.moved) return;
    window.location.href = `article.html?slug=${encodeURIComponent(d.id)}`;
  });

  // Hover: emphasise a node and its direct connections.
  const neighbours = new Map(graph.nodes.map(n => [n.id, new Set([n.id])]));
  graph.links.forEach(l => {
    neighbours.get(l.source).add(l.target);
    neighbours.get(l.target).add(l.source);
  });
  let hovered = null;
  node
    .on('pointerenter', (event, d) => { if (!pointer.down) { hovered = d.id; draw(); } })
    .on('pointerleave', () => { if (hovered) { hovered = null; draw(); } });
  const isDimmed = id => hovered !== null && !neighbours.get(hovered).has(id);

  // 4. Forces - Centered but NO clamping
  const simulation = d3.forceSimulation(graph.nodes)
    .force('link', d3.forceLink(graph.links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('collide', d3.forceCollide(d => d.r + 10))
    .force('x', d3.forceX(width / 2).strength(0.05)) // Gentle pull to center
    .force('y', d3.forceY(height / 2).strength(0.05));

  // 5. Tick function - Updates positions freely
  simulation.on('tick', () => {
    if (view.mode === '2d') draw();
  });

  // ------------------------------------------------------------
  // View state: '2d' | '3d' | 'to2d' | 'to3d'
  // ------------------------------------------------------------

  const view = {
    mode: '2d',
    camera: null,      // { yaw, pitch, dist }
    focal: 1,
    transition: null   // { t, from, to, ... } while animating
  };
  const pointer = { down: false, moved: false, x: 0, y: 0 };

  const DEFAULT_DIST = layout3d.radius * 3;

  /**
   * Pick the starting viewpoint: try a ring of camera angles and keep the one
   * where nodes crowd each other least once the view is fitted to the screen.
   */
  function chooseDefaultCamera() {
    let best = null;
    for (const pitch of [0.35, 0.55, 0.75, 0.95]) {
      for (let i = 0; i < 24; i++) {
        const cam = { yaw: (i * Math.PI) / 12, pitch, dist: DEFAULT_DIST };
        const pts = graph.nodes.map(d => toCamera(d.P, cam));
        const spanX = d3.max(pts, c => Math.abs(c[0])) + 60;
        const spanY = d3.max(pts, c => Math.abs(c[1])) + 30;
        const k = Math.min((0.45 * width) / spanX, (0.43 * height) / spanY);
        let crowding = 0;
        for (let a = 0; a < pts.length; a++) {
          for (let b = a + 1; b < pts.length; b++) {
            const d = Math.hypot(pts[a][0] - pts[b][0], (pts[a][1] - pts[b][1]) * 2) * k;
            if (d < 36) crowding += (36 - d) ** 2;
          }
        }
        if (!best || crowding < best.crowding) best = { cam, crowding, spanX, spanY };
      }
    }
    return best;
  }

  // Focal length: at the default camera the layout's projected bounding box
  // fills the view (the layout is wide, so this beats fitting its sphere).
  const initialView = chooseDefaultCamera();
  view.camera = { ...initialView.cam };
  const updateFocal = () => {
    view.focal = Math.min((0.45 * width) / initialView.spanX, (0.43 * height) / initialView.spanY) * DEFAULT_DIST;
  };
  updateFocal();

  /** World -> camera space (x right, y down, z towards the viewer). */
  function toCamera(P, cam = view.camera) {
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    const x1 = cy * P[0] + sy * P[2];
    const z1 = -sy * P[0] + cy * P[2];
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const y2 = cp * P[1] - sp * z1;
    const z2 = sp * P[1] + cp * z1;
    return [x1, -y2, z2];
  }

  /** Perspective projection of a camera-space point onto the screen. */
  function project(c, dist, origin) {
    // The floor keeps points that pass close to the camera mid-transition sane.
    const s = view.focal / Math.max(dist - c[2], dist * 0.15);
    return { x: origin[0] + c[0] * s, y: origin[1] + c[1] * s, s };
  }

  // ------------------------------------------------------------
  // Drawing
  // ------------------------------------------------------------

  function draw() {
    if (view.mode === '2d') draw2d();
    else draw3d();
  }

  function draw2d() {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      .style('opacity', d => (isDimmed(d.source.id) || isDimmed(d.target.id) ? 0.15 : null));

    node
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('opacity', d => (isDimmed(d.id) ? 0.25 : null));
  }

  /**
   * Draw the perspective view. Outside of transitions every node is at its
   * camera-space orbit position; during a transition each node's camera-space
   * position, the camera distance and the screen origin are interpolated.
   */
  function draw3d() {
    const tr = view.transition;
    const R = layout3d.radius;
    let dist = view.camera.dist;
    let origin = [width / 2, height / 2];
    let depthScale = 1;     // 1 = full depth, 0 = squashed onto the screen plane
    let cameraPos;          // node -> camera-space position

    if (tr) {
      dist = tr.dist;
      origin = tr.origin;
      depthScale = tr.depth;
      cameraPos = d => tr.positions.get(d);
    } else {
      cameraPos = d => toCamera(d.P);
    }

    const ringAlpha = depthScale * depthScale;
    const far = z => Math.min(1, Math.max(0, (R - z) / (2 * R))); // 0 = nearest, 1 = farthest
    const fog = z => 1 - 0.65 * depthScale * far(z);
    // Article labels on the far side fade out to cut clutter; topic and
    // subtopic labels always show, and hovering reveals any label.
    const labelAlpha = (d, z) => {
      if (d.rank > 1 || d.id === hovered) return 1;
      const t = Math.min(1, Math.max(0, (far(z) - 0.4) / 0.25));
      return 1 - depthScale * t;
    };

    // Orbits (drawn only while they have depth).
    orbit
      .style('display', ringAlpha > 0.02 ? null : 'none')
      .attr('d', ring => {
        if (ringAlpha <= 0.02) return null;
        const pts = ring.points.map(p => {
          const c = toCamera(p);
          const flattened = tr ? tr.ringCamera(c) : c;
          const s = project(flattened, dist, origin);
          return `${s.x.toFixed(1)},${s.y.toFixed(1)}`;
        });
        return `M${pts.join('L')}Z`;
      })
      .style('opacity', ring => ringAlpha * fog(toCamera(ring.center.P)[2]) * (isDimmed(ring.center.id) ? 0.3 : 1));

    // Nodes: position, perspective scale, depth fog, painter's order.
    const screen = new Map();
    graph.nodes.forEach(d => {
      const c = cameraPos(d);
      const p = project(c, dist, origin);
      screen.set(d, { ...p, z: c[2] });
    });

    node
      .attr('transform', d => {
        const p = screen.get(d);
        return `translate(${p.x},${p.y}) scale(${p.s})`;
      })
      .style('opacity', d => fog(screen.get(d).z) * (isDimmed(d.id) ? 0.25 : 1));
    // Labels shrink less than the circles with distance so far ones stay
    // readable; as depth is squashed this blends back to the plain 2D scale.
    label
      .attr('transform', d => `${labelOffset(d)} scale(${Math.pow(screen.get(d).s, -0.45 * depthScale)})`)
      .style('opacity', d => labelAlpha(d, screen.get(d).z));

    const order = graph.nodes.slice().sort((a, b) => screen.get(a).z - screen.get(b).z);
    const orderKey = order.map(n => n.id).join('|');
    if (orderKey !== view.orderKey) {
      view.orderKey = orderKey;
      order.forEach(n => nodeLayer.node().appendChild(nodeElement.get(n)));
    }

    link
      .attr('x1', d => screen.get(d.source).x).attr('y1', d => screen.get(d.source).y)
      .attr('x2', d => screen.get(d.target).x).attr('y2', d => screen.get(d.target).y)
      .style('opacity', d => {
        const z = (screen.get(d.source).z + screen.get(d.target).z) / 2;
        return fog(z) * (isDimmed(d.source.id) || isDimmed(d.target.id) ? 0.15 : 1);
      });
  }

  // ------------------------------------------------------------
  // Mode switching
  // ------------------------------------------------------------

  const easeInOut = d3.easeCubicInOut;
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  function enter3dStatic() {
    svg.on('.zoom', null);
    gContent.attr('transform', null);
    link.attr('marker-end', null);
    view.orderKey = null;
    svg.classed('is-3d', true);
  }

  function to3d() {
    simulation.stop();
    enter3dStatic();

    // Start: the current 2D picture expressed in camera space.
    const T = d3.zoomTransform(svg.node());
    const cx = width / 2, cy = height / 2;
    const start = new Map(graph.nodes.map(d => [d, [d.x - cx, d.y - cy, 0]]));
    const end = new Map(graph.nodes.map(d => [d, toCamera(d.P)]));
    const originStart = [T.k * cx + T.x, T.k * cy + T.y];
    const originEnd = [width / 2, height / 2];
    const distStart = view.focal / T.k;
    const distEnd = view.camera.dist;

    animate({
      toMode: '3d',
      frame: (t) => {
        const move = easeInOut(t);
        const rise = easeInOut(Math.min(1, Math.max(0, (t - 0.25) / 0.75)));
        const positions = new Map();
        graph.nodes.forEach(d => {
          const a = start.get(d), b = end.get(d);
          positions.set(d, [lerp(a[0], b[0], move), lerp(a[1], b[1], move), b[2] * rise]);
        });
        return {
          positions,
          depth: rise,
          dist: lerp(distStart, distEnd, move),
          origin: [lerp(originStart[0], originEnd[0], move), lerp(originStart[1], originEnd[1], move)],
          ringCamera: c => [c[0], c[1], c[2] * rise]
        };
      },
      done: () => draw3d()
    });
  }

  function to2d() {
    const cam = view.camera;
    const start = new Map(graph.nodes.map(d => [d, toCamera(d.P)]));

    // The camera pulls back far enough to fit the flattened graph (and always
    // at least noticeably), while depth is squashed onto the screen plane.
    const maxXY = d3.max(graph.nodes, d => Math.max(Math.abs(start.get(d)[0]), Math.abs(start.get(d)[1])) + d.r) || 1;
    const fitDist = (view.focal * maxXY) / (0.45 * Math.min(width, height));
    const distStart = cam.dist;
    const distEnd = Math.max(distStart * 1.3, fitDist);
    const origin = [width / 2, height / 2];

    animate({
      toMode: '2d',
      frame: (t) => {
        const e = easeInOut(t);
        const squash = 1 - e;
        const positions = new Map();
        graph.nodes.forEach(d => {
          const c = start.get(d);
          positions.set(d, [c[0], c[1], c[2] * squash]);
        });
        return {
          positions,
          depth: squash,
          dist: lerp(distStart, distEnd, e),
          origin,
          ringCamera: c => [c[0], c[1], c[2] * squash]
        };
      },
      done: () => {
        // Hand the flattened picture to the 2D force layout, matching the
        // zoom so nothing jumps.
        const k = view.focal / distEnd;
        const cx = width / 2, cy = height / 2;
        graph.nodes.forEach(d => {
          const c = start.get(d);
          d.x = cx + c[0];
          d.y = cy + c[1];
          d.vx = 0; d.vy = 0;
          d.fx = null; d.fy = null;
        });
        svg.classed('is-3d', false);
        orbit.style('display', 'none');
        link.attr('marker-end', 'url(#arrow)');
        label.attr('transform', labelOffset).style('opacity', null);
        nodeLayer.selectAll('g.node').sort((a, b) => graph.nodes.indexOf(a) - graph.nodes.indexOf(b));
        node.attr('transform', d => `translate(${d.x},${d.y})`);
        attachZoom();
        svg.call(zoom.transform, d3.zoomIdentity.translate(cx - k * cx, cy - k * cy).scale(k));
        draw2d();
        simulation.alpha(0.5).restart();
      }
    });
  }

  function animate({ toMode, frame, done }) {
    view.mode = toMode === '3d' ? 'to3d' : 'to2d';
    toggle.disabled = true;
    updateToggle();
    const duration = REDUCED_MOTION ? 0 : TRANSITION_MS;
    const finish = () => {
      view.transition = null;
      view.mode = toMode;
      toggle.disabled = false;
      updateToggle();
      done();
    };
    if (!duration) { finish(); return; }
    const timer = d3.timer(elapsed => {
      const t = Math.min(1, elapsed / duration);
      view.transition = frame(t);
      draw3d();
      if (t >= 1) {
        timer.stop();
        finish();
      }
    });
  }

  function attachZoom() {
    svg.on('.orbit', null);
    svg.call(zoom)
       .on('dblclick.zoom', null); // Disable double-click zoom
  }

  // ------------------------------------------------------------
  // 3D camera controls: drag to rotate, scroll to zoom
  // ------------------------------------------------------------

  function attachOrbitControls() {
    const R = layout3d.radius;
    const setDist = d => { view.camera.dist = Math.max(R * 1.25, Math.min(R * 9, d)); };
    const active = new Map(); // pointerId -> { x, y } for pinch-zoom
    let pinch = null;
    const spread = () => {
      const [a, b] = Array.from(active.values());
      return Math.hypot(a.x - b.x, a.y - b.y) || 1;
    };

    svg
      .on('pointerdown.orbit', (event) => {
        if (view.mode !== '3d' || event.button) return;
        active.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (active.size === 2) {
          pinch = { spread: spread(), dist: view.camera.dist };
          pointer.moved = true;
          return;
        }
        pointer.down = true;
        pointer.moved = false;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
      })
      .on('pointermove.orbit', (event) => {
        if (!active.has(event.pointerId) || view.mode !== '3d') return;
        active.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pinch && active.size >= 2) {
          setDist((pinch.dist * pinch.spread) / spread());
          draw3d();
          return;
        }
        const dx = event.clientX - pointer.x;
        const dy = event.clientY - pointer.y;
        if (!pointer.moved && Math.hypot(dx, dy) < 4) return;
        if (!pointer.moved) {
          // Capture only once it's a drag, so a plain click still reaches the node.
          pointer.moved = true;
          svg.node().setPointerCapture(event.pointerId);
        }
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        view.camera.yaw += dx * 0.006;
        view.camera.pitch = Math.max(-1.45, Math.min(1.45, view.camera.pitch + dy * 0.006));
        draw3d();
      })
      .on('pointerup.orbit pointercancel.orbit', (event) => {
        active.delete(event.pointerId);
        if (active.size < 2) pinch = null;
        if (active.size === 1) {
          // Continue rotating with the remaining finger without a jump.
          const [rest] = active.values();
          pointer.x = rest.x;
          pointer.y = rest.y;
        }
        pointer.down = active.size > 0;
      })
      .on('wheel.orbit', (event) => {
        if (view.mode !== '3d') return;
        event.preventDefault();
        setDist(view.camera.dist * Math.exp(event.deltaY * 0.0012));
        draw3d();
      });
  }

  // ------------------------------------------------------------
  // Toggle button (top right of #mindmap)
  // ------------------------------------------------------------

  const toggle = container.querySelector('#view-toggle') || createToggle(container);
  const hint = container.querySelector('.mindmap-hint');
  if (hint && window.matchMedia('(pointer: coarse)').matches) {
    hint.textContent = 'Drag to rotate · pinch to zoom';
  }

  function updateToggle(mode = view.mode) {
    const is3d = mode === '3d' || mode === 'to3d';
    toggle.setAttribute('aria-pressed', String(is3d));
    toggle.classList.toggle('is-3d', is3d);
    if (hint) hint.hidden = !is3d;
  }

  toggle.addEventListener('click', () => {
    if (view.mode === '2d') {
      attachOrbitControls();
      to3d();
    } else if (view.mode === '3d') {
      to2d();
    }
  });

  attachZoom();
  updateToggle();

  // Keep the SVG sized to its container.
  new ResizeObserver(() => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h || (w === width && h === height)) return;
    width = w; height = h;
    svg.attr('width', width).attr('height', height);
    simulation.force('x').x(width / 2);
    simulation.force('y').y(height / 2);
    updateFocal();
    if (view.mode === '3d') draw3d();
  }).observe(container);

  // Legend (Stays fixed on SVG, does not zoom)
  makeLegend(svg, width, [
    { label: 'Topic',      type: 'topic' },
    { label: 'Subtopic',   type: 'subtopic' },
    { label: 'Article',    type: 'article' },
    { label: 'Definition', type: 'definition' }
  ]);
}

function createToggle(container) {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'view-toggle';
  button.className = 'view-toggle';
  button.setAttribute('aria-label', '3D view');
  button.innerHTML = '<span>2D</span><span>3D</span>';
  container.appendChild(button);
  return button;
}

function makeLegend(svg, width, items) {
  const g = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(20, 22)');

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
    .style('fill', 'var(--text-color)')
    .text(d => d.label);
}

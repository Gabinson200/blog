/* scripts/build-embeddings.mjs
 *
 * Builds semantic-index.json, the data behind semantic.html.
 *
 * For every article listed in articles.json this script:
 *   1. reads content/<slug>.md and strips it down to prose (no code blocks,
 *      display math, iframes, markdown syntax, ...),
 *   2. splits it into semantic chunks: section headings are hard boundaries,
 *      and inside a section the text is cut where consecutive sentences stop
 *      being similar to each other (embedding distance), subject to a
 *      min/max chunk size,
 *   3. embeds every chunk with a small sentence-embedding model
 *      (all-MiniLM-L6-v2, 384 dims, 8-bit quantised ONNX via transformers.js)
 *      - the exact same model semantic.html loads in the browser to embed the
 *      concepts a reader types in, so both live in one vector space.
 *
 * Embeddings are cached per article, keyed on a hash of the markdown source,
 * so re-running this only re-embeds articles whose content changed.
 *
 * TO RUN:      npm install && npm run build:embeddings
 * Options:     --force         ignore the cache and re-embed everything
 *              --verify-model  always load the model and compare its
 *                              fingerprint with the cached one (used in CI)
 * Environment: EMBED_MODEL_PATH  load the model from a local directory laid
 *                                out as <path>/Xenova/all-MiniLM-L6-v2/...
 *                                instead of downloading it (offline builds)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// --- CONFIGURATION ---

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
const MODEL_DTYPE = 'q8';
const DIMS = 384;

// Bump this whenever the cleaning/chunking logic changes so cached
// chunks produced by the old logic are thrown away.
const CHUNKER_VERSION = 'semantic-v1';

const MIN_WORDS = 40;        // a chunk is not cut on a semantic break before this size
const MAX_WORDS = 150;       // hard cap (MiniLM reads at most 256 word pieces)
const MIN_SECTION_WORDS = 20; // tinier sections merge into the next chunk
const MIN_CHUNK_WORDS = 8;   // drop leftovers smaller than this
const BREAK_PERCENTILE = 0.8; // semantic breaks = top 20% most dissimilar gaps
const EXCERPT_CHARS = 200;

// Example concepts offered as one-click presets on semantic.html. Their
// embeddings are precomputed here so the default view renders instantly,
// without downloading the model in the browser.
const PRESETS = {
  1: [['geometry'], ['signal processing'], ['probability']],
  2: [['mathematics', 'programming'], ['waves', 'shapes'], ['geometry', 'algebra']],
  4: [
    ['theory', 'implementation', 'discrete', 'continuous'],
    ['mathematics', 'programming', 'images', 'equations'],
  ],
};

// Embedded on every verified build; if the model or runtime starts producing
// different vectors, every cached chunk is re-embedded. Single words drift the
// most between runtimes, so one probe is a single word.
const FINGERPRINT_PROBES = ['geometry', 'A probe sentence used to detect changes to the embedding model.'];
const FINGERPRINT_DIMS = 96;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'articles.json');
const CONTENT_DIR = path.join(ROOT, 'content');
const OUTPUT_PATH = path.join(ROOT, 'semantic-index.json');

const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const VERIFY_MODEL = args.has('--verify-model');

// --- MARKDOWN -> PROSE ---

/** Mirrors slugify() in scripts/article.js so anchors match rendered heading ids. */
function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function stripFrontMatter(md) {
  if (!md.startsWith('---')) return md;
  const end = md.indexOf('\n---', 3);
  return end === -1 ? md : md.slice(end + 4);
}

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&rarr;': '→', '&larr;': '←' };

/** Clean one line of inline markdown down to readable text. */
function cleanInline(text) {
  return text
    .replace(/!\[[^\]]*\]\((?:[^()]|\([^()]*\))*\)/g, ' ')   // images
    .replace(/\[\[#?([^\]|]+)\|([^\]]+)\]\]/g, '$2')        // [[target|label]]
    .replace(/\[\[#?([^\]]+)\]\]/g, '$1')                   // [[#Heading]]
    .replace(/\[([^\]]*)\]\((?:[^()]|\([^()]*\))*\)/g, '$1') // [text](url), url may contain (parens)
    .replace(/\$([^$\n]+?)\$/g, (_, m) => (/^[A-Za-z][A-Za-z0-9]{0,2}$/.test(m.trim()) ? m.trim() : ' '))
    .replace(/`([^`]*)`/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e] ?? ' ')
    .replace(/(\*\*|__|~~)/g, '')
    .replace(/(^|\W)[*_](\S[^*_]*?)[*_](?=\W|$)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text) {
  return (text.match(/[A-Za-z0-9][\w'’-]*/g) || []).length;
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=["'(\[]?[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Turn a markdown document into an ordered list of text units (sentences and
 * list items), each tagged with its section heading and the kind of boundary
 * that precedes it ('heading' | 'para' | 'sentence').
 */
function markdownToUnits(markdown) {
  let md = stripFrontMatter(markdown.replace(/\r\n?/g, '\n'));

  // Drop fenced code blocks (line-based so an unclosed fence can't eat the file twice).
  const kept = [];
  let fence = null;
  for (const line of md.split('\n')) {
    const m = line.match(/^\s*(```|~~~)/);
    if (m) {
      if (!fence) { fence = m[1]; continue; }
      if (m[1] === fence) { fence = null; continue; }
    }
    if (!fence) kept.push(line);
  }
  md = kept.join('\n');

  md = md
    .replace(/<!--[\s\S]*?-->/g, '\n')
    .replace(/<(iframe|script|style|svg)\b[\s\S]*?<\/\1>/gi, '\n')
    .replace(/\$\$[\s\S]*?\$\$/g, '\n')
    .replace(/\\begin\{([a-z*]+)\}[\s\S]*?\\end\{\1\}/g, '\n');

  const units = [];
  let heading = '';
  let anchor = '';
  let pendingBoundary = 'heading';
  let paragraph = [];

  const flushParagraph = () => {
    const text = cleanInline(paragraph.join(' '));
    paragraph = [];
    if (!text) return;
    for (const sentence of splitSentences(text)) {
      const words = countWords(sentence);
      if (!words) continue;
      units.push({ text: sentence, words, heading, anchor, boundary: pendingBoundary });
      pendingBoundary = 'sentence';
    }
    if (pendingBoundary === 'sentence') pendingBoundary = 'para';
  };

  for (const rawLine of md.split('\n')) {
    const line = rawLine.replace(/^\s*(>\s*)+/, '').trimEnd();   // blockquote markers
    const h = line.match(/^\s*#{1,6}\s+(.*?)\s*#*\s*$/);
    if (h) {
      flushParagraph();
      heading = cleanInline(h[1]);
      anchor = slugify(h[1]);
      pendingBoundary = 'heading';
      continue;
    }
    if (!line.trim() || /^\s*([-*_]\s*){3,}$/.test(line) || /^\s*\|?\s*:?-{3,}/.test(line)) {
      flushParagraph();
      continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      // Each list item is its own unit.
      flushParagraph();
      paragraph.push(line.replace(/^\s*([-*+]|\d+[.)])\s+/, ''));
      flushParagraph();
      continue;
    }
    if (/^\s*\|/.test(line)) {
      flushParagraph();
      paragraph.push(line.split('|').map((c) => c.trim()).filter(Boolean).join(', ') + '.');
      flushParagraph();
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();

  // Split run-on units (huge lists rendered as one line, etc.) at the size cap.
  return units.flatMap((u) => {
    if (u.words <= MAX_WORDS) return [u];
    const tokens = u.text.split(/\s+/);
    const parts = [];
    for (let i = 0; i < tokens.length; i += MAX_WORDS) {
      const text = tokens.slice(i, i + MAX_WORDS).join(' ');
      parts.push({ ...u, text, words: countWords(text), boundary: i === 0 ? u.boundary : 'sentence' });
    }
    return parts;
  });
}

// --- SEMANTIC CHUNKING ---

const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

function meanUnit(vectors) {
  const out = new Float32Array(vectors[0].length);
  for (const v of vectors) for (let i = 0; i < v.length; i++) out[i] += v[i];
  const n = Math.hypot(...out) || 1;
  for (let i = 0; i < out.length; i++) out[i] /= n;
  return out;
}

/**
 * Greedy segmentation of units into chunks.
 * gapScore[i] rates the gap *before* unit i: semantic distance between the
 * two sentences on either side of it (smoothed over a 2-unit window), plus a
 * small bonus for paragraph breaks. Headings always cut once the running
 * chunk is non-trivial.
 */
function segment(units, unitVectors) {
  const n = units.length;
  const gapScore = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    const left = meanUnit(unitVectors.slice(Math.max(0, i - 2), i));
    const right = meanUnit(unitVectors.slice(i, Math.min(n, i + 2)));
    gapScore[i] = 1 - dot(left, right) + (units[i].boundary === 'para' ? 0.05 : 0);
  }
  const sorted = Array.from(gapScore.slice(1)).sort((a, b) => a - b);
  const threshold = sorted.length ? sorted[Math.floor(sorted.length * BREAK_PERCENTILE)] : Infinity;

  const cuts = [0];
  let start = 0;
  let words = 0;
  for (let i = 0; i < n; i++) {
    if (i > start) {
      const isHeading = units[i].boundary === 'heading';
      if ((isHeading && words >= MIN_SECTION_WORDS) || (words >= MIN_WORDS && gapScore[i] >= threshold)) {
        cuts.push(i); start = i; words = 0;
      } else if (words + units[i].words > MAX_WORDS) {
        // Over the cap: cut at the most dissimilar gap that leaves a
        // reasonably sized chunk behind, then resume from there.
        let best = i;
        let acc = 0;
        let bestScore = -Infinity;
        for (let j = start + 1; j <= i; j++) {
          acc += units[j - 1].words;
          if (acc >= MIN_WORDS && gapScore[j] > bestScore) { bestScore = gapScore[j]; best = j; }
        }
        cuts.push(best); start = best;
        words = 0;
        for (let j = best; j < i; j++) words += units[j].words;
      }
    }
    words += units[i].words;
  }
  cuts.push(n);

  const chunks = [];
  for (let c = 0; c < cuts.length - 1; c++) {
    const part = units.slice(cuts[c], cuts[c + 1]);
    if (part.length) chunks.push(part);
  }
  // A small tail merges into the chunk before it (when it shares the section).
  for (let c = chunks.length - 1; c > 0; c--) {
    const w = chunks[c].reduce((s, u) => s + u.words, 0);
    if (w < MIN_SECTION_WORDS && chunks[c][0].anchor === chunks[c - 1][0].anchor) {
      chunks[c - 1] = chunks[c - 1].concat(chunks[c]);
      chunks.splice(c, 1);
    }
  }
  return chunks.filter((part) => part.reduce((s, u) => s + u.words, 0) >= MIN_CHUNK_WORDS);
}

/** Text that gets embedded: section headings inline, followed by their sentences. */
function chunkEmbedText(part) {
  const pieces = [];
  part.forEach((u, i) => {
    if ((i === 0 || u.boundary === 'heading') && u.heading) pieces.push(`${u.heading}.`);
    pieces.push(u.text);
  });
  return pieces.join(' ');
}

function excerpt(part) {
  const text = part.map((u) => u.text).join(' ');
  if (text.length <= EXCERPT_CHARS) return text;
  const cut = text.slice(0, EXCERPT_CHARS);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

// --- EMBEDDING STORAGE ---
// Each vector is stored as int8 values with one float scale (value = int8 * s),
// base64 encoded. That is ~5x smaller than float JSON and changes cosine
// similarities by well under 0.01.

function encodeVector(vec) {
  let max = 0;
  for (const x of vec) max = Math.max(max, Math.abs(x));
  const scale = max / 127 || 1;
  const q = new Int8Array(vec.length);
  for (let i = 0; i < vec.length; i++) q[i] = Math.round(vec[i] / scale);
  return { s: Number(scale.toPrecision(6)), e: Buffer.from(q.buffer).toString('base64') };
}

// --- MODEL ---

/**
 * Run the model on onnxruntime-web (WebAssembly) rather than the native
 * onnxruntime-node. The quantised model's integer kernels differ slightly
 * between the two (cosine ~0.99 between their outputs), while the WASM runtime
 * in Node gives the same numbers as the browser, so concepts typed on
 * semantic.html line up exactly with the chunk vectors built here.
 * The runtime is resolved through @huggingface/transformers so it is always
 * the version that the pinned transformers.js release loads in the browser.
 */
async function useWasmRuntime() {
  const require = createRequire(import.meta.url);
  const transformersEntry = require.resolve('@huggingface/transformers');
  const ortDist = path.dirname(createRequire(transformersEntry).resolve('onnxruntime-web'));
  const ort = await import(pathToFileURL(path.join(ortDist, 'ort.node.min.mjs')).href);
  ort.env.wasm.wasmPaths = pathToFileURL(ortDist + path.sep).href;
  ort.env.wasm.numThreads = 1; // browsers on GitHub Pages run single-threaded too
  globalThis[Symbol.for('onnxruntime')] = ort;
}

let extractorPromise = null;
async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      await useWasmRuntime();
      const { pipeline, env } = await import('@huggingface/transformers');
      env.cacheDir = path.join(ROOT, '.cache', 'transformers');
      if (process.env.EMBED_MODEL_PATH) {
        env.localModelPath = path.resolve(process.env.EMBED_MODEL_PATH) + path.sep;
        env.allowRemoteModels = false;
      }
      console.log(`🧠 Loading ${MODEL_ID} (${MODEL_DTYPE})...`);
      // 'auto' = let the injected WASM runtime pick its (only) backend.
      return pipeline('feature-extraction', MODEL_ID, { dtype: MODEL_DTYPE, device: 'auto' });
    })();
  }
  return extractorPromise;
}

/**
 * Embed texts one at a time. The quantised model picks its activation range
 * per batch, so batching would make a text's vector depend on its batch-mates
 * (and their padding). One text per call keeps every vector reproducible and
 * identical to what the browser computes for the same text.
 */
async function embed(texts) {
  const extractor = await getExtractor();
  const out = [];
  for (const text of texts) {
    const tensor = await extractor(text, { pooling: 'mean', normalize: true });
    out.push(Float32Array.from(tensor.data));
  }
  return out;
}

async function modelFingerprint() {
  const vectors = await embed(FINGERPRINT_PROBES);
  return vectors.map((v) => Array.from(v.slice(0, FINGERPRINT_DIMS), (x) => Number(x.toFixed(5))));
}

function sameFingerprint(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((u, i) => {
    const v = b[i];
    if (!Array.isArray(u) || !Array.isArray(v) || u.length !== v.length) return false;
    return dot(u, v) / Math.sqrt(dot(u, u) * dot(v, v)) > 0.9999;
  });
}

// --- BUILD ---

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function loadPreviousIndex() {
  if (FORCE || !fs.existsSync(OUTPUT_PATH)) return null;
  try {
    const prev = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    if (prev.model !== MODEL_ID || prev.dtype !== MODEL_DTYPE || prev.chunker !== CHUNKER_VERSION) return null;
    return prev;
  } catch {
    return null;
  }
}

async function main() {
  console.log('📖 Reading articles.json...');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  let previous = loadPreviousIndex();

  let fingerprint = previous?.fingerprint ?? null;
  if (VERIFY_MODEL || !previous) {
    const current = await modelFingerprint();
    if (previous && !sameFingerprint(previous.fingerprint, current)) {
      console.log('⚠️  Model output changed since the last build - re-embedding everything.');
      previous = null;
    }
    fingerprint = current;
  }

  const cachedArticles = new Map((previous?.articles ?? []).map((a) => [a.slug, a]));
  const articles = [];
  let embedded = 0;
  let reused = 0;

  for (const entry of manifest) {
    if (!entry.slug || !['article', 'definition'].includes(entry.nodeType)) continue;
    const mdPath = path.join(CONTENT_DIR, `${entry.slug}.md`);
    if (!fs.existsSync(mdPath)) {
      console.warn(`   ⚠️  Skipping ${entry.slug}: ${path.relative(ROOT, mdPath)} not found`);
      continue;
    }
    const source = fs.readFileSync(mdPath, 'utf8');
    const hash = sha256(`${CHUNKER_VERSION}\n${source}`);
    const meta = {
      slug: entry.slug,
      title: entry.title || entry.slug,
      category: entry.category || entry.slug.split('/')[0],
      summary: entry.summary || '',
    };

    const cached = cachedArticles.get(entry.slug);
    if (cached && cached.hash === hash) {
      articles.push({ ...meta, hash, chunks: cached.chunks });
      reused++;
      continue;
    }

    const units = markdownToUnits(source);
    if (!units.length) {
      console.warn(`   ⚠️  Skipping ${entry.slug}: no prose found`);
      continue;
    }
    const unitVectors = await embed(units.map((u) => u.text));
    const parts = segment(units, unitVectors);
    if (!parts.length) {
      console.warn(`   ⚠️  Skipping ${entry.slug}: too little prose to chunk`);
      continue;
    }
    const chunkVectors = await embed(parts.map(chunkEmbedText));
    const chunks = parts.map((part, i) => ({
      h: part[0].heading,
      a: part[0].anchor,
      w: part.reduce((s, u) => s + u.words, 0),
      t: excerpt(part),
      ...encodeVector(chunkVectors[i]),
    }));
    articles.push({ ...meta, hash, chunks });
    embedded++;
    console.log(`   ✏️  ${entry.slug}: ${chunks.length} chunks`);
  }

  // Preset concepts (instant first render in the browser).
  const presetTerms = [...new Set(Object.values(PRESETS).flat(2).map((t) => t.toLowerCase()))].sort();
  const concepts = {};
  const missing = presetTerms.filter((t) => !previous?.concepts?.[t]);
  const missingVectors = missing.length ? await embed(missing) : [];
  for (const term of presetTerms) {
    const i = missing.indexOf(term);
    concepts[term] = i === -1 ? previous.concepts[term] : encodeVector(missingVectors[i]);
  }

  const index = {
    version: 1,
    model: MODEL_ID,
    dtype: MODEL_DTYPE,
    dims: DIMS,
    pooling: 'mean',
    normalize: true,
    chunker: CHUNKER_VERSION,
    encoding: 'int8-base64',
    fingerprint,
    presets: PRESETS,
    concepts,
    articles,
  };

  // One article per line keeps diffs readable without bloating the file.
  const body = [
    '{',
    Object.entries(index)
      .filter(([k]) => k !== 'articles')
      .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
      .join(',\n') + ',',
    '  "articles": [',
    articles.map((a) => `    ${JSON.stringify(a)}`).join(',\n'),
    '  ]',
    '}',
    '',
  ].join('\n');

  const before = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
  if (before === body) {
    console.log(`✅ semantic-index.json already up to date (${articles.length} articles).`);
    return;
  }
  fs.writeFileSync(OUTPUT_PATH, body);
  const totalChunks = articles.reduce((s, a) => s + a.chunks.length, 0);
  console.log(`✅ Wrote ${path.relative(ROOT, OUTPUT_PATH)}: ${articles.length} articles, ${totalChunks} chunks`);
  console.log(`   Embedded ${embedded} article(s), reused ${reused} from cache, ${(body.length / 1024).toFixed(0)} KB.`);
}

main().catch((err) => {
  console.error('❌ Error building semantic index:', err);
  process.exit(1);
});

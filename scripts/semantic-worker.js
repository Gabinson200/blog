/*
 * semantic-worker.js
 *
 * Module worker used by semantic.html to embed the concepts a reader types
 * in. It runs the same sentence-embedding model that
 * scripts/build-embeddings.mjs used for the article chunks (the model id and
 * dtype are sent by the page, read from semantic-index.json), so concept and
 * chunk vectors can be compared directly. Running it in a worker keeps the
 * page responsive while the model downloads and compiles.
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0/dist/transformers.min.js';

// Always fetch from the Hugging Face hub (browser-cached after the first
// visit) instead of probing this site for a local /models folder.
env.allowLocalModels = false;

let extractorPromise = null;

function loadExtractor(model, dtype) {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', model, {
      dtype,
      progress_callback: (p) => {
        self.postMessage({
          type: 'progress',
          status: p.status,
          file: p.file,
          loaded: p.loaded,
          total: p.total,
        });
      },
    });
    extractorPromise.catch(() => { extractorPromise = null; });
  }
  return extractorPromise;
}

self.addEventListener('message', async ({ data }) => {
  try {
    const extractor = await loadExtractor(data.model, data.dtype);
    if (data.type === 'load') {
      self.postMessage({ type: 'ready' });
      return;
    }
    if (data.type === 'embed') {
      // One text per call, like the build script: the quantised model picks
      // its activation range per batch, so batching would shift the vectors.
      const vectors = [];
      for (const text of data.texts) {
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        vectors.push(Array.from(output.data));
      }
      self.postMessage({ type: 'result', id: data.id, vectors });
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: data.id, message: String((err && err.message) || err) });
  }
});

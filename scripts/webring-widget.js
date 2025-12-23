/*
 * webring-widget.js
 * * This script is intended to be embedded on member sites.
 * It fetches the central webring.json from the Ringmaster's site,
 * calculates neighbors, and renders the widget.
 */
(function () {
  // CONFIGURATION: UPDATE THIS TO YOUR PRODUCTION URL
  const DATA_URL = 'https://gabinson200.github.io/blog/webring.json';
  
  const CONTAINER_ID = 'thefirstman-webring';

  // Helper to strip protocol and trailing slashes for loose comparison
  function normalizeUrl(url) {
    return url.replace(/(^\w+:|^)\/\//, '').replace(/\/+$/, '').toLowerCase();
  }

  async function initRing() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
      console.warn(`Webring container #${CONTAINER_ID} not found.`);
      return;
    }

    try {
      const resp = await fetch(DATA_URL);
      if (!resp.ok) throw new Error('Failed to fetch webring data');
      const members = await resp.json();

      // Identify the current site
      const currentLoc = normalizeUrl(window.location.href);
      let index = members.findIndex(m => normalizeUrl(m.url) === currentLoc);

      // If not found (or testing locally), default to 0 or handle error
      if (index === -1) {
        console.warn('Current site not found in webring. Defaulting to Ringmaster.');
        index = 0; 
      }

      // Calculate neighbors
      const prevIndex = (index - 1 + members.length) % members.length;
      const nextIndex = (index + 1) % members.length;

      const prev = members[prevIndex];
      const next = members[nextIndex];

      // Inject HTML
      const html = `
        <div style="font-family: sans-serif; border: 1px solid #358150ff; padding: 1rem; border-radius: 6px; text-align: center; max-width: 400px; margin: 1rem auto; background: #000000ff;">
          <div style="margin-bottom: 0.5rem; font-weight: bold;">TheFirstMan's Webring</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <a href="${prev.url}" title="${prev.name}">&larr; ${prev.name}</a>
            <a href="${DATA_URL.replace('webring.json', 'webring.html')}" style="font-size: 0.9rem;">List</a>
            <a href="${next.url}" title="${next.name}">${next.name} &rarr;</a>
          </div>
        </div>
      `;
      
      container.innerHTML = html;

    } catch (err) {
      console.error('Webring Error:', err);
      container.innerHTML = '<p style="color:red; font-size: 0.8rem;">Webring offline</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRing);
  } else {
    initRing();
  }
})();

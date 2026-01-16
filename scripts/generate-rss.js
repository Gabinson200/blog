/* scripts/generate-rss.js */
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const SITE_URL = 'https://gabinson200.github.io/blog/';
const SITE_TITLE = "TheFirstMan's Blog";
const AUTHOR_NAME = "TheFirstMan";
const FEED_FILENAME = 'feed.xml';
const FEED_URL = `${SITE_URL}${FEED_FILENAME}`;

const JSON_PATH = path.join(__dirname, '../articles.json');
const OUTPUT_PATH = path.join(__dirname, `../${FEED_FILENAME}`);

// --- HELPERS ---

const escape = (str) => (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Robust Date Parser
const toRFC3339 = (dateStr) => {
    if (!dateStr) return new Date().toISOString();

    // 1. Try parsing exact string
    let date = new Date(dateStr);

    // 2. If invalid, try appending time (for simple YYYY-MM-DD)
    if (isNaN(date.getTime()) && !dateStr.includes('T')) {
        date = new Date(`${dateStr}T00:00:00Z`);
    }

    // 3. If STILL invalid (e.g. "2026-1-13" vs "2026-01-13"), try fixing sloppy months/days
    if (isNaN(date.getTime())) {
         const parts = dateStr.split('-');
         if (parts.length === 3) {
             const y = parts[0];
             const m = parts[1].padStart(2, '0'); // Fix "1" -> "01"
             const d = parts[2].padStart(2, '0'); // Fix "1" -> "01"
             date = new Date(`${y}-${m}-${d}T00:00:00Z`);
         }
    }

    // 4. Fallback: If absolutely nothing worked, use NOW to prevent crash
    if (isNaN(date.getTime())) {
        console.warn(`⚠️ Warning: Invalid date found: "${dateStr}". Using current time.`);
        return new Date().toISOString();
    }

    return date.toISOString();
};

// --- GENERATOR ---
try {
    console.log('📖 Reading articles.json...');
    const rawData = fs.readFileSync(JSON_PATH, 'utf8');
    let articles = JSON.parse(rawData);

    // 1. Filter: Only articles
    articles = articles.filter(a => a.nodeType === 'article');

    // 2. Sort: Newest first
    articles.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
    });

    // 3. Last Updated
    const lastUpdated = articles.length > 0 ? toRFC3339(articles[0].date) : new Date().toISOString();

    // 4. Build XML
    let xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>${escape(SITE_TITLE)}</title>
    <link href="${FEED_URL}" rel="self"/>
    <link href="${SITE_URL}"/>
    <updated>${lastUpdated}</updated>
    <id>${SITE_URL}</id>
    <author>
        <name>${escape(AUTHOR_NAME)}</name>
    </author>
`;

    articles.forEach(article => {
        if (!article.slug) return;

        const articleUrl = `${SITE_URL}article.html?slug=${encodeURIComponent(article.slug)}`;
        const publishedDate = toRFC3339(article.date);
        
        let categoryTags = '';
        if (article.category) categoryTags += `<category term="${escape(article.category)}"/>`;
        if (article.subcategory) categoryTags += `<category term="${escape(article.subcategory)}"/>`;

        xml += `
    <entry>
        <title>${escape(article.title)}</title>
        <link href="${articleUrl}"/>
        <id>${articleUrl}</id>
        <published>${publishedDate}</published>
        <updated>${publishedDate}</updated>
        <summary>${escape(article.summary || article.title)}</summary>
        ${categoryTags}
    </entry>`;
    });

    xml += `\n</feed>`;

    fs.writeFileSync(OUTPUT_PATH, xml);
    console.log(`✅ Success! Generated Atom feed at: ${OUTPUT_PATH}`);
    console.log(`   Items: ${articles.length}`);

} catch (e) {
    console.error('❌ Error generating Atom feed:', e);
    process.exit(1);
}

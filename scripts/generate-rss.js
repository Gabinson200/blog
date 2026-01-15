/* scripts/generate-rss.js */
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
// Ensure this URL matches exactly where your site is hosted (with trailing slash)
const SITE_URL = 'https://gabinson200.github.io/blog/';
const SITE_TITLE = "TheFirstMan's Blog";
const SITE_DESC = "Explorations in science, programming and curiosity.";

// Paths relative to this script
const JSON_PATH = path.join(__dirname, '../articles.json');
const RSS_PATH = path.join(__dirname, '../rss.xml');

// --- GENERATOR ---
try {
    console.log('📖 Reading articles.json...');
    const rawData = fs.readFileSync(JSON_PATH, 'utf8');
    let articles = JSON.parse(rawData);

    // Filter: You might want to exclude 'topic' or 'subtopic' nodes if they aren't real posts.
    // Uncomment the line below to ONLY show articles:
    // articles = articles.filter(a => a.nodeType === 'article');

    // Sort by date (newest first). 
    // Articles without dates get pushed to the bottom.
    articles.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });

    // Helper: Escape characters that break XML
    const escape = (str) => (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const dateNow = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>${escape(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}rss.xml" rel="self" type="application/rss+xml" />
    <description>${escape(SITE_DESC)}</description>
    <lastBuildDate>${dateNow}</lastBuildDate>
    <language>en-us</language>
`;

    articles.forEach(article => {
        // Skip items that have no slug (sanity check)
        if (!article.slug) return;

        // Construct the URL. Your system uses ?slug=
        // encodeURIComponent is crucial for slugs with spaces or special chars
        const url = `${SITE_URL}article.html?slug=${encodeURIComponent(article.slug)}`;
        
        // Handle Date: if missing, default to now, or skip. 
        // RSS readers HATE invalid dates.
        const dateObj = article.date ? new Date(article.date) : new Date();
        const pubDate = dateObj.toUTCString();

        // Construct a category string (e.g., "Programming / Graphics")
        let catString = article.category || 'General';
        if (article.subcategory) {
            catString += ` / ${article.subcategory}`;
        }

        xml += `    <item>
        <title>${escape(article.title)}</title>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <description>${escape(article.summary || article.title)}</description>
        <pubDate>${pubDate}</pubDate>
        <category>${escape(catString)}</category>
    </item>
`;
    });

    xml += `</channel>\n</rss>`;

    fs.writeFileSync(RSS_PATH, xml);
    console.log(`✅ Success! Wrote ${articles.length} items to rss.xml`);

} catch (e) {
    console.error('❌ Error generating RSS:', e);
    process.exit(1);
}

const fs = require('fs');
const path = require('path');

const galleryDataPath = path.join(__dirname, 'the-witcher', 'gallery-data.json');
const sitemapPath = path.join(__dirname, 'the-witcher', 'sitemap.xml');
const baseUrl = 'https://mouseia.com/the-witcher/';

console.log('Reading gallery data...');
const galleryData = JSON.parse(fs.readFileSync(galleryDataPath, 'utf8'));
console.log(`Found ${galleryData.length} items in the gallery.`);

const sitemapEntries = galleryData.map(item => {
  // Create a URL-friendly name from the filename for the hash
  const urlHash = encodeURIComponent(item.filename);
  return `
  <url>
    <loc>${baseUrl}#${urlHash}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
});

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ${sitemapEntries.join('')}
</urlset>`;

fs.writeFileSync(sitemapPath, sitemapContent);
console.log(`Sitemap successfully generated at ${sitemapPath}`);

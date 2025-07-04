const fs = require('fs');
const path = require('path');

// Define paths
const witcherDataPath = path.join(__dirname, 'the-witcher', 'gallery-data.json');
const sitemapPath = path.join(__dirname, 'sitemap.xml'); // Changed to root directory
const baseUrl = 'https://mouseia.com';

// --- Functions to build URL entries ---

function buildStaticUrl(urlPath, changefreq, priority) {
    return `
  <url>
    <loc>${baseUrl}${urlPath}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function buildGalleryUrls(galleryData, galleryPath) {
    return galleryData.map(item => {
        const urlHash = encodeURIComponent(item.filename);
        return `
  <url>
    <loc>${baseUrl}${galleryPath}#${urlHash}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');
}


// --- Main sitemap generation ---

console.log('Starting sitemap generation...');

let sitemapEntries = [];

// Add the main Witcher gallery page
sitemapEntries.push(buildStaticUrl('/the-witcher/', 'weekly', '0.9'));

// Add all individual Witcher images
try {
    const witcherData = JSON.parse(fs.readFileSync(witcherDataPath, 'utf8'));
    sitemapEntries.push(buildGalleryUrls(witcherData, '/the-witcher/'));
    console.log(`Added ${witcherData.length + 1} URLs for The Witcher gallery.`);
} catch (error) {
    console.error('Could not read or parse The Witcher gallery data.', error);
}

// Future-proofing: Add another gallery here if you create one
// For example:
// sitemapEntries.push(buildStaticUrl('/house-of-the-dragon/', 'weekly', '0.9'));
// const hotdData = JSON.parse(fs.readFileSync(path.join(__dirname, 'house-of-the-dragon', 'gallery-data.json'), 'utf8'));
// sitemapEntries.push(buildGalleryUrls(hotdData, '/house-of-the-dragon/'));

// --- Assemble and write the final sitemap ---

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries.join('')}
</urlset>`;

fs.writeFileSync(sitemapPath, sitemapContent);
console.log(`Sitemap successfully generated at ${sitemapPath}`);

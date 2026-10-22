const fs = require('fs');
const path = require('path');

const baseUrl = 'https://mouseia.com';
const sitemapPath = path.join(__dirname, 'sitemap.xml');
const shows = ['the-witcher', 'house-of-the-dragon', 'game-of-thrones'];

// Google reads at most 1,000 <image:image> tags per <url>, so a bigger gallery
// repeats its page's <url> once per chunk of images.
const maxImagesPerUrl = 1000;

// No <lastmod>: in a fresh checkout every file's mtime is the run time, so it
// would claim each gallery changed on every run. Google ignores <changefreq>
// and <priority>.

function escapeXml(value) {
    return value.replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
    })[char]);
}

function buildUrl(urlPath, imageUrls = []) {
    const images = imageUrls.map(src => `
    <image:image><image:loc>${escapeXml(src)}</image:loc></image:image>`).join('');
    return `
  <url>
    <loc>${baseUrl}${urlPath}</loc>${images}
  </url>`;
}


// --- Main sitemap generation ---

console.log('Starting sitemap generation...');

const sitemapEntries = [buildUrl('/')];

// A gallery that can't be read fails the run, so the workflow keeps the last
// good sitemap instead of committing one without that gallery.
for (const show of shows) {
    const galleryData = JSON.parse(fs.readFileSync(path.join(__dirname, show, 'gallery-data.json'), 'utf8'));
    const imageUrls = galleryData.map(item => item.src).filter(Boolean);
    let start = 0;
    do {
        sitemapEntries.push(buildUrl(`/${show}/`, imageUrls.slice(start, start + maxImagesPerUrl)));
        start += maxImagesPerUrl;
    } while (start < imageUrls.length);
    console.log(`Added ${imageUrls.length} images for /${show}/.`);
}

// --- Assemble and write the final sitemap ---

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${sitemapEntries.join('')}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemapContent);
console.log(`Sitemap successfully generated at ${sitemapPath}`);

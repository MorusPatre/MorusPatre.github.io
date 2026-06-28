const fs = require('fs');
const path = require('path');

const baseUrl = 'https://mouseia.com';
const generatedAt = new Date().toISOString();
const imageIndexPageSize = 500;

const collections = [
  {
    id: 'the-witcher',
    title: 'The Witcher',
    description: 'A searchable image gallery for The Witcher stills, promotional images, episode images, and production photos.',
    galleryPath: '/the-witcher/',
    dataPath: path.join(__dirname, 'the-witcher', 'gallery-data.json'),
    imageIndexDir: path.join(__dirname, 'the-witcher'),
    promoImage: 'https://mouseia.com/images/witcher-promo.webp'
  },
  {
    id: 'house-of-the-dragon',
    title: 'House of the Dragon',
    description: 'A searchable image gallery for House of the Dragon stills, promotional images, episode images, and production photos.',
    galleryPath: '/house-of-the-dragon/',
    dataPath: path.join(__dirname, 'house-of-the-dragon', 'gallery-data.json'),
    imageIndexDir: path.join(__dirname, 'house-of-the-dragon'),
    promoImage: 'https://mouseia.com/images/rhaenyra-promo.webp'
  }
];

function absoluteUrl(urlPath) {
  return new URL(urlPath, baseUrl).href;
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function xmlEscape(value) {
  return cleanText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function htmlEscape(value) {
  return cleanText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fileNameFromUrl(url) {
  try {
    return decodeURIComponent(path.basename(new URL(url).pathname));
  } catch {
    return cleanText(url);
  }
}

function itemTitle(item) {
  return cleanText(item.filename) || fileNameFromUrl(item.src);
}

function itemAlt(item, collection) {
  const alt = cleanText(item.alt);
  const usefulAlt = alt.replace(/Characters:|Cast:|\|/gi, '').trim();

  if (usefulAlt) {
    return alt;
  }

  const parts = [collection.title, itemTitle(item)];
  if (item.characters) {
    parts.push(cleanText(item.characters));
  }
  if (item.cast) {
    parts.push(cleanText(item.cast));
  }
  return parts.filter(Boolean).join(' - ');
}

function itemDetails(item) {
  const parts = [];

  if (item.characters) {
    parts.push(`Characters: ${cleanText(item.characters)}`);
  }
  if (item.cast) {
    parts.push(`Cast: ${cleanText(item.cast)}`);
  }
  if (item.season) {
    parts.push(`Season ${item.season}`);
  }
  if (item.episode) {
    parts.push(`Episode ${item.episode}`);
  }
  if (item.dimensions) {
    parts.push(cleanText(item.dimensions));
  }

  return parts.join(' | ');
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function imageIndexFileName(pageNumber) {
  return pageNumber === 1 ? 'image-index.html' : `image-index-${pageNumber}.html`;
}

function imageIndexUrlPath(collection, pageNumber) {
  return `${collection.galleryPath}${imageIndexFileName(pageNumber)}`;
}

function loadGalleryData(collection) {
  const data = JSON.parse(fs.readFileSync(collection.dataPath, 'utf8'));
  return data.filter(item => item && item.src && item.thumbnail);
}

function removeOldImageIndexes(collection) {
  if (!fs.existsSync(collection.imageIndexDir)) {
    return;
  }

  for (const fileName of fs.readdirSync(collection.imageIndexDir)) {
    if (/^image-index(?:-\d+)?\.html$/.test(fileName)) {
      fs.unlinkSync(path.join(collection.imageIndexDir, fileName));
    }
  }
}

function buildPagination(collection, currentPage, totalPages) {
  if (totalPages <= 1) {
    return '';
  }

  const links = [];
  for (let page = 1; page <= totalPages; page += 1) {
    const href = imageIndexUrlPath(collection, page);
    if (page === currentPage) {
      links.push(`<span aria-current="page">${page}</span>`);
    } else {
      links.push(`<a href="${htmlEscape(href)}">${page}</a>`);
    }
  }

  return `<nav class="pagination" aria-label="Image index pages">${links.join('')}</nav>`;
}

function buildImageIndexPage(collection, items, pageNumber, totalPages) {
  const canonicalUrl = absoluteUrl(imageIndexUrlPath(collection, pageNumber));
  const prevUrl = pageNumber > 1 ? absoluteUrl(imageIndexUrlPath(collection, pageNumber - 1)) : '';
  const nextUrl = pageNumber < totalPages ? absoluteUrl(imageIndexUrlPath(collection, pageNumber + 1)) : '';
  const introText = totalPages > 1
    ? `${collection.description} Page ${pageNumber} of ${totalPages}.`
    : collection.description;
  const figures = items.map(item => {
    const title = itemTitle(item);
    const details = itemDetails(item);
    const alt = itemAlt(item, collection);

    return `        <figure itemscope itemtype="https://schema.org/ImageObject">
          <a href="${htmlEscape(item.src)}" itemprop="contentUrl">
            <img src="${htmlEscape(item.thumbnail)}" alt="${htmlEscape(alt)}" loading="lazy" itemprop="thumbnailUrl">
          </a>
          <figcaption>
            <strong itemprop="name">${htmlEscape(title)}</strong>
            ${details ? `<span>${htmlEscape(details)}</span>` : ''}
            <meta itemprop="contentUrl" content="${htmlEscape(item.src)}">
            <meta itemprop="url" content="${htmlEscape(item.src)}">
          </figcaption>
        </figure>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${htmlEscape(collection.title)} Image Index${totalPages > 1 ? ` - Page ${pageNumber}` : ''} | Mouseia</title>
  <meta name="description" content="${htmlEscape(collection.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${htmlEscape(canonicalUrl)}">
  ${prevUrl ? `<link rel="prev" href="${htmlEscape(prevUrl)}">` : ''}
  ${nextUrl ? `<link rel="next" href="${htmlEscape(nextUrl)}">` : ''}
  <style>
    :root {
      color-scheme: dark;
      --bg: #171719;
      --panel: #242329;
      --text: #f6f1ea;
      --muted: #bcb4aa;
      --line: rgba(255, 255, 255, 0.14);
      --accent: #d4b06a;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }

    a {
      color: inherit;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem clamp(1rem, 4vw, 3rem);
      border-bottom: 1px solid var(--line);
      color: var(--muted);
      font-size: 0.9rem;
    }

    main {
      width: min(1440px, 100%);
      margin: 0 auto;
      padding: clamp(1.25rem, 4vw, 3rem);
    }

    h1 {
      margin: 0;
      font-size: 3rem;
      line-height: 1.05;
    }

    .intro {
      max-width: 760px;
      margin: 0.75rem 0 1.5rem;
      color: var(--muted);
    }

    .pagination {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.5rem 0;
    }

    .pagination a,
    .pagination span {
      min-width: 2.25rem;
      padding: 0.45rem 0.7rem;
      border: 1px solid var(--line);
      text-align: center;
      text-decoration: none;
    }

    .pagination span {
      border-color: var(--accent);
      color: var(--accent);
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 1rem;
    }

    figure {
      margin: 0;
      background: var(--panel);
      border: 1px solid var(--line);
    }

    figure a {
      display: block;
      aspect-ratio: 4 / 3;
      background: #0d0d0f;
      overflow: hidden;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    figcaption {
      padding: 0.75rem;
      font-size: 0.82rem;
    }

    figcaption strong,
    figcaption span {
      display: block;
      overflow-wrap: anywhere;
    }

    figcaption span {
      margin-top: 0.4rem;
      color: var(--muted);
    }

    @media (max-width: 640px) {
      h1 {
        font-size: 2.1rem;
      }

      .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <a href="/">Mouseia</a>
    <a href="${htmlEscape(collection.galleryPath)}">${htmlEscape(collection.title)} gallery</a>
  </header>
  <main>
    <h1>${htmlEscape(collection.title)} Image Index</h1>
    <p class="intro">${htmlEscape(introText)}</p>
    ${buildPagination(collection, pageNumber, totalPages)}
    <section class="image-grid" aria-label="${htmlEscape(collection.title)} images">
${figures}
    </section>
    ${buildPagination(collection, pageNumber, totalPages)}
  </main>
</body>
</html>
`;
}

function writeImageIndexes(collection, galleryData) {
  removeOldImageIndexes(collection);
  const pages = chunk(galleryData, imageIndexPageSize);

  pages.forEach((items, index) => {
    const pageNumber = index + 1;
    const filePath = path.join(collection.imageIndexDir, imageIndexFileName(pageNumber));
    fs.writeFileSync(filePath, buildImageIndexPage(collection, items, pageNumber, pages.length));
  });

  return pages.map((items, index) => ({
    urlPath: imageIndexUrlPath(collection, index + 1),
    images: items
  }));
}

function buildUrlEntry(urlPath, changefreq, priority, images = []) {
  const imageEntries = images.map(image => `
    <image:image>
      <image:loc>${xmlEscape(image.src || image)}</image:loc>
    </image:image>`).join('');

  return `
  <url>
    <loc>${xmlEscape(absoluteUrl(urlPath))}</loc>
    <lastmod>${generatedAt}</lastmod>
    <changefreq>${xmlEscape(changefreq)}</changefreq>
    <priority>${xmlEscape(priority)}</priority>${imageEntries}
  </url>`;
}

function writeRobots() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  fs.writeFileSync(path.join(__dirname, 'robots.txt'), robots);
}

function writeSitemap(imageIndexPagesByCollection) {
  const sitemapEntries = [
    buildUrlEntry('/', 'weekly', '1.0', collections.map(collection => collection.promoImage))
  ];

  collections.forEach(collection => {
    sitemapEntries.push(buildUrlEntry(collection.galleryPath, 'weekly', '0.9', [collection.promoImage]));

    imageIndexPagesByCollection
      .filter(page => page.collectionId === collection.id)
      .forEach(page => {
        sitemapEntries.push(buildUrlEntry(page.urlPath, 'monthly', '0.8', page.images));
      });
  });

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${sitemapEntries.join('')}
</urlset>
`;

  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapContent);
}

console.log('Starting SEO file generation...');

const imageIndexPagesByCollection = [];

collections.forEach(collection => {
  const galleryData = loadGalleryData(collection);
  const imageIndexPages = writeImageIndexes(collection, galleryData);

  imageIndexPages.forEach(page => {
    imageIndexPagesByCollection.push({
      collectionId: collection.id,
      ...page
    });
  });

  console.log(`Generated ${imageIndexPages.length} image index page(s) for ${collection.title} with ${galleryData.length} image(s).`);
});

writeRobots();
writeSitemap(imageIndexPagesByCollection);

console.log('SEO files generated: sitemap.xml, robots.txt, and image index pages.');

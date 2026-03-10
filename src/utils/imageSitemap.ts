interface ImageMetadata {
  loc: string;
  caption?: string;
  title?: string;
  geoLocation?: string;
  license?: string;
}

interface PageImage {
  pageUrl: string;
  images: ImageMetadata[];
}

export const generateImageSitemap = (pageImages: PageImage[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';
  const urlsetClose = '</urlset>';

  const urls = pageImages.map(page => {
    const imageEntries = page.images.map(image => {
      const titleTag = image.title ? `\n      <image:title>${escapeXml(image.title)}</image:title>` : '';
      const captionTag = image.caption ? `\n      <image:caption>${escapeXml(image.caption)}</image:caption>` : '';
      const geoTag = image.geoLocation ? `\n      <image:geo_location>${escapeXml(image.geoLocation)}</image:geo_location>` : '';
      const licenseTag = image.license ? `\n      <image:license>${escapeXml(image.license)}</image:license>` : '';

      return `    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>${titleTag}${captionTag}${geoTag}${licenseTag}
    </image:image>`;
    }).join('\n');

    return `  <url>
    <loc>${escapeXml(page.pageUrl)}</loc>
${imageEntries}
  </url>`;
  }).join('\n');

  return `${xmlHeader}\n${urlsetOpen}\n${urls}\n${urlsetClose}`;
};

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const extractImagesFromPage = (baseUrl: string, pagePath: string): PageImage => {
  const images = document.querySelectorAll('img');
  const imageMetadata: ImageMetadata[] = [];

  images.forEach(img => {
    if (!img.src || img.src.startsWith('data:')) return;

    const url = new URL(img.src, baseUrl);

    imageMetadata.push({
      loc: url.href,
      title: img.alt || img.title || undefined,
      caption: img.getAttribute('data-caption') || undefined,
    });
  });

  return {
    pageUrl: new URL(pagePath, baseUrl).href,
    images: imageMetadata,
  };
};

export const sampleImageSitemap: PageImage[] = [
  {
    pageUrl: 'https://sportstock.example.com/',
    images: [
      {
        loc: 'https://sportstock.example.com/images/hero-sports.jpg',
        title: 'Professional athlete in action under bright stadium lights',
        caption: 'Hero image showcasing sports trading platform',
      },
    ],
  },
  {
    pageUrl: 'https://sportstock.example.com/trade',
    images: [
      {
        loc: 'https://sportstock.example.com/images/players/lebron-james.png',
        title: 'LeBron James professional headshot',
        caption: 'LeBron James Lakers player trading card',
      },
      {
        loc: 'https://sportstock.example.com/images/players/patrick-mahomes.png',
        title: 'Patrick Mahomes professional headshot',
        caption: 'Patrick Mahomes Chiefs quarterback trading card',
      },
    ],
  },
];

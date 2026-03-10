export const SEO_IMAGE_GUIDELINES = {
  fileNaming: {
    goodExamples: [
      'lebron-james-lakers-player.jpg',
      'basketball-action-shot-stadium.jpg',
      'patrick-mahomes-chiefs-quarterback.jpg',
    ],
    badExamples: [
      'IMG_1234.jpg',
      'untitled.png',
      'photo-final-v2-copy.jpg',
    ],
    rules: [
      'Use descriptive, lowercase names',
      'Separate words with hyphens',
      'Include relevant keywords',
      'Avoid special characters and spaces',
      'Be specific and descriptive',
    ],
  },
  compression: {
    recommendations: {
      jpg: {
        quality: '80-85%',
        useCase: 'Photos, complex images with gradients',
        tools: ['imageOptim', 'TinyJPG', 'Squoosh'],
      },
      png: {
        quality: '80-90%',
        useCase: 'Graphics, logos, images needing transparency',
        tools: ['OptiPNG', 'TinyPNG', 'ImageOptim'],
      },
      webp: {
        quality: '75-85%',
        useCase: 'Modern browsers, best compression ratio',
        tools: ['Squoosh', 'cwebp', 'ImageMagick'],
      },
      avif: {
        quality: '70-80%',
        useCase: 'Newest format, excellent compression',
        tools: ['Squoosh', 'avifenc', 'ImageMagick'],
      },
    },
    maxFileSizes: {
      hero: '150KB',
      thumbnail: '50KB',
      icon: '20KB',
      background: '100KB',
    },
  },
  dimensions: {
    common: {
      openGraph: { width: 1200, height: 630 },
      twitter: { width: 1200, height: 675 },
      thumbnail: { width: 300, height: 200 },
      hero: { width: 1920, height: 1080 },
      portrait: { width: 400, height: 600 },
    },
  },
  altText: {
    goodExamples: [
      'LeBron James shooting a basketball during Lakers game at Crypto.com Arena',
      'Patrick Mahomes throwing touchdown pass in Chiefs red uniform',
      'Sports trading platform dashboard showing athlete stock prices',
    ],
    badExamples: [
      'Image',
      'Photo',
      'Player',
      '',
    ],
    rules: [
      'Describe the image content accurately',
      'Include relevant context',
      'Keep it concise (125 characters or less)',
      'Avoid "image of" or "picture of"',
      'Include keywords naturally',
      'Consider the page context',
    ],
  },
};

export const generateOptimizedFileName = (description: string, format?: string): string => {
  const cleaned = description
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const extension = format || 'jpg';
  return `${cleaned}.${extension}`;
};

export const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  if (!maxHeight) {
    return {
      width: maxWidth,
      height: Math.round(maxWidth / aspectRatio),
    };
  }

  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
};

export const generateSrcSet = (
  basePath: string,
  widths: number[],
  format?: string
): string => {
  const ext = format || basePath.split('.').pop() || 'jpg';
  const pathWithoutExt = basePath.substring(0, basePath.lastIndexOf('.'));

  return widths
    .map(width => `${pathWithoutExt}-${width}w.${ext} ${width}w`)
    .join(', ');
};

export const generateSizesAttribute = (
  breakpoints: { maxWidth: string; size: string }[]
): string => {
  const sizes = breakpoints.map(bp => `(max-width: ${bp.maxWidth}) ${bp.size}`);
  sizes.push('100vw');
  return sizes.join(', ');
};

export const imageFormats = {
  modernStack: ['avif', 'webp', 'jpg'],
  fallbackStack: ['webp', 'jpg'],
  transparencyStack: ['avif', 'webp', 'png'],
};

export const getImageDimensionsFromFile = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const preloadCriticalImages = (imageUrls: string[]): void => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

export const lazyLoadImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
};

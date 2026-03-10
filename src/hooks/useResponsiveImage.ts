import { useMemo } from 'react';

interface ResponsiveImageConfig {
  src: string;
  widths?: number[];
  format?: 'webp' | 'jpg' | 'png';
  quality?: number;
}

interface ResponsiveImageResult {
  src: string;
  srcSet: string;
  sizes: string;
}

export const useResponsiveImage = ({
  src,
  widths = [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  format,
  quality = 85,
}: ResponsiveImageConfig): ResponsiveImageResult => {
  const result = useMemo(() => {
    const extension = src.split('.').pop()?.toLowerCase() || 'jpg';
    const basePath = src.substring(0, src.lastIndexOf('.'));
    const targetFormat = format || extension;

    const srcSet = widths
      .map((width) => {
        return `${basePath}-${width}w.${targetFormat} ${width}w`;
      })
      .join(', ');

    const sizes = [
      '(max-width: 640px) 640px',
      '(max-width: 750px) 750px',
      '(max-width: 828px) 828px',
      '(max-width: 1080px) 1080px',
      '(max-width: 1200px) 1200px',
      '(max-width: 1920px) 1920px',
      '100vw',
    ].join(', ');

    return {
      src: `${basePath}.${targetFormat}`,
      srcSet,
      sizes,
    };
  }, [src, widths, format, quality]);

  return result;
};

export const generateImageSrcSet = (
  baseSrc: string,
  widths: number[],
  format?: string
): string => {
  const extension = baseSrc.split('.').pop()?.toLowerCase() || 'jpg';
  const basePath = baseSrc.substring(0, baseSrc.lastIndexOf('.'));
  const targetFormat = format || extension;

  return widths
    .map((width) => `${basePath}-${width}w.${targetFormat} ${width}w`)
    .join(', ');
};

export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImage = (src: string, srcSet?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    if (srcSet) {
      img.srcset = srcSet;
    }
    img.src = src;
  });
};

export const optimizeImageFileName = (originalName: string): string => {
  return originalName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_.]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

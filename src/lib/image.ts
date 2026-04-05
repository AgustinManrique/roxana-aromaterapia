/**
 * Image optimization via wsrv.nl - a free public image CDN/proxy.
 * Converts any public image URL into a resized, recompressed version.
 * Docs: https://wsrv.nl/docs/
 *
 * Why this instead of Supabase transformations?
 * Supabase image transformations only work on Pro+ plans. wsrv.nl is free,
 * unlimited, backed by Cloudflare and works with any public URL.
 */

const FALLBACK = 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400';

export const getOptimizedImageUrl = (
  url: string | null | undefined,
  options: { width?: number; height?: number; quality?: number; blur?: number } = {}
): string => {
  if (!url) return FALLBACK;

  // If it's already an optimized/external image we don't want to re-proxy, just return it.
  if (url.includes('wsrv.nl')) return url;

  const { width = 400, quality = 75, height, blur } = options;
  const params = new URLSearchParams();
  params.set('url', url);
  params.set('w', String(width));
  if (height) params.set('h', String(height));
  params.set('q', String(quality));
  params.set('output', 'webp');
  params.set('we', ''); // keep aspect ratio
  if (blur) params.set('blur', String(blur));

  return `https://wsrv.nl/?${params.toString()}`;
};

export const getImageFallback = () => FALLBACK;

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { getOptimizedImageUrl, getImageFallback } from '../lib/image';
import ProductQuickView from './ProductQuickView';

const FeaturedCarousel: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [quickView, setQuickView] = useState<Product | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`*, category:categories(*)`)
          .gt('stock', 0)
          .order('created_at', { ascending: false })
          .limit(12);
        if (error) throw error;
        setProducts(data || []);
      } catch (e) {
        console.error('Error fetching featured:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [products.length]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    // Find the width of a single card (first child)
    const firstCard = el.querySelector('article');
    const cardWidth = firstCard ? (firstCard as HTMLElement).offsetWidth + 20 : 260;
    const visibleCards = Math.max(1, Math.floor(el.clientWidth / cardWidth));
    const amount = cardWidth * visibleCards * (dir === 'left' ? -1 : 1);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-14 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-64 h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <>
      <section className="py-14 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider">Destacados</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mt-1">
                Lo más nuevo
              </h2>
            </div>
            <div className="hidden sm:flex space-x-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canLeft}
                aria-label="Anterior"
                className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-brand-50 hover:border-brand-300 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-soft active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canRight}
                aria-label="Siguiente"
                className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-brand-50 hover:border-brand-300 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-soft active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 sm:-mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollPadding: '0 1rem' }}
          >
            {products.map((product) => (
              <article
                key={product.id}
                onClick={() => setQuickView(product)}
                className="group flex-shrink-0 w-56 sm:w-64 snap-start bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-cream-200 dark:bg-gray-700">
                  <img
                    src={getOptimizedImageUrl(product.image_url, { width: 500, quality: 78 })}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => { (e.target as HTMLImageElement).src = getImageFallback(); }}
                  />
                  {product.category && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 backdrop-blur-sm text-gray-800 dark:bg-gray-900/80 dark:text-gray-100">
                      {product.category.name}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900 dark:text-white shadow-soft">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver detalles</span>
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                  <div className="mt-2 text-lg font-semibold text-brand-600 dark:text-brand-400">
                    ${product.price.toLocaleString()}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
};

export default FeaturedCarousel;

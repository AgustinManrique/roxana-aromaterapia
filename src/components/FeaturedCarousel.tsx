import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400';

const FeaturedCarousel: React.FC = () => {
  const { addItem } = useCart();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

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
    const amount = el.clientWidth * 0.85 * (dir === 'left' ? -1 : 1);
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
              className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-brand-50 hover:border-brand-300 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-soft"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canRight}
              aria-label="Siguiente"
              className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-brand-50 hover:border-brand-300 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-soft"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 sm:-mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <article
              key={product.id}
              className="group flex-shrink-0 w-56 sm:w-64 snap-start bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className="relative aspect-square overflow-hidden bg-cream-200 dark:bg-gray-700">
                <img
                  src={product.image_url || FALLBACK_IMAGE}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                {product.category && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 backdrop-blur-sm text-gray-800 dark:bg-gray-900/80 dark:text-gray-100">
                    {product.category.name}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-semibold text-brand-600 dark:text-brand-400">
                    ${product.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image_url || FALLBACK_IMAGE
                    })}
                    aria-label="Agregar al carrito"
                    className="p-2 bg-gray-900 dark:bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, ShoppingCart, PackageSearch, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase, Product } from '../lib/supabase';
import { getOptimizedImageUrl, getImageFallback } from '../lib/image';
import ProductQuickView from './ProductQuickView';

interface ProductGridProps {
  searchTerm?: string;
  categoryId?: string;
}

const PAGE_SIZE = 24;

const ProductGrid: React.FC<ProductGridProps> = ({ searchTerm = '', categoryId = 'all' }) => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [quickView, setQuickView] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts(searchTerm, categoryId);
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, categoryId]);

  const fetchProducts = async (search: string = '', category: string = 'all') => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('products').select(`*, category:categories(*)`);

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (category !== 'all') {
        query = query.eq('category_id', category);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const visibleProducts = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);
  const hasMore = visibleCount < products.length;

  if (loading) {
    return (
      <section className="py-16 bg-cream-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-soft">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-cream-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchProducts(searchTerm, categoryId)}
            className="mt-4 px-5 py-2.5 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="productos" className="py-16 bg-cream-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">
              {searchTerm ? 'Resultados' : 'Nuestro catálogo'}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {products.length} producto{products.length !== 1 ? 's' : ''}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700 hidden sm:block sm:mx-6" />
        </div>

        {/* Empty state */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <PackageSearch className="mx-auto h-14 w-14 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 font-display text-xl text-gray-900 dark:text-white">
              No encontramos productos
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Probá con otra búsqueda o categoría.' : 'Pronto vamos a tener novedades.'}
            </p>
          </div>
        ) : (
          <>
            {/* Products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {visibleProducts.map((product, idx) => (
                <article
                  key={product.id}
                  onClick={() => setQuickView(product)}
                  className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden animate-fade-in-up cursor-pointer hover:-translate-y-1"
                  style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-cream-200 dark:bg-gray-700">
                    <img
                      src={getOptimizedImageUrl(
                        (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image_url),
                        { width: 500, quality: 78 }
                      )}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => { (e.target as HTMLImageElement).src = getImageFallback(); }}
                    />
                    <button
                      aria-label="Guardar"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm dark:bg-gray-900/80 rounded-full shadow-soft opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:bg-white"
                    >
                      <Heart className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                    </button>

                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                      {product.category && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/90 backdrop-blur-sm text-gray-800 dark:bg-gray-900/80 dark:text-gray-100">
                          {product.category.name}
                        </span>
                      )}
                      {Array.isArray(product.images) && product.images.length > 1 && (
                        <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-blue-500/90 backdrop-blur-sm text-white">
                          +{product.images.length - 1} fotos
                        </span>
                      )}
                      {Array.isArray(product.variants) && product.variants.length > 0 && (
                        <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-purple-500/90 backdrop-blur-sm text-white">
                          {product.variants.length} variantes
                        </span>
                      )}
                    </div>

                    {/* Hover overlay hint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 pointer-events-none">
                      <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900 dark:text-white shadow-soft">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver detalles</span>
                      </span>
                    </div>

                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center">
                        <span className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">Sin stock</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 p-4 sm:p-5">
                    <h3 className="font-display text-base sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg sm:text-xl font-semibold text-brand-600 dark:text-brand-400">
                        ${product.price.toLocaleString()}
                      </span>
                      <button
                        disabled={product.stock === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image_url || getImageFallback()
                          });
                        }}
                        className="flex items-center space-x-1.5 bg-gray-900 dark:bg-brand-500 text-white px-3 py-2 rounded-full hover:bg-brand-600 dark:hover:bg-brand-600 transition-colors text-xs sm:text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Agregar</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-medium hover:bg-brand-50 hover:border-brand-300 dark:hover:bg-gray-700 transition-colors shadow-soft"
                >
                  Ver más productos ({products.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </section>
  );
};

export default ProductGrid;

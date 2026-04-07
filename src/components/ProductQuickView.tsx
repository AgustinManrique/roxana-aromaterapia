import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, Minus, Plus, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { getOptimizedImageUrl, getImageFallback } from '../lib/image';

interface Props {
  product: Product | null;
  onClose: () => void;
}

const ProductQuickView: React.FC<Props> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setZoomed(false);
      setSelectedImageIndex(0);
      // Auto-select first variant if exists
      const vars = Array.isArray(product.variants) ? product.variants : [];
      setSelectedVariant(vars.length > 0 ? vars[0] : undefined);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [product, onClose]);

  if (!product) return null;

  // Build images array
  const images: string[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image_url ? [product.image_url] : [];
  const variants = Array.isArray(product.variants) ? product.variants : [];

  const currentImage = images[selectedImageIndex] || product.image_url || '';

  const handleAdd = () => {
    const displayName = selectedVariant ? `${product.name} - ${selectedVariant}` : product.name;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: displayName,
        price: product.price,
        image: images[0] || product.image_url || getImageFallback(),
        variant: selectedVariant,
      });
    }
    onClose();
  };

  const prevImage = () => setSelectedImageIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const nextImage = () => setSelectedImageIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  const largeUrl = getOptimizedImageUrl(currentImage, { width: 1200, quality: 85 });
  const mediumUrl = getOptimizedImageUrl(currentImage, { width: 800, quality: 80 });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-soft-xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col md:flex-row animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white hover:scale-110 transition-all"
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>

        {/* Image side */}
        <div className="relative w-full md:w-3/5 bg-cream-100 dark:bg-gray-800 overflow-hidden">
          <div className="aspect-square relative">
            <img
              src={zoomed ? largeUrl : mediumUrl}
              alt={product.name}
              className={`w-full h-full transition-transform duration-500 ease-out cursor-zoom-in ${
                zoomed ? 'scale-150 cursor-zoom-out object-cover' : 'object-cover hover:scale-105'
              }`}
              onClick={() => setZoomed(!zoomed)}
              onError={(e) => { (e.target as HTMLImageElement).src = getImageFallback(); }}
            />

            {/* Image navigation arrows */}
            {images.length > 1 && !zoomed && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white transition-all"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white transition-all"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(i); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === selectedImageIndex
                          ? 'bg-white w-4'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {!zoomed && (
              <button
                onClick={() => setZoomed(true)}
                className="absolute bottom-4 right-4 p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white transition-all"
                aria-label="Ampliar"
              >
                <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              </button>
            )}
          </div>

          {/* Thumbnails strip */}
          {images.length > 1 && (
            <div className="flex gap-1.5 p-2 overflow-x-auto bg-white/50 dark:bg-gray-800/50 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedImageIndex(i); setZoomed(false); }}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === selectedImageIndex
                      ? 'border-brand-500 ring-1 ring-brand-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(url, { width: 100, quality: 60 })}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = getImageFallback(); }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info side */}
        <div className="flex flex-col w-full md:w-2/5 p-6 sm:p-8 overflow-y-auto">
          {product.category && (
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
              {product.category.name}
            </span>
          )}
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white leading-tight">
            {product.name}
          </h2>
          <div className="mt-4 text-3xl font-semibold text-brand-600 dark:text-brand-400">
            ${product.price.toLocaleString()}
          </div>

          {product.description && (
            <p className="mt-5 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variant selector */}
          {variants.length > 0 && (
            <div className="mt-5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Variante</span>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedVariant === v
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-brand-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            {product.stock === 0 ? (
              <span className="inline-block px-3 py-1 text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                Sin stock
              </span>
            ) : product.stock < 5 ? (
              <span className="inline-block px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                ¡Últimas {product.stock} unidades!
              </span>
            ) : (
              <span className="text-sm text-sage-600 dark:text-sage-400">✓ En stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="mt-auto pt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cantidad</span>
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-full">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-full transition-colors"
                    aria-label="Menos"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-medium w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-full transition-colors"
                    aria-label="Más"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleAdd}
                disabled={variants.length > 0 && !selectedVariant}
                className="w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-brand-500 text-white py-3.5 rounded-full font-medium hover:bg-brand-600 dark:hover:bg-brand-600 transition-all shadow-soft hover:shadow-soft-lg disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Agregar al carrito · ${(product.price * quantity).toLocaleString()}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;

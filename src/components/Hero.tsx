import React, { useEffect, useState } from 'react';
import { Instagram, Facebook, ArrowRight } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { getOptimizedImageUrl } from '../lib/image';

const ROTATE_INTERVAL = 5000;

const Hero = () => {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchBgProducts = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('image_url')
          .not('image_url', 'is', null)
          .gt('stock', 0)
          .order('created_at', { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          // Shuffle and pick a few
          const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 6);
          const urls = shuffled
            .map((p) => p.image_url as string)
            .filter(Boolean)
            .map((u) => getOptimizedImageUrl(u, { width: 1600, quality: 70, blur: 2 }));
          setBackgrounds(urls);
        }
      } catch (e) {
        console.error('Error fetching hero backgrounds:', e);
      }
    };
    fetchBgProducts();
  }, []);

  useEffect(() => {
    if (backgrounds.length < 2) return;
    const interval = setInterval(() => {
      setActiveIdx((i) => (i + 1) % backgrounds.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const scrollToProducts = () => {
    const el = document.getElementById('productos');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-brand-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Rotating background images */}
      {backgrounds.map((url, i) => (
        <div
          key={url + i}
          aria-hidden
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
          style={{
            backgroundImage: `url(${url})`,
            opacity: i === activeIdx ? 0.22 : 0,
          }}
        />
      ))}

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream-100/70 via-cream-50/50 to-brand-50/60 dark:from-gray-900/80 dark:via-gray-900/70 dark:to-gray-800/80" />

      {/* decorative blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-200/40 dark:bg-brand-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-sage-200/40 dark:bg-sage-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <span className="inline-block px-3 py-1 text-xs font-medium tracking-wider uppercase text-brand-700 dark:text-brand-300 bg-brand-100/80 dark:bg-brand-900/30 rounded-full mb-6 backdrop-blur-sm">
            Aromaterapia · Hecho a mano
          </span>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            Momentos que{' '}
            <span className="italic text-brand-600 dark:text-brand-400">respiran</span>,<br className="hidden sm:block" />
            regalos que acompañan
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Aceites esenciales, velas y productos artesanales seleccionados con cariño.
            Pensados para cuidarte a vos y a quienes querés.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={scrollToProducts}
              className="group inline-flex items-center justify-center space-x-2 px-7 py-3.5 bg-gray-900 dark:bg-brand-500 text-white rounded-full font-medium hover:bg-brand-600 dark:hover:bg-brand-600 transition-all shadow-soft-lg hover:shadow-soft-xl"
            >
              <span>Ver catálogo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center space-x-4 sm:ml-4">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Seguinos</span>
              <div className="flex space-x-2">
                <a
                  href="https://www.instagram.com/roxana_aromaterapia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all"
                >
                  <Instagram className="w-4 h-4 text-brand-600" />
                </a>
                <a
                  href="https://www.facebook.com/roxana.aromaterapia"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all"
                >
                  <Facebook className="w-4 h-4 text-brand-600" />
                </a>
                <a
                  href="https://www.tiktok.com/@roxanaaromaterapi"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all"
                >
                  <svg className="w-4 h-4 fill-brand-600" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import React from 'react';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Tu regalería de confianza,{' '}
            <span className="text-orange-500">a la vuelta de casa</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Ideas originales, productos artesanales y regalos para todos los gustos. 
            Pasá, elegí y sorprendete.
          </p>

          {/* Social media */}
          <div className="flex items-center justify-center space-x-6">
            <span className="text-gray-600 dark:text-gray-300">Seguinos en:</span>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/roxana_aromaterapia/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Instagram className="w-5 h-5 text-pink-500" />
              </a>
              <a 
                href="https://www.facebook.com/roxana.aromaterapia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
              </a>
              <a 
                href="https://www.tiktok.com/@roxanaaromaterapi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-5 h-5 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.png" 
                alt="Roxana Aromaterapia Logo" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">Roxana</span>
                <span className="text-xl font-light text-orange-500 ml-1">Aromaterapia</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Descubre nuestra hermosa tienda, estamos orgullosos de decir 
              que somos la regalería de confianza del barrio San Carlos, los 
              invitamos a que pasen a conocernos.
            </p>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-300">+54 9 221 436 3284</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-300">info@roxanaaromaterapia.com (pedir real)</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="text-gray-600 dark:text-gray-300">
                  <p>Calle 136, entre 530 y 531. Número 124</p>
                  <p>📍 La Plata, San Carlos</p>
                  <p>Argentina</p>
                </div>
              </div>
            </div>
          </div>

          {/* Information links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Sobre Nosotros
              </a>
              <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Envíos y Devoluciones
              </a>
              <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Preguntas Frecuentes
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-orange-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            © 2025 Roxana Aromaterapia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
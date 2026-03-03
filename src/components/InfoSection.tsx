import React from 'react';
import { Heart, Truck, RotateCcw, CreditCard, HelpCircle } from 'lucide-react';

const InfoSection = () => {
  return (
    <section className="bg-white dark:bg-gray-950 border-t border-orange-100/60 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Información para tu compra
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Queremos que tu experiencia sea simple, clara y cercana. Acá vas a encontrar
            los puntos más importantes sobre quiénes somos, cómo trabajamos los envíos
            y cuáles son nuestras políticas.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sobre nosotros */}
          <article
            id="sobre-nosotros"
            className="rounded-xl bg-orange-50/70 dark:bg-gray-900 border border-orange-100 dark:border-gray-800 p-5 flex flex-col h-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Heart className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Sobre Roxana Aromaterapia
              </h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Somos una regalería de barrio ubicada en San Carlos, La Plata. Combinamos
              productos de aromaterapia, decoración y detalles pensados para regalar
              y regalarte.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Cada producto que ves en la tienda fue seleccionado uno por uno,
              priorizando calidad, aromas agradables y una presentación prolija,
              ideal para obsequios.
            </p>
          </article>

          {/* Envíos y devoluciones */}
          <article
            id="envios-devoluciones"
            className="rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-gray-800 p-5 flex flex-col h-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Truck className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Envíos y retiros
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <span className="font-medium">Retiros en tienda:</span> sin costo,
                en Calle 136 entre 530 y 531 (San Carlos, La Plata), coordinando día y horario.
              </li>
              <li>
                <span className="font-medium">Envíos a domicilio:</span> dentro de La Plata
                y alrededores con envío privado. El costo y la zona se confirman por WhatsApp
                al finalizar el pedido.
              </li>
              <li className="flex items-start space-x-2 mt-2">
                <RotateCcw className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <span>
                  <span className="font-medium">Cambios y devoluciones:</span> si tu producto
                  llegó dañado o con algún problema, escribinos por WhatsApp dentro de los
                  primeros 3 días hábiles y buscamos la mejor solución posible.
                </span>
              </li>
            </ul>
          </article>

          {/* Medios de pago */}
          <article
            id="metodos-pago"
            className="rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-gray-800 p-5 flex flex-col h-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Medios de pago
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <span className="font-medium">MercadoPago:</span> tarjetas de crédito y débito,
                dinero en cuenta y otros medios habilitados por la plataforma.
              </li>
              <li>
                <span className="font-medium">Efectivo:</span> disponible para retiros en el
                local. Coordinamos el horario por WhatsApp cuando confirmamos el pedido.
              </li>
              <li>
                Una vez acreditado el pago, te confirmamos por WhatsApp y avanzamos con la
                preparación y entrega de tu pedido.
              </li>
            </ul>
          </article>

          {/* Preguntas frecuentes */}
          <article
            id="preguntas-frecuentes"
            className="rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-gray-800 p-5 flex flex-col h-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Preguntas frecuentes
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <span className="font-medium">¿Cómo hago un pedido?</span> Agregá los productos
                al carrito, completá tus datos y seguí las instrucciones para enviar el pedido
                por WhatsApp o pagar online.
              </li>
              <li>
                <span className="font-medium">¿Los precios son finales?</span> Sí, todos los
                precios publicados incluyen impuestos. Solo se suma el costo de envío si
                corresponde.
              </li>
              <li>
                <span className="font-medium">¿Puedo hacer un pedido personalizado?</span>{' '}
                Sí, escribinos por WhatsApp y te ayudamos a armar el regalo ideal según tu
                presupuesto y ocasión.
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;


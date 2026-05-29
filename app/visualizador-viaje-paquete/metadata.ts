import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Viaje de un Paquete - Logística del E-commerce | meskeIA',
  description: 'Descubre qué ocurre desde que pulsas Comprar hasta que llega tu paquete: almacén, transporte, última milla y datos de España. Explicador visual interactivo.',
  keywords: 'logística paquete, e-commerce, última milla, almacén, transporte, envío, Black Friday, paquetería España, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Viaje de un Paquete - Logística del E-commerce',
    description: 'Del click al timbre: todo lo que pasa entre que compras online y recibes tu paquete, explicado visualmente.',
    url: 'https://meskeia.com/visualizador-viaje-paquete/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Viaje de un Paquete - Logística del E-commerce',
    description: 'Almacén, transporte, última milla: el viaje invisible de cada paquete que compras online.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Viaje Paquete meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Viaje de un Paquete',
  description: 'Explicador visual interactivo sobre la logística del e-commerce: qué ocurre al pulsar Comprar, cómo funciona un almacén moderno, transporte hub-a-hub, última milla, y datos de paquetería en España.',
  url: 'https://meskeia.com/visualizador-viaje-paquete/',
  category: 'EducationalApplication',
  features: [
    'Flujo completo del click a la entrega con tiempos reales',
    'Funcionamiento de un almacén: robots, picking, packing',
    'Transporte: camión, avión, tren y costes CO₂',
    'Última milla: la parte más cara de la logística',
    'España en números: 700M+ paquetes/año, Black Friday, devoluciones',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué ocurre desde que compras algo online hasta que llega a tu casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando pulsas "Comprar", el sistema verifica el stock en tiempo real y genera una orden de picking en el almacén. Un operario (o robot) localiza y recoge el producto, pasa por el control de calidad, se empaqueta y etiqueta, y se incorpora a una ruta de transporte. El paquete viaja de almacén a hub regional, después a hub local y finalmente un repartidor de última milla lo entrega en tu dirección. El proceso completo tarda entre 24 horas y varios días según la distancia y el método de envío.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la última milla es la parte más cara de la logística?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La última milla —el tramo final del repartidor a la puerta del cliente— representa entre el 40 % y el 55 % del coste total de envío. Esto se debe a que cada entrega es un destino único, con paradas frecuentes, tráfico urbano y tiempos de espera variables. Las ausencias del destinatario generan segundos intentos (5-15 % de los envíos en España) que multiplican el coste. Es el motivo por el que las empresas invierten en taquillas, puntos de conveniencia y reparto con drones o robots.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos paquetes se envían en España al año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'España supera los 700 millones de envíos de paquetería al año, con un crecimiento anual del 10-15 % impulsado por el comercio electrónico. Durante el Black Friday y la campaña navideña el volumen puede triplicarse en una semana. El sector emplea directa o indirectamente a más de 200.000 personas y genera una huella de CO₂ significativa, razón por la que crece la demanda de vehículos eléctricos y rutas de reparto optimizadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un almacén logístico moderno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los grandes centros de distribución modernos combinan trabajadores y automatización: robots móviles (como los de Amazon Robotics) transportan estanterías completas hasta el puesto del operario, eliminando los desplazamientos. El sistema de gestión del almacén (WMS) dirige en tiempo real las tareas de recepción, ubicación, picking y expedición. Los paquetes avanzan por cintas transportadoras, escáneres de código de barras y clasificadores automáticos que los asignan a la ruta correcta en segundos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué impacto ambiental tiene el envío de paquetes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un paquete que recorre 1.000 km en camión emite aproximadamente 50-100 g de CO₂ por kilómetro de ruta (según la carga). El transporte aéreo es hasta 50 veces más contaminante por tonelada-kilómetro. Las devoluciones duplican la huella de carbono de un envío y, según estudios europeos, entre el 5 % y el 10 % de los artículos devueltos acaban destruidos en lugar de revendidos. El embalaje representa entre el 2 % y el 5 % del peso del paquete y es la fracción más visible del impacto residual.',
      },
    },
  ],
};

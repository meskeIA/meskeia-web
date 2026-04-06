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
    url: 'https://meskeia.com/visualizador-viaje-paquete',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Viaje de un Paquete - Logística del E-commerce',
    description: 'Almacén, transporte, última milla: el viaje invisible de cada paquete que compras online.',
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

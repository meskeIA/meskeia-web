import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Quesos - Variedades del mundo, maridaje y D.O. | meskeIA',
  description: '55 quesos del mundo: tipo de leche, maduración, notas de sabor, maridaje y denominación de origen. España, Francia, Italia, Reino Unido y más. Filtros por país, leche y tipo.',
  keywords: 'guia quesos mundo, manchego, camembert, parmigiano, cheddar, quesos espana, denominacion origen queso, maridaje queso vino, tipos queso, quesos azules, quesos curados',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Quesos | meskeIA',
    description: '55 quesos del mundo: tipo de leche, maduración, notas de sabor, maridaje y denominación de origen.',
    url: 'https://meskeia.com/guia-quesos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Quesos | meskeIA',
    description: '55 quesos del mundo: tipo de leche, maduración, notas de sabor y maridaje.',
  },
  other: {
    'application-name': 'Guía de Quesos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Quesos',
  description: 'Directorio de 55 quesos del mundo con tipo de leche, maduración, textura, corteza, notas de sabor, maridaje y denominación de origen. Incluye quesos de España, Francia, Italia, Reino Unido, Resto de Europa y América. Filtros por continente/país, tipo de leche y tipo de queso.',
  url: 'https://meskeia.com/guia-quesos/',
  features: [
    '55 quesos con perfil completo',
    'Filtros por país/región, tipo de leche y tipo de queso',
    'Búsqueda por nombre, país, región, notas o descripción',
    'Maridaje con vinos y acompañamientos específicos',
    'Denominaciones de origen (D.O./IGP)',
    'Curiosidades históricas y culturales',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
});

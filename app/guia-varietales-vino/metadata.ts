import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Varietales de Vino - Uvas, sabores y maridaje | meskeIA',
  description: '40 varietales de vino: tipo de uva, origen, notas de sabor, cuerpo, taninos, acidez, temperatura de servicio y maridaje. Tintos, blancos y espumosos del mundo.',
  keywords: 'varietales vino, uvas vino, tempranillo, cabernet sauvignon, pinot noir, chardonnay, rioja, borgoña, maridaje vino, cata vino, notas sabor vino, vino tinto blanco espumoso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Varietales de Vino | meskeIA',
    description: '40 varietales de vino: tipo de uva, origen, notas de sabor, cuerpo, taninos, acidez y maridaje. Tintos, blancos y espumosos del mundo.',
    url: 'https://meskeia.com/guia-varietales-vino',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Varietales de Vino | meskeIA',
    description: '40 varietales de vino del mundo: notas de sabor, cuerpo, taninos y maridaje perfecto.',
  },
  other: {
    'application-name': 'Guía de Varietales de Vino meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Varietales de Vino',
  description: 'Directorio de 40 varietales de vino del mundo con tipo de uva, origen, zonas principales, notas de sabor, cuerpo, taninos, acidez, temperatura de servicio, maridaje y curiosidades enológicas. Filtros por tipo (Tinto, Blanco, Espumoso) y buscador. Indicadores visuales de cuerpo, taninos y acidez.',
  url: 'https://meskeia.com/guia-varietales-vino/',
  features: [
    '40 varietales de vino con perfil enológico completo',
    'Filtro por tipo: Tinto, Blanco, Espumoso',
    'Buscador por nombre, origen o nota de sabor',
    'Indicadores visuales de cuerpo, taninos y acidez',
    'Temperatura de servicio y maridaje para cada varietal',
    'Curiosidades históricas y enológicas de cada uva',
    'Denominaciones de Origen destacadas por varietal',
    'Funciona 100% en el navegador, sin registro',
  ],
});

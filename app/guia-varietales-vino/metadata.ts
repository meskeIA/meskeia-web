import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Varietales de Vino - Uvas, sabores y maridaje | meskeIA',
  description: '45 varietales de vino del mundo: tintos, blancos, espumosos y generosos. Origen, notas de sabor, cuerpo, taninos, acidez, temperatura de servicio y maridaje. Incluye uvas LATAM (Malbec, Torrontés, Carménère, País).',
  keywords: 'varietales vino, uvas vino, tempranillo, cabernet sauvignon, pinot noir, chardonnay, malbec, torrontes, carmenere, rioja, borgoña, maridaje vino, cata vino, vino tinto blanco espumoso, vino generoso, jerez',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Varietales de Vino | meskeIA',
    description: '45 varietales del mundo: tintos, blancos, espumosos y generosos. Notas de sabor, taninos, acidez y maridaje. Incluye uvas LATAM.',
    url: 'https://meskeia.com/guia-varietales-vino/',
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
    title: 'Guía de Varietales de Vino | meskeIA',
    description: '45 varietales del mundo: notas de sabor, cuerpo, taninos y maridaje perfecto. Incluye uvas LATAM.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Varietales de Vino meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Varietales de Vino',
  description: 'Directorio de 45 varietales de vino del mundo con tipo de uva, origen, zonas principales, notas de sabor, cuerpo, taninos, acidez, temperatura de servicio, maridaje y curiosidades enológicas. Filtros por tipo (Tinto, Blanco, Espumoso, Generoso) y buscador. Incluye uvas latinoamericanas (Malbec, Torrontés, Carménère, Tannat, País, Bonarda) y varietales mediterráneos.',
  url: 'https://meskeia.com/guia-varietales-vino/',
  features: [
    '45 varietales de vino con perfil enológico completo',
    'Filtros por tipo: Tinto, Blanco, Espumoso, Generoso',
    'Cobertura LATAM: Malbec, Torrontés, Carménère, Tannat, País, Bonarda',
    'Buscador por nombre, origen o nota de sabor',
    'Indicadores visuales de cuerpo, taninos y acidez',
    'Temperatura de servicio y maridaje para cada varietal',
    'Curiosidades históricas y enológicas de cada uva',
    'Denominaciones de Origen destacadas por varietal',
    'Funciona 100% en el navegador, sin registro',
  ],
});

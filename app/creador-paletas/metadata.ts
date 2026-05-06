import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Creador de Paletas de Colores - Armonías y Esquemas | meskeIA',
  description: 'Genera paletas de colores armónicas: complementarios, análogos, triádicos, monocromáticos. Explora esquemas de color y exporta CSS/SCSS variables.',
  keywords: 'creador paletas, paleta colores, color scheme, complementary, analogous, triadic, color harmony',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/creador-paletas/',
  },
  openGraph: {
    type: 'website',
    title: 'Creador de Paletas de Colores - meskeIA',
    description: 'Genera paletas de colores armónicas automáticamente',
    url: 'https://meskeia.com/creador-paletas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Creador de Paletas de Colores',
  description: 'Generador de paletas de colores armónicas: complementarios, análogos, triádicos, tetrádicos y monocromáticos. Exporta los colores como variables CSS, SCSS o JSON.',
  url: 'https://meskeia.com/creador-paletas/',
  category: 'UtilityApplication',
  features: [
    'Generación automática de paletas armónicas',
    '5 esquemas: complementario, análogo, triádico, tetrádico, monocromático',
    'Selector de color base (HEX, RGB, HSL)',
    'Exportar como CSS, SCSS o JSON',
    'Visualización de cada color con código hex',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['paleta colores', 'color harmony', 'diseño', 'CSS', 'esquema cromático'],
});

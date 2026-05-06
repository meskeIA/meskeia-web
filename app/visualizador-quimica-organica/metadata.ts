import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Química Orgánica: Grupos Funcionales y Reacciones Interactivas | meskeIA',
  description: 'Explora grupos funcionales, reacciones básicas, aromaticidad e isomería con visualizaciones SVG interactivas. Alcanos, alcoholes, cetonas, ácidos, aminas y ésteres.',
  keywords: 'química orgánica, grupos funcionales, reacciones orgánicas, aromaticidad, isomería, benceno, alcoholes, ácidos carboxílicos, ésteres, aminas, SN2, esterificación, IUPAC',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/visualizador-quimica-organica/' },
  openGraph: {
    type: 'website',
    title: 'Química Orgánica: Grupos Funcionales y Reacciones',
    description: 'Visualizador interactivo de química orgánica: grupos funcionales con SVG, reacciones básicas (SN2, esterificación, oxidación), aromaticidad e isomería.',
    url: 'https://meskeia.com/visualizador-quimica-organica/',
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
    title: 'Química Orgánica - Grupos Funcionales y Reacciones | meskeIA',
    description: 'Explora grupos funcionales, benceno, SN2, esterificación, isomería cis/trans y óptica con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Química Orgánica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Química Orgánica: Grupos Funcionales y Reacciones Interactivas',
  description: 'Visualizador interactivo de química orgánica: 8 grupos funcionales con SVG y propiedades, 4 reacciones básicas (adición electrófila, SN2, esterificación, oxidación), aromaticidad con regla de Hückel y benceno resonante, isomería estructural/geométrica/óptica con ilustraciones.',
  url: 'https://meskeia.com/visualizador-quimica-organica/',
  category: 'EducationalApplication',
  features: [
    '8 grupos funcionales con fórmulas, ejemplos y representaciones SVG',
    'Panel de propiedades: polaridad, punto de ebullición relativo, aplicaciones reales',
    '4 reacciones orgánicas fundamentales con ecuaciones y mecanismos',
    'Sección de aromaticidad: benceno, regla de Hückel, SEA',
    'Isomería estructural, geométrica (cis/trans) y óptica ilustrada',
    'Visualizaciones SVG de moléculas simplificadas',
    'Ejemplos cotidianos: jabón, aspirina, nylon, vinagre',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y disponible en español',
  ],
});

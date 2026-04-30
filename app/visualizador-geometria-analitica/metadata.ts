import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Geometría Analítica: Cónicas Interactivas — meskeIA',
  description: 'Explora las cónicas (circunferencia, elipse, parábola, hipérbola) con gráficas SVG interactivas. Sliders en tiempo real, ecuaciones canónicas, focos, vértices y coordenadas polares.',
  keywords: 'geometría analítica, cónicas, circunferencia, elipse, parábola, hipérbola, ecuaciones canónicas, focos, coordenadas polares, secciones cónicas, matemáticas interactivas, visualizador matemático',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Geometría Analítica: Cónicas Interactivas',
    description: 'Circunferencia, elipse, parábola e hipérbola explicadas visualmente con sliders y ecuaciones en tiempo real.',
    url: 'https://meskeia.com/visualizador-geometria-analitica',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geometría Analítica — Cónicas Interactivas',
    description: 'Explora las 4 cónicas con gráficas SVG interactivas, sliders y ecuaciones canónicas en tiempo real.',
  },
  other: { 'application-name': 'Geometría Analítica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Geometría Analítica: Cónicas Interactivas',
  description: 'Visualizador interactivo de cónicas (circunferencia, elipse, parábola, hipérbola) con sliders, ecuaciones canónicas en tiempo real, focos, vértices, directrices y coordenadas polares.',
  url: 'https://meskeia.com/visualizador-geometria-analitica/',
  category: 'EducationalApplication',
  features: [
    'Visualización SVG interactiva de las 4 cónicas',
    'Sliders para parámetros en tiempo real',
    'Ecuaciones canónicas actualizadas al instante',
    'Focos, vértices y puntos notables con coordenadas',
    'Asíntotas de la hipérbola en líneas punteadas',
    'Tab de coordenadas polares: rosa de pétalos, espiral y cardioide',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y disponible en español',
  ],
});

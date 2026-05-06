import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona el GPS - Satélites, Trilateración y Relatividad | meskeIA',
  description: 'Descubre cómo el GPS localiza tu posición: 31 satélites, trilateración por señales de radio, la corrección de Einstein y los sistemas de navegación mundial. Explicador visual interactivo.',
  keywords: 'GPS, satélites, trilateración, relatividad, Einstein, navegación, GNSS, Galileo, GLONASS, BeiDou, precisión GPS, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona el GPS - Satélites, Trilateración y Relatividad',
    description: '31 satélites, la velocidad de la luz y la relatividad de Einstein: todo lo que hace posible que tu móvil sepa dónde estás.',
    url: 'https://meskeia.com/visualizador-gps',
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
    title: 'Cómo Funciona el GPS - Satélites y Relatividad',
    description: 'De los satélites a tu bolsillo: trilateración, relojes atómicos y la corrección de Einstein, explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'GPS meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona el GPS',
  description: 'Explicador visual interactivo sobre tecnología GPS: constelación de 31 satélites a 20.200 km, trilateración por señales de radio, corrección relativista de Einstein (+38 μs/día) y comparativa de sistemas de navegación global (GPS, Galileo, GLONASS, BeiDou).',
  url: 'https://meskeia.com/visualizador-gps/',
  category: 'EducationalApplication',
  features: [
    'Constelación de 31 satélites GPS con órbitas a 20.200 km',
    'Trilateración interactiva: de 1 círculo a 3 para fijar posición',
    'Corrección relativista de Einstein: +38 μs/día explicada visualmente',
    'Comparativa GPS vs Galileo vs GLONASS vs BeiDou',
    'Niveles de precisión: estándar, diferencial y RTK',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

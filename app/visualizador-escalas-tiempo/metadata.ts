import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuánto Tarda el Mundo - Escalas Temporales Fascinantes | meskeIA',
  description: 'Visualiza escalas de tiempo que desafían la intuición: desde un parpadeo hasta la edad del universo. 20+ fenómenos ordenados en una línea temporal interactiva.',
  keywords: 'escalas temporales, cuánto tarda, perspectiva tiempo, degradación plástico, edad universo, tiempo geológico, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cuánto Tarda el Mundo',
    description: 'Escalas de tiempo fascinantes: de un parpadeo a la edad del universo.',
    url: 'https://meskeia.com/visualizador-escalas-tiempo/',
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
    title: 'Cuánto Tarda el Mundo',
    description: 'Visualiza escalas temporales que desafían tu intuición.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Escalas Tiempo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuánto Tarda el Mundo',
  description: 'Explicador visual de escalas temporales: desde milisegundos hasta miles de millones de años. Fenómenos naturales, humanos y cósmicos ordenados en una visualización interactiva.',
  url: 'https://meskeia.com/visualizador-escalas-tiempo/',
  features: [
    '20+ fenómenos temporales de diferentes escalas',
    'Categorías: instantes, humano, naturaleza, geológico, cósmico',
    'Barras logarítmicas proporcionales',
    'Comparaciones sorprendentes entre fenómenos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

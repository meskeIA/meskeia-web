import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mapa de tu Tiempo - ¿En qué gastas tu vida? | meskeIA',
  description: 'Visualiza cómo se reparten las ~700.000 horas de tu vida: dormir, trabajar, comer, transporte, pantallas, ocio. Treemap interactivo por décadas.',
  keywords: 'mapa tiempo vida, horas vida, dormir trabajar, uso del tiempo, explicador visual, perspectiva vital',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mapa de tu Tiempo - ¿En qué gastas tu vida?',
    description: 'Visualiza cómo se reparten las horas de tu vida: dormir, trabajar, comer y más.',
    url: 'https://meskeia.com/visualizador-mapa-tiempo/',
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
    title: 'El Mapa de tu Tiempo',
    description: '¿En qué gastas las 700.000 horas de tu vida? Visualízalo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mapa Tiempo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mapa de tu Tiempo',
  description: 'Explicador visual que muestra cómo se distribuyen las horas de una vida humana: dormir, trabajar, comer, transporte, pantallas, vida social y tiempo libre. Visualización interactiva con datos por etapas vitales.',
  url: 'https://meskeia.com/visualizador-mapa-tiempo/',
  features: [
    'Distribución de horas de vida en categorías principales',
    'Slider de esperanza de vida personalizable',
    'Comparativa por etapas vitales',
    'Gráfico de barras apiladas por actividad',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

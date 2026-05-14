import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Profundidad de Campo (DoF) | meskeIA',
  description: 'Calcula la profundidad de campo, distancia hiperfocal y zona de nitidez de tu fotografía. Introduce focal, apertura, distancia y sensor (FF, APS-C, M4/3). Visualización en regla.',
  keywords: 'calculadora profundidad de campo, DoF photography, distancia hiperfocal, círculo de confusión, zona de nitidez fotografía, focal apertura distancia sensor, full frame APS-C Micro 4/3, fórmula hiperfocal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Profundidad de Campo',
    description: 'Calcula DoF e hiperfocal con visualización en regla. Compatible con FF, APS-C y Micro 4/3.',
    url: 'https://meskeia.com/calculadora-profundidad-campo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Profundidad de Campo',
    description: 'DoF, hiperfocal y zona de nitidez en una sola herramienta.',
  },
  other: {
    'application-name': 'Calculadora de Profundidad de Campo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Profundidad de Campo (DoF)',
  description: 'Herramienta para calcular la profundidad de campo, distancia hiperfocal, distancia cercana y lejana de nitidez aceptable a partir de la focal, apertura, distancia al sujeto y tamaño del sensor (Full Frame, APS-C ×1,5, APS-C ×1,6, Micro 4/3). Incluye visualización en regla y 5 presets típicos.',
  url: 'https://meskeia.com/calculadora-profundidad-campo/',
  category: 'EducationalApplication',
  features: [
    'Cálculo de DoF, hiperfocal, Dn (cercana) y Df (lejana) en metros',
    '4 tamaños de sensor: Full Frame, APS-C ×1,5, APS-C ×1,6, Micro 4/3',
    'Aperturas estándar de f/1,4 a f/22 con botones rápidos',
    'Visualización en regla SVG con escala logarítmica y zona de nitidez',
    '5 presets típicos: retrato bokeh, paisaje todo nítido, macro, hiperfocal, astrofoto',
    'Guía educativa completa con círculo de confusión y consejos prácticos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});

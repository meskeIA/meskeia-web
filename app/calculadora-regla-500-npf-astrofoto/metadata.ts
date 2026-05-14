import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Regla 500 y NPF (Astrofotografía) | meskeIA',
  description: 'Calcula el tiempo máximo de exposición sin estelas de estrellas. Regla 500 simple y fórmula NPF precisa (apertura + píxel + declinación). Visualización de estrellas en tiempo real.',
  keywords: 'regla 500 astrofotografía, fórmula NPF estrellas, exposición máxima sin estelas, star trail evitar, pixel pitch declinación, vía láctea cámara, tiempo exposición estrellas, astrofoto principiantes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Regla 500 y NPF para Astrofotografía',
    description: 'Tiempo máximo de exposición para fotos de cielo nocturno sin que las estrellas se conviertan en estelas.',
    url: 'https://meskeia.com/calculadora-regla-500-npf-astrofoto/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Regla 500 y NPF',
    description: 'Regla 500 simple + NPF precisa para astrofotografía.',
  },
  other: {
    'application-name': 'Regla 500 y NPF Astrofoto meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora Regla 500 y NPF para Astrofotografía',
  description: 'Herramienta para calcular el tiempo máximo de exposición fotográfica sin que las estrellas se conviertan en estelas. Implementa la regla 500 clásica (rápida) y la fórmula NPF moderna (más precisa, considera apertura, tamaño de píxel y declinación celeste). Incluye visualización SVG de estrellas que reaccionan al tiempo elegido.',
  url: 'https://meskeia.com/calculadora-regla-500-npf-astrofoto/',
  category: 'EducationalApplication',
  features: [
    'Cálculo de tiempo máximo por regla 500 (clásica) y NPF (precisa)',
    '4 sensores: Full Frame, APS-C ×1,5, APS-C ×1,6, Micro 4/3',
    'Cálculo automático de pixel pitch desde megapíxeles del sensor',
    'Slider de declinación celeste con presets (Orión, Vía Láctea, Polaris)',
    'Visualización SVG: estrellas puntuales o con estela según el tiempo elegido',
    'Comparativa entre tiempo elegido y los dos límites',
    'Guía completa de astrofotografía nocturna',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});

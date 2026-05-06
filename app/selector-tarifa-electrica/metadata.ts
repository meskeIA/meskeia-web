import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tarifa Electrica - PVPC o Mercado Libre Espana | meskeIA',
  description:
    'Test de 10 preguntas para descubrir si te conviene mas la tarifa PVPC regulada o el mercado libre de electricidad en Espana. Analiza tu patron de consumo.',
  keywords:
    'PVPC o mercado libre, tarifa electrica Espana, discriminacion horaria, 2.0TD, mejor tarifa luz, comparar tarifas electricidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Selector de Tarifa Electrica - PVPC o Mercado Libre | meskeIA',
    description:
      'Responde 10 preguntas sobre tus habitos de consumo y descubre que tarifa electrica te conviene mas: PVPC regulada o mercado libre.',
    url: 'https://meskeia.com/selector-tarifa-electrica',
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
    title: 'Selector de Tarifa Electrica | meskeIA',
    description:
      'Test rapido para saber si te conviene PVPC o mercado libre de electricidad en Espana.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Selector de Tarifa Electrica meskeIA',
  },
};

// Schema.org JSON-LD para indexacion por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Selector de Tarifa Electrica',
  description:
    'Herramienta interactiva con 10 preguntas para analizar tu patron de consumo electrico y recomendarte la mejor tarifa: PVPC regulada (2.0TD con discriminacion horaria) o mercado libre con precio fijo. Incluye estimacion de coste anual y consejos personalizados.',
  url: 'https://meskeia.com/selector-tarifa-electrica/',
  features: [
    'Test de 10 preguntas sobre habitos de consumo electrico',
    'Recomendacion personalizada entre PVPC y mercado libre',
    'Estimacion de coste anual para cada opcion',
    'Explicacion de franjas horarias 2.0TD (punta, llano, valle)',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});

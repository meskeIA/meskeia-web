import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Multiplicador del Gasto - Keynes y Política Fiscal | meskeIA',
  description: 'Simula el efecto multiplicador del gasto público: PMC, impuestos e importaciones. Calcula cómo 1€ de estímulo fiscal genera más de 1€ de PIB. Macroeconomía Bachillerato.',
  keywords: 'multiplicador keynesiano, gasto público, propensión marginal a consumir, PMC, política fiscal, multiplicador fiscal, Keynes, macroeconomía, Bachillerato, economía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-multiplicador-gasto/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Multiplicador del Gasto | meskeIA',
    description: 'Visualiza el efecto multiplicador keynesiano: cómo el gasto público se amplifica ronda a ronda',
    url: 'https://meskeia.com/simulador-multiplicador-gasto/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Multiplicador del Gasto | meskeIA',
    description: 'Aprende macroeconomía con el multiplicador keynesiano en acción',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Multiplicador del Gasto',
  description:
    'Simulador interactivo del multiplicador keynesiano del gasto público. Ajusta PMC, tipo impositivo y propensión a importar para ver cómo un estímulo inicial se amplifica en sucesivas rondas de consumo, con diagrama de rondas, tabla detallada y comparativa de escenarios.',
  url: 'https://meskeia.com/simulador-multiplicador-gasto/',
  category: 'EducationalApplication',
  features: [
    'Cálculo del multiplicador simple y con impuestos e importaciones',
    'Diagrama de rondas de gasto con animación CSS',
    'Tabla detallada de las primeras rondas con impulso acumulado',
    'Comparativa visual de tres escenarios (economía cerrada, con impuestos, abierta)',
    '4 parámetros ajustables con sliders en tiempo real',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['multiplicador keynesiano', 'gasto público', 'PMC', 'macroeconomía', 'política fiscal'],
});

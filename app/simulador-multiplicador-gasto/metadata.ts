import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Multiplicador del Gasto - Keynes y Política Fiscal | meskeIA',
  description: 'Simula el efecto multiplicador del gasto público: PMC, impuestos e importaciones. Calcula cómo 1€ de estímulo fiscal genera más de 1€ de PIB. Macroeconomía para Bachillerato (España), preparatoria y secundaria (Latinoamérica).',
  keywords: 'multiplicador keynesiano, gasto público, propensión marginal a consumir, PMC, política fiscal, multiplicador fiscal, Keynes, macroeconomía, Bachillerato, preparatoria, secundaria, economía',
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
    'En español',
  ],
  keywords: ['multiplicador keynesiano', 'gasto público', 'PMC', 'macroeconomía', 'política fiscal'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el multiplicador keynesiano del gasto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El multiplicador keynesiano describe cómo un aumento inicial del gasto (público o privado) genera un incremento del PIB mayor que el gasto original. Cada euro inyectado se convierte en renta para alguien, parte de la cual se vuelve a gastar, generando nuevas rentas en sucesivas rondas. La fórmula básica es k = 1 / (1 − PMC), donde PMC es la propensión marginal a consumir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afectan los impuestos al efecto multiplicador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los impuestos reducen la renta disponible en cada ronda de consumo, lo que disminuye el valor del multiplicador. Con un tipo impositivo t, la fórmula es k = 1 / (1 − PMC(1 − t)). Un tipo impositivo del 25% puede reducir el multiplicador de 4 (economía cerrada sin impuestos) a aproximadamente 2,7, amortiguando el impacto total del estímulo fiscal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel juegan las importaciones en el multiplicador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las importaciones "filtran" renta fuera del circuito económico doméstico: parte de cada ronda de gasto se destina a comprar bienes del exterior en lugar de producción nacional. En economías muy abiertas, la propensión marginal a importar reduce notablemente el multiplicador. La fórmula completa es k = 1 / (1 − PMC(1 − t) + m), donde m es la propensión marginal a importar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el multiplicador es mayor en una recesión que en pleno empleo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una recesión existen recursos productivos ociosos (trabajadores desempleados, capacidad instalada sin usar), por lo que el gasto adicional puede traducirse en mayor producción real sin generar inflación. En cambio, cerca del pleno empleo la economía tiene poca capacidad sobrante y el estímulo fiscal acaba generando más inflación que producción real, reduciendo el multiplicador efectivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda en agotarse el efecto multiplicador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Teóricamente el proceso se extiende infinitas rondas, pero en la práctica más del 90% del impacto se concentra en las primeras 8-10 rondas. Con un multiplicador de 2,5, tras 5 rondas ya se ha acumulado aproximadamente el 75% del impacto total. Los retardos temporales reales (meses entre decisiones y gasto) hacen que el efecto completo tarde entre 1 y 2 años en materializarse.',
      },
    },
  ],
};

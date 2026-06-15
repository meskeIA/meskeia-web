import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Ahorro para la Jubilación 2026 — Brecha, ahorro y plan de pensiones | meskeIA',
  description: 'Calcula tu brecha de jubilación, cuánto necesitas ahorrar mensualmente, la ventaja fiscal del plan de pensiones y la proyección de capital acumulado por escenarios.',
  keywords: 'brecha jubilacion, ahorro jubilacion, plan de pensiones, diferencia pension sueldo, cuanto ahorrar jubilacion, deduccion irpf plan pensiones, pension complementaria, proyeccion capital jubilacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Ahorro para la Jubilación 2026 | meskeIA',
    description: 'Brecha, ahorro necesario, ventaja fiscal del plan de pensiones y proyección de capital.',
    url: 'https://meskeia.com/planificador-ahorro-jubilacion/',
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
    title: 'Planificador de Ahorro para la Jubilación 2026 | meskeIA',
    description: 'Brecha, ahorro, plan de pensiones y proyección de capital para tu jubilación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Ahorro Jubilación meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Ahorro para la Jubilación',
  description: 'Planificador completo de ahorro para la jubilación: calcula tu brecha entre sueldo y pensión, cuánto necesitas ahorrar mensualmente, la ventaja fiscal del plan de pensiones (deducción IRPF) y la proyección de capital acumulado por escenarios (conservador, moderado, agresivo).',
  url: 'https://meskeia.com/planificador-ahorro-jubilacion/',
  features: [
    'Cálculo de brecha entre sueldo y pensión',
    'Ahorro mensual necesario para cubrir la diferencia',
    'Ventaja fiscal del plan de pensiones (IRPF 2026)',
    'Proyección de capital por 3 escenarios de rentabilidad',
    'Pensión complementaria estimada',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿A qué edad se jubila normalmente en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026, la edad ordinaria de jubilación en España es de 66 años y 10 meses si se tienen menos de 38 años y 3 meses cotizados. Para quienes acrediten 38 años y 3 meses o más de cotización, la edad de jubilación ordinaria se mantiene en 65 años. La edad de jubilación ordinaria seguirá aumentando hasta alcanzar los 67 años en 2027.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos años hay que cotizar para recibir el 100% de la pensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para percibir el 100% de la base reguladora se necesitan actualmente 36 años y 9 meses cotizados (36,75 años), un periodo transitorio fijado por la Ley 21/2021 que aumenta progresivamente cada año. Con menos años cotizados se aplican porcentajes reductores: entre 15 y 36 años, la pensión oscila entre el 50% y el 99,2%. El mínimo para acceder a la jubilación ordinaria es 15 años cotizados, de los cuales 2 deben estar en los últimos 15 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la brecha de jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La brecha de jubilación es la diferencia entre el último salario activo y la pensión pública estimada. En España, la tasa de reemplazo (pensión como porcentaje del salario) es aproximadamente del 74%, una de las más altas de la OCDE. Sin embargo, con las reformas de sostenibilidad en marcha, esta tasa podría reducirse en las próximas décadas, haciendo más importante el ahorro complementario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta deducción fiscal tiene un plan de pensiones en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las aportaciones a planes de pensiones individuales se deducen de la base imponible del IRPF con un límite de 1.500 € anuales (o el 30% de los rendimientos del trabajo y actividades económicas, si es menor). Con un tipo marginal del 37% y aportación de 1.500 €, el ahorro fiscal es de 555 € anuales. Los planes de empresa tienen límites adicionales más altos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un plan de pensiones y un fondo de inversión para la jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plan de pensiones ofrece deducción fiscal en la aportación pero tributa como rendimiento del trabajo en el rescate (tipo entre 19% y 47%) y es ilíquido hasta la jubilación salvo supuestos excepcionales. El fondo de inversión no da deducción en la aportación pero tributa como ganancia patrimonial en el rescate (tipo entre 19% y 28%) y es líquido en cualquier momento. Para rentas altas en activo con tramo marginal alto, el plan de pensiones suele ser más eficiente fiscalmente.',
      },
    },
  ],
};

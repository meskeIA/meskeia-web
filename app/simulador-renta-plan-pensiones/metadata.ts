import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Plan de Pensiones IRPF: ¿Te Conviene? | meskeIA',
  description: 'Compara orientativamente tu IRPF con y sin aportación a plan de pensiones individual. Ahorro fiscal hoy vs tributación futura al rescate. Forma de capital, renta o mixto. Datos 2025.',
  keywords: 'plan de pensiones IRPF ahorro fiscal, rescate plan pensiones, plan pensiones tributación, aportación plan pensiones limite 1500, capital o renta plan pensiones, marginal jubilación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-renta-plan-pensiones/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Plan de Pensiones IRPF | meskeIA',
    description: 'Ahorro fiscal hoy vs tributación al rescate — qué es lo realmente importante',
    url: 'https://meskeia.com/simulador-renta-plan-pensiones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Plan de Pensiones IRPF | meskeIA',
    description: 'Aprende cómo tributa de verdad el plan de pensiones',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador IRPF Plan de Pensiones (Aporte y Rescate)',
  description: 'Simulador comparativo orientativo del efecto fiscal real de aportar a un plan de pensiones individual en España: ahorro fiscal hoy vs tributación futura al rescate. Distintas formas de rescate (capital, renta, mixto).',
  url: 'https://meskeia.com/simulador-renta-plan-pensiones/',
  category: 'FinanceApplication',
  features: [
    '3 escenarios comparados: sin plan, con plan (rescate óptimo), con plan (rescate mal gestionado)',
    'Cálculo IRPF actual y proyección al rescate',
    'Forma de rescate: capital, renta o mixto',
    'Régimen transitorio aportaciones pre-2007',
    'Interés compuesto y rentabilidad esperada',
    '4 casos preconfigurados (joven, mileurista, alto, mal rescate)',
    'Datos basados en Ley 35/2006 y LPGE 2025',
    'Solo orientativo — consulta con asesor fiscal',
    'En español',
  ],
  keywords: ['plan de pensiones', 'IRPF', 'rescate', 'fiscal España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto ahorra en el IRPF aportar a un plan de pensiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aportación al plan de pensiones reduce la base imponible general del IRPF. El ahorro depende del tipo marginal: con un salario de 30.000 € y un tipo marginal del 30%, una aportación anual de 1.500 € supone un ahorro fiscal de unos 450 €. Cuanto más alto sea el tipo marginal, mayor es el beneficio fiscal en el año de la aportación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo tributa el rescate de un plan de pensiones en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rescate tributa íntegramente como rendimiento del trabajo en la base general del IRPF, al tipo marginal del contribuyente en el momento del cobro. Si se rescata en forma de capital (todo de golpe), el importe se suma a la renta del año y puede disparar el tipo marginal. Si se rescata en forma de renta periódica, se reparte entre varios ejercicios y normalmente tributa a tipos más bajos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es realmente rentable un plan de pensiones o hay alternativas mejores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la diferencia entre el tipo marginal actual y el tipo marginal en la jubilación. Si al jubilarse el tipo baja significativamente, el diferimiento fiscal resulta ventajoso. Si el tipo es similar, la ventaja es menor y productos como los fondos de inversión indexados pueden ser más flexibles (sin penalización por rescate y con tributación solo en ganancias). El límite de deducción en 2025 es de 1.500 € anuales para planes individuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el régimen transitorio del plan de pensiones para aportaciones antes de 2007?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las aportaciones realizadas antes del 1 de enero de 2007 pueden beneficiarse de una reducción del 40% al rescatarse en forma de capital, siempre que el rescate se realice en el mismo ejercicio del primer cobro o en los dos siguientes. Este beneficio solo aplica a la parte proporcional del capital acumulado antes de esa fecha, y su uso requiere planificación para no perder la ventaja por plazos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién tiene más sentido un plan de pensiones individual en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Principalmente para trabajadores con tipo marginal alto (a partir del 37-45%) que esperan jubilarse con rentas más bajas y, por tanto, tributar a tipos menores al rescate. También puede ser útil como complemento a la pensión pública si se anticipa una brecha significativa de ingresos. Para rentas bajas o medias donde el tipo marginal no cambia mucho, otros instrumentos de ahorro pueden ofrecer más flexibilidad.',
      },
    },
  ],
};

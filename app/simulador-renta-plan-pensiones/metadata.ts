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
    url: 'https://meskeia.com/simulador-renta-plan-pensiones',
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
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['plan de pensiones', 'IRPF', 'rescate', 'fiscal España'],
});

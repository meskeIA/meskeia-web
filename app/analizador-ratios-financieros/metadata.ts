import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Analizador de Ratios Financieros - Balance y Rentabilidad - meskeIA',
  description: 'Analiza la situación financiera de una empresa con 12 ratios clave: liquidez, endeudamiento, rentabilidad y gestión. Semáforo de interpretación y datos de ejemplo incluidos.',
  keywords: 'ratios financieros, analisis balance, liquidez corriente, ROE ROA, endeudamiento, margen neto, periodo medio cobro, analisis financiero empresa, ratios contabilidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Analizador de Ratios Financieros - meskeIA',
    description: '12 ratios financieros con semáforo de interpretación: liquidez, endeudamiento, rentabilidad (ROE, ROA, margen) y gestión (PMC, PMP). Con datos de ejemplo.',
    url: 'https://meskeia.com/analizador-ratios-financieros/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analizador de Ratios Financieros - meskeIA',
    description: 'Introduce los datos de tu balance y cuenta de resultados. Obtén 12 ratios financieros con su interpretación y semáforo.',
  },
  other: {
    'application-name': 'Analizador de Ratios Financieros meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Analizador de Ratios Financieros',
  description: 'Herramienta para analizar la situación financiera de una empresa mediante 12 ratios financieros clave: liquidez (corriente, ácida, tesorería), endeudamiento (ratio deuda, autonomía, cobertura), rentabilidad (ROE, ROA, margen neto) y gestión (rotación activos, PMC, PMP). Incluye semáforo de interpretación con rangos orientativos.',
  url: 'https://meskeia.com/analizador-ratios-financieros/',
  category: 'FinanceApplication',
  features: [
    '12 ratios financieros calculados automáticamente',
    'Semáforo visual: crítico, adecuado y holgado por ratio',
    'Datos de empresa de ejemplo precargados para ver resultados al instante',
    'Grupos: liquidez, endeudamiento, rentabilidad y gestión',
    'Interpretación textual de cada ratio con su valor concreto',
    'Fórmulas y rangos orientativos visibles en cada tarjeta',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los ratios financieros y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ratios financieros son cocientes que relacionan dos magnitudes del balance o la cuenta de resultados para obtener información sobre la salud económica de una empresa. Permiten evaluar su liquidez (capacidad de pagar deudas), endeudamiento (dependencia de financiación externa), rentabilidad (eficiencia generando beneficios) y eficiencia en la gestión de activos. Son herramientas básicas de análisis fundamental para inversores, analistas y directivos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué datos necesito para calcular los ratios financieros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Necesitas los datos del balance de situación (activo corriente, existencias, tesorería, clientes, activo total, pasivo corriente, pasivo total, patrimonio neto y proveedores) y de la cuenta de resultados (ventas, compras, EBIT o resultado operativo, gastos financieros y resultado neto). Todos estos datos aparecen en las cuentas anuales de cualquier empresa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que el ratio de liquidez sea menor que 1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un ratio de liquidez corriente menor que 1 indica que el pasivo corriente (deudas a corto plazo) supera al activo corriente (bienes y derechos a corto plazo). Esto puede implicar dificultades para atender los pagos a corto plazo con los recursos disponibles. No siempre es una señal de quiebra inminente —algunas empresas operan así con líneas de crédito— pero sí es una señal de alerta que conviene analizar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este analizador de ratios financieros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de finanzas, contabilidad o administración de empresas que quieren practicar el análisis de balances; para autónomos y pequeños empresarios que desean entender la situación de su empresa; para inversores particulares que analizan empresas antes de invertir; y para cualquier profesional que deba preparar o interpretar un informe financiero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son exactos los rangos de los ratios que muestra la herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los rangos son orientativos y válidos para la mayoría de empresas, pero varían significativamente según el sector. Por ejemplo, un ratio de endeudamiento del 80% es habitual en el sector bancario pero preocupante en manufactura. Un margen neto del 3% puede ser excelente en distribución minorista pero insuficiente en tecnología. Los rangos deben interpretarse siempre comparando con empresas del mismo sector y con la evolución histórica de la propia empresa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el análisis DuPont del ROE?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El análisis DuPont es una técnica creada en los años 20 por la empresa DuPont que descompone la rentabilidad financiera (ROE) en tres factores que se multiplican: el margen neto (Resultado Neto / Ventas), la rotación de activos (Ventas / Activo Total) y el apalancamiento financiero (Activo Total / Patrimonio Neto). Sirve para entender de dónde nace realmente la rentabilidad de una empresa: dos empresas con el mismo ROE pueden lograrlo de formas opuestas, una con mucho margen y poca deuda y otra con margen ajustado pero mucho apalancamiento, siendo esta segunda más rentable pero más arriesgada. Esta herramienta calcula la descomposición DuPont automáticamente.',
      },
    },
  ],
};

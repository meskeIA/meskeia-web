import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador TIR y VAN - Análisis de Inversiones | meskeIA',
  description: 'Calcula la Tasa Interna de Retorno (TIR) y el Valor Actual Neto (VAN) de tus proyectos de inversión. Herramienta gratuita para análisis financiero.',
  keywords: 'calculadora TIR, calculadora VAN, tasa interna retorno, valor actual neto, análisis inversiones, rentabilidad proyecto, flujos caja',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador TIR y VAN | meskeIA',
    description: 'Evalúa la rentabilidad de tus proyectos de inversión con TIR y VAN.',
    url: 'https://meskeia.com/estimador-tir-van/',
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
    title: 'Estimador TIR y VAN | meskeIA',
    description: 'Analiza la rentabilidad de tus inversiones con TIR y VAN.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador TIR-VAN",
  description: "Calcula la Tasa Interna de Retorno (TIR) y el Valor Actual Neto (VAN) de tus proyectos de inversión. Herramienta gratuita para análisis financiero.",
  url: "https://meskeia.com/estimador-tir-van/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el VAN y para qué sirve en el análisis de inversiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Valor Actual Neto (VAN) mide la diferencia entre el valor presente de todos los flujos de caja que genera un proyecto y la inversión inicial requerida. Un VAN positivo indica que el proyecto crea valor: genera más dinero del que cuesta descontando el efecto del tiempo. Un VAN negativo señala que el proyecto destruye valor en términos reales. Es uno de los criterios más utilizados en finanzas corporativas y evaluación de proyectos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la TIR y cuándo conviene usarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Tasa Interna de Retorno (TIR) es la tasa de descuento que hace que el VAN del proyecto sea igual a cero. En la práctica, representa la rentabilidad anual implícita del proyecto. Se usa para comparar proyectos entre sí o con el coste del capital: si la TIR supera la tasa de descuento exigida, el proyecto es rentable. Es especialmente útil cuando se comparan proyectos con diferente tamaño de inversión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre TIR y VAN para evaluar una inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El VAN mide la creación de valor en términos absolutos (euros), mientras que la TIR mide la rentabilidad en términos relativos (porcentaje anual). Cuando los proyectos son mutuamente excluyentes o tienen distinta inversión inicial, el VAN es más fiable para elegir. La TIR puede llevar a decisiones incorrectas si los flujos de caja cambian de signo varias veces (TIR múltiple). En la práctica, ambos indicadores se usan de forma complementaria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se interpretan los flujos de caja en el cálculo del TIR y VAN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los flujos de caja representan las entradas y salidas de dinero del proyecto en cada período. La inversión inicial se introduce como flujo negativo en el período 0. Los ingresos netos generados en años posteriores son flujos positivos. Es importante incluir el valor residual del proyecto al final del horizonte si corresponde. Tanto el VAN como la TIR son muy sensibles a la estimación de estos flujos, por lo que conviene realizar análisis de sensibilidad con distintos escenarios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil una calculadora de TIR y VAN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este tipo de análisis es útil para cualquier persona o empresa que evalúe una inversión con desembolso inicial y retornos futuros: emprendedores que valoran si un negocio es viable, directivos que comparan proyectos de expansión, inversores inmobiliarios que calculan la rentabilidad de un alquiler, o estudiantes de finanzas y administración de empresas que practican análisis de inversiones. No requiere conocimientos avanzados: basta con estimar los flujos de caja esperados.',
      },
    },
  ],
};

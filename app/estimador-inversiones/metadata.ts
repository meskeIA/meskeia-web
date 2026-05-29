import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Inversiones - Asignación de Activos | meskeIA',
  description: 'Calcula y optimiza tu cartera de inversión. Asignación de activos según tu perfil de riesgo, análisis de diversificación y rebalanceo de portfolio.',
  keywords: 'calculadora inversiones, asset allocation, diversificación cartera, perfil inversor, rebalanceo portfolio, renta variable, renta fija',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Inversiones | meskeIA',
    description: 'Optimiza tu cartera con asignación de activos según tu perfil.',
    url: 'https://meskeia.com/estimador-inversiones/',
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
    title: 'Estimador de Inversiones | meskeIA',
    description: 'Calcula tu distribución óptima de activos de inversión.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Inversiones",
  description: "Calcula y optimiza tu cartera de inversión. Asignación de activos según tu perfil de riesgo, análisis de diversificación y rebalanceo de portfolio.",
  url: "https://meskeia.com/estimador-inversiones/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la asignación de activos en una cartera de inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La asignación de activos es la distribución del capital entre diferentes clases de inversión: renta variable (acciones), renta fija (bonos), liquidez, materias primas e inmuebles. Cada clase tiene un perfil de rentabilidad y riesgo distinto, y su combinación determina el comportamiento global de la cartera. Una distribución adecuada reduce la volatilidad total sin sacrificar toda la rentabilidad esperada a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calcula el estimador la distribución óptima de activos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estimador toma como entrada el perfil de riesgo del inversor (conservador, moderado o agresivo), el horizonte temporal y los activos disponibles, y aplica reglas de asignación basadas en principios de diversificación clásica. Muestra la distribución sugerida en porcentajes, el peso de cada clase de activo y una estimación de la rentabilidad y volatilidad históricas asociadas a esa combinación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el rebalanceo de portfolio y con qué frecuencia conviene hacerlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rebalanceo consiste en ajustar periódicamente los pesos de la cartera para que vuelvan a la distribución objetivo, ya que los distintos activos crecen a ritmos distintos y la proporción se desvía con el tiempo. La frecuencia habitual es anual o cuando la desviación supera un umbral del 5 %. Un rebalanceo excesivamente frecuente genera costes fiscales y de transacción que pueden superar el beneficio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de inversor es útil este estimador de inversiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para inversores particulares que empiezan a construir una cartera y quieren entender qué distribución de activos corresponde a su tolerancia al riesgo, así como para inversores con experiencia que desean revisar si su asignación actual sigue siendo coherente con sus objetivos. No es una herramienta para operativa de trading ni para gestión de carteras institucionales. Las estimaciones son orientativas y no constituyen asesoramiento financiero personalizado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre diversificación y rebalanceo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diversificación es la decisión inicial de repartir el capital entre activos poco correlacionados para reducir el riesgo global. El rebalanceo es el proceso periódico de mantenimiento que devuelve la cartera a esa distribución diversificada después de que los mercados la hayan alterado. Ambos conceptos son complementarios: la diversificación define la estrategia y el rebalanceo la mantiene activa a lo largo del tiempo.',
      },
    },
  ],
};

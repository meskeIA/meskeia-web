import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Estadística Médica - Sensibilidad, Especificidad, VPP, VPN | meskeIA',
  description: 'Calcula sensibilidad, especificidad, valores predictivos (VPP/VPN), razones de verosimilitud, odds ratio, riesgo relativo y NNT. Herramienta gratuita para estudiantes de medicina y epidemiología.',
  keywords: 'estadística médica, sensibilidad, especificidad, valor predictivo positivo, VPP, valor predictivo negativo, VPN, odds ratio, riesgo relativo, NNT, razón verosimilitud, epidemiología, pruebas diagnósticas, tabla 2x2, medicina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Estadística Médica | meskeIA',
    description: 'Sensibilidad, especificidad, VPP, VPN, odds ratio, riesgo relativo y NNT. Para estudiantes de medicina y epidemiología.',
    url: 'https://meskeia.com/calculadora-estadistica-medica/',
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
    title: 'Calculadora de Estadística Médica | meskeIA',
    description: 'Calcula métricas de pruebas diagnósticas y estudios epidemiológicos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Estadística Médica - Sensibilidad, Especificidad, VPP, VPN",
  description: "Calcula sensibilidad, especificidad, valores predictivos (VPP/VPN), razones de verosimilitud, odds ratio, riesgo relativo y NNT. Herramienta gratuita para estudiantes de medicina y epidemiología.",
  url: 'https://meskeia.com/calculadora-estadistica-medica/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre sensibilidad y especificidad en una prueba diagnóstica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sensibilidad mide la capacidad de una prueba para detectar correctamente a los enfermos: es el porcentaje de verdaderos positivos entre todos los enfermos reales. La especificidad mide la capacidad de descartar la enfermedad en personas sanas: porcentaje de verdaderos negativos entre todos los sanos. Una prueba muy sensible minimiza los falsos negativos; una muy específica minimiza los falsos positivos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son el VPP y el VPN y por qué cambian con la prevalencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Valor Predictivo Positivo (VPP) indica la probabilidad de que un resultado positivo sea realmente un caso de enfermedad. El Valor Predictivo Negativo (VPN) indica la probabilidad de que un negativo sea realmente un sano. A diferencia de la sensibilidad y la especificidad, el VPP y el VPN dependen de la prevalencia de la enfermedad en la población estudiada: con prevalencias bajas, incluso pruebas muy específicas pueden tener VPP reducido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se interpreta el NNT (número necesario a tratar)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El NNT indica cuántos pacientes hay que tratar con una intervención para obtener un resultado favorable adicional en comparación con el control. Un NNT de 10 significa que es necesario tratar a 10 personas para que una se beneficie. Cuanto más cercano a 1, más eficaz es el tratamiento. Se calcula como el inverso de la reducción absoluta del riesgo (RAR).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se usa la razón de verosimilitud (likelihood ratio) en lugar de la sensibilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las razones de verosimilitud (LR+ y LR−) son útiles porque no dependen de la prevalencia, a diferencia del VPP/VPN. El LR+ indica cuántas veces es más probable un resultado positivo en enfermos que en sanos; el LR− hace lo mismo para negativos. Son especialmente útiles para actualizar la probabilidad pretest mediante el teorema de Bayes y para comparar pruebas diagnósticas entre distintas poblaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué datos necesito para calcular el odds ratio y el riesgo relativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas medidas se obtienen a partir de una tabla de contingencia 2×2 con cuatro valores: verdaderos positivos (VP), falsos positivos (FP), falsos negativos (FN) y verdaderos negativos (VN). El riesgo relativo compara la incidencia de evento entre expuestos y no expuestos; el odds ratio compara los odds de evento en ambos grupos. El OR se usa habitualmente en estudios de casos y controles, mientras que el RR es más intuitivo en cohortes y ensayos clínicos.',
      },
    },
  ],
};

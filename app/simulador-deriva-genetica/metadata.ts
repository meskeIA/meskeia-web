import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Deriva Genética y Selección Natural | meskeIA',
  description:
    'Simula la evolución de frecuencias alélicas: deriva genética, selección natural, mutación y migración. Compara con el equilibrio de Hardy-Weinberg. Biología y genética de poblaciones Universidad.',
  keywords:
    'deriva genética, selección natural, frecuencias alélicas, Hardy-Weinberg, evolución poblaciones, fitness, mutación, fijación alelo, biología universidad, genética poblaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-deriva-genetica/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Deriva Genética y Selección Natural | meskeIA',
    description: 'Genética de poblaciones interactiva: deriva, selección, Hardy-Weinberg',
    url: 'https://meskeia.com/simulador-deriva-genetica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Deriva Genética | meskeIA',
    description: 'Aprende genética de poblaciones con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Deriva Genética y Selección Natural',
  description:
    'Simulador de genética de poblaciones que combina deriva, selección, mutación y migración. Ajusta el tamaño poblacional, los fitness por genotipo y las tasas de mutación; compara las trayectorias de frecuencias alélicas con el equilibrio de Hardy-Weinberg.',
  url: 'https://meskeia.com/simulador-deriva-genetica/',
  category: 'EducationalApplication',
  features: [
    'Modelo Wright-Fisher con selección, mutación y deriva',
    'Hasta 50 simulaciones independientes superpuestas',
    'Cálculo automático de probabilidad de fijación y pérdida',
    'Comparación con Hardy-Weinberg',
    '4 modos preestablecidos (deriva pura, selección direccional, equilibradora, HW)',
    'Histograma de frecuencias finales',
  ],
  keywords: ['deriva genética', 'selección natural', 'Hardy-Weinberg', 'biología universidad'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la deriva genética y por qué afecta más a poblaciones pequeñas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La deriva genética es el cambio aleatorio en las frecuencias alélicas de una población causado por el muestreo al azar de gametos en cada generación. En poblaciones pequeñas, la muestra es menos representativa del conjunto y las fluctuaciones aleatorias son proporcionalmente mayores, por lo que un alelo puede fijarse o perderse en pocas generaciones incluso sin ventaja selectiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre selección natural y deriva genética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La selección natural es un proceso determinista: favorece a los genotipos con mayor fitness reproductivo y produce cambios predecibles en la dirección del alelo favorecido. La deriva genética es un proceso estocástico (aleatorio): las frecuencias alélicas fluctúan independientemente del fitness. En poblaciones grandes predomina la selección; en pequeñas, la deriva puede superar el efecto selectivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué establece el equilibrio de Hardy-Weinberg y cuáles son sus condiciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El principio de Hardy-Weinberg establece que las frecuencias alélicas y genotípicas se mantienen constantes de generación en generación si se cumplen cinco condiciones: población grande (sin deriva), apareamiento aleatorio (panmixia), sin mutación, sin migración y sin selección natural. Sirve como modelo nulo para detectar fuerzas evolutivas: cualquier desviación indica que alguna fuerza está actuando.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la fijación de un alelo y cuándo ocurre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fijación ocurre cuando la frecuencia de un alelo llega al 100% (todos los individuos son homocigotos para ese alelo) y el alelo alternativo se pierde irreversiblemente. En ausencia de selección, la probabilidad de fijación de un alelo es igual a su frecuencia inicial. Con selección positiva, la probabilidad aumenta; con selección negativa, disminuye. Cuanto menor es la población, antes se alcanza la fijación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo influye la mutación y la migración en las frecuencias alélicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mutación introduce nuevos alelos a una tasa muy baja (10⁻⁵–10⁻⁶ por locus y generación), actuando principalmente como fuente de variación a largo plazo. La migración (flujo génico) incorpora o exporta alelos entre poblaciones, homogeneizando frecuencias entre ellas. Ambas fuerzas contrarrestan la deriva y mantienen la diversidad genética, especialmente en poblaciones pequeñas aisladas.',
      },
    },
  ],
};

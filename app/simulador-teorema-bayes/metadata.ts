import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Teorema de Bayes: Tests Médicos y Probabilidad Condicional | meskeIA',
  description: 'Visualiza el teorema de Bayes con diagrama de árbol y rectángulo proporcional. Por qué un test "99% preciso" puede dar más falsos positivos que verdaderos.',
  keywords: 'teorema de Bayes, probabilidad condicional, valor predictivo positivo, sensibilidad, especificidad, prevalencia, falsos positivos, tests médicos, EBAU, Bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-teorema-bayes/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Teorema de Bayes | meskeIA',
    description: 'La paradoja de los tests médicos: por qué la prevalencia importa tanto como la precisión.',
    url: 'https://meskeia.com/simulador-teorema-bayes/',
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
    title: 'Simulador del Teorema de Bayes | meskeIA',
    description: 'Visualiza P(D|+) con diagrama de árbol y rectángulo proporcional. Casos reales: COVID, mamografía, dopaje.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Teorema de Bayes',
  description: 'Simulador interactivo del teorema de Bayes aplicado a tests médicos y diagnóstico probabilístico. Permite ajustar prevalencia P(D), sensibilidad P(+|D) y especificidad P(-|¬D), y visualiza el resultado de dos formas complementarias: (1) diagrama de árbol mostrando cuántas personas de 1000 caen en cada categoría, (2) rectángulo proporcional con áreas iguales a probabilidades. Calcula automáticamente el valor predictivo positivo VPP = P(D|+), el valor predictivo negativo y los probabilidades post-test. Incluye 5 escenarios reales (test rápido COVID, mamografía, VIH, PSA, dopaje). Ideal para EBAU de Matemáticas y Bachillerato de probabilidad.',
  url: 'https://meskeia.com/simulador-teorema-bayes/',
  category: 'EducationalApplication',
  features: [
    'Dos modos de visualización: diagrama de árbol y rectángulo proporcional',
    'Sliders interactivos de prevalencia, sensibilidad y especificidad',
    '5 escenarios reales preestablecidos (COVID, mamografía, VIH, PSA, dopaje)',
    'Cálculo de valor predictivo positivo (VPP) y negativo (VPN)',
    'Visualización clara de falsos positivos vs verdaderos positivos',
    'Probabilidades pre-test vs post-test',
    'Aplicación de la fórmula de Bayes paso a paso',
  ],
  keywords: ['teorema de Bayes', 'probabilidad condicional', 'tests médicos', 'EBAU', 'Bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el teorema de Bayes y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El teorema de Bayes es una fórmula de probabilidad que permite actualizar la creencia sobre un evento al recibir nueva evidencia. En su forma más usada, P(D|+) = P(+|D)·P(D) / P(+), calcula la probabilidad de tener una enfermedad D dado un resultado positivo en un test. Combina tres datos: la prevalencia P(D) de la enfermedad en la población, la sensibilidad P(+|D) del test y la especificidad P(-|¬D) del mismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué un test con 99 % de precisión puede dar más falsos que verdaderos positivos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Todo depende de la prevalencia de la enfermedad. Si solo 1 persona de cada 10 000 está enferma (prevalencia 0,01 %) y el test tiene un 1 % de falsos positivos, al testar 10 000 personas habrá aproximadamente 1 verdadero positivo y 100 falsos positivos. El 99 % de los positivos serían alertas erróneas. Este fenómeno, contraintuitivo, es la razón por la que los cribados masivos de enfermedades raras se diseñan con gran cuidado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre sensibilidad, especificidad y valor predictivo positivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sensibilidad es la probabilidad de que el test sea positivo si la persona está enferma (detecta enfermos). La especificidad es la probabilidad de que el test sea negativo si la persona está sana (no confunde sanos con enfermos). El valor predictivo positivo (VPP) es la probabilidad de estar realmente enfermo si el test ha dado positivo, y depende también de la prevalencia: el mismo test tiene un VPP muy distinto en una población de alto riesgo que en la población general.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué campos se usa el teorema de Bayes además de la medicina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El teorema de Bayes se aplica en filtros de spam (¿es spam dado que contiene ciertas palabras?), en clasificadores de aprendizaje automático, en epidemiología, en razonamiento forense (probabilidad de culpabilidad ante una prueba de ADN), en robótica para fusión de sensores, en finanzas para actualizar predicciones de mercado con nueva información, y en cualquier situación donde sea necesario combinar conocimiento previo con nueva evidencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel de estudios es este simulador del teorema de Bayes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es adecuado para estudiantes de último año de educación secundaria superior (equivalente a Bachillerato o preparatoria) que estudien probabilidad condicional, así como para universitarios de matemáticas, estadística, medicina, biología o ciencias de datos. También resulta muy valioso para cualquier persona sin formación técnica que quiera entender por qué los resultados de los tests diagnósticos deben interpretarse siempre en contexto y no de forma aislada.',
      },
    },
  ],
};

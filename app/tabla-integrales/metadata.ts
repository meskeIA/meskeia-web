import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Integrales Completa — Todas las Fórmulas con Ejemplos | meskeIA',
  description:
    'Tabla de integrales con buscador instantáneo: inmediatas, exponenciales, logarítmicas, trigonométricas, tipo arcoseno y arcotangente, hiperbólicas y métodos de integración, con + C y ejemplos.',
  keywords:
    'tabla de integrales, integrales, formulario de integrales, tabla integrales completa, integrales inmediatas, integración por partes, ILATE, fracciones simples, regla de Barrow, primitiva, cálculo integral, matemáticas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-integrales/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Integrales Completa con Buscador | meskeIA',
    description:
      'Consulta cualquier primitiva en segundos: escribe «ln», «raíz» o «por partes» y la fórmula aparece, con sus condiciones de validez y un ejemplo resuelto.',
    url: 'https://meskeia.com/tabla-integrales/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabla de Integrales Completa con Buscador | meskeIA',
    description:
      'Formulario de integrales con búsqueda instantánea, constante de integración siempre visible y ejemplos resueltos paso a paso.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Integrales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Integrales',
  description:
    'Formulario de consulta rápida con 40 integrales: inmediatas y potencias (incluido el caso especial n = −1), exponenciales y logarítmicas, trigonométricas, las que dan lugar a arcoseno y arcotangente, hiperbólicas y los métodos de integración (sustitución, por partes con ILATE, fracciones simples y sustituciones trigonométricas). Incluye la regla de Barrow para integrales definidas.',
  url: 'https://meskeia.com/tabla-integrales/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo por nombre, expresión y sinónimos, tolerante a acentos',
    '40 fórmulas organizadas en 6 categorías filtrables',
    'Constante de integración + C señalada en todas las primitivas',
    'Condiciones de validez y dominios indicados fórmula a fórmula',
    'Justificación y ejemplo resuelto paso a paso en cada fila desplegable',
    'Métodos de integración: sustitución, por partes (ILATE), fracciones simples y sustituciones trigonométricas',
    'Sección sobre integral definida y regla de Barrow',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
  keywords: ['tabla de integrales', 'integrales', 'primitiva', 'regla de Barrow', 'cálculo integral'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué hay que poner siempre + C en una integral indefinida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque la derivada de una constante es cero: x²/2, x²/2 + 7 y x²/2 − π tienen la misma derivada. Una función continua tiene infinitas primitivas que se diferencian en una constante, y la integral indefinida las representa a todas, por eso se escribe + C. En una integral definida la constante se cancela al restar F(b) − F(a) y no debe escribirse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la integral de 1/x y por qué lleva valor absoluto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La integral de 1/x es ln|x| + C. El valor absoluto es necesario porque 1/x también está definida para x negativo: para x > 0 la derivada de ln x es 1/x, y para x < 0 la derivada de ln(−x) es (−1)/(−x) = 1/x. Además, este es el único caso en que falla la regla de la potencia, porque exigiría dividir entre n + 1 = 0.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la regla de Barrow y cómo se aplica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla de Barrow dice que la integral definida de f entre a y b vale F(b) − F(a), donde F es cualquier primitiva de f. Es consecuencia del teorema fundamental del cálculo y convierte un problema de áreas en una simple resta. Exige que f sea continua en todo el intervalo [a, b]: aplicarla a través de una asíntota da resultados absurdos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se elige qué función es u en la integración por partes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con la regla ILATE, que ordena por prioridad: Inversas trigonométricas, Logarítmicas, Algebraicas, Trigonométricas y Exponenciales. Se toma como u la que aparezca antes en esa lista, porque al derivarla se simplifica. En algunos países se enseña como LIATE, con las logarítmicas primero, y la diferencia práctica es mínima. Si la integral resultante es más complicada que la original, conviene invertir la elección.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué algunas funciones como e^(−x²) no tienen primitiva elemental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque el conjunto de funciones elementales no es cerrado para la integración. El teorema de Liouville demuestra que integrandos como e^(−x²), sen(x)/x o 1/ln x no admiten ninguna primitiva expresable con polinomios, exponenciales, logaritmos y trigonométricas. No es que no se haya encontrado: está demostrado que no existe, y por eso se calculan numéricamente o reciben nombre propio, como la función error.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// Lenguaje Latam-friendly: el término núcleo («progresión aritmética», «progresión
// geométrica», «término general», «razón») es universal en todo el español, así que el H1
// no necesita variantes. Lo que sí cambia de un país a otro es el DESCRIPTOR DE AUDIENCIA
// (ESO/bachillerato frente a secundaria/preparatoria/educación media): por eso aquí se
// usan las formas neutras y aditivas, y nunca en el H1.

export const metadata: Metadata = {
  title: 'Progresiones Aritméticas y Geométricas: Término General y Suma | meskeIA',
  description:
    'Calcula el término general y la suma de una progresión aritmética o geométrica con los pasos escritos, identifica cualquier sucesión que escribas y practica con 12 casos numerados.',
  keywords:
    'progresión aritmética, progresión geométrica, término general, suma de una progresión, razón de una progresión geométrica, diferencia de una progresión aritmética, suma infinita, serie geométrica convergente, suma de Gauss, sucesiones, identificar sucesión, interés compuesto progresión, ejercicios de progresiones, secundaria, preparatoria, educación media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Progresiones aritméticas y geométricas: calcula, identifica y practica',
    description:
      'Deslizadores para ver cómo se comportan los términos, término general y suma paso a paso, identificador de sucesiones y 12 casos numerados con corrección automática.',
    url: 'https://meskeia.com/simulador-progresiones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Simulador de progresiones aritméticas y geométricas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Progresiones aritméticas y geométricas: término general y suma',
    description:
      'Término general, suma de n términos, suma infinita, identificador de sucesiones y 12 casos numerados para practicar.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Simulador de Progresiones meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Progresiones Aritméticas y Geométricas',
  description:
    'Simulador interactivo de progresiones: muestra los primeros términos, el término general con los números sustituidos y la suma de n términos de una progresión aritmética o geométrica, calcula la suma infinita cuando la razón cumple |r| < 1, identifica si una sucesión escrita a mano es aritmética, geométrica o ninguna de las dos, y ofrece 12 casos numerados con corrección automática y ejercicios aleatorios ilimitados.',
  url: 'https://meskeia.com/simulador-progresiones/',
  category: 'EducationalApplication',
  features: [
    'Deslizadores para el primer término y para la diferencia o la razón, con valores negativos',
    'Término general escrito con los números sustituidos, en su forma de definición y simplificada',
    'Suma de los n primeros términos paso a paso, con el caso r = 1 tratado aparte',
    'Suma infinita de una serie geométrica cuando |r| < 1, con la explicación de por qué converge',
    'Identificador de sucesiones: dice si es aritmética, geométrica o ninguna, con las restas y divisiones',
    'Gráfica que contrasta el crecimiento lineal de la aritmética con la curva de la geométrica',
    '12 casos numerados fijos, iguales para todo el mundo, con corrección automática',
    'Generador de ejercicios aleatorios ilimitados con solución explicada',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la fórmula del término general de una progresión aritmética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El término general de una progresión aritmética es aₙ = a₁ + (n − 1)·d, donde a₁ es el primer término y d la diferencia que se suma para pasar de un término al siguiente. El factor es n − 1 y no n porque del primer término al término n se dan n − 1 saltos: en la progresión que empieza en 4 con diferencia 7, el término 20 vale 4 + 19·7 = 137. Con esa expresión se llega a cualquier término sin escribir los anteriores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se diferencia una progresión aritmética de una geométrica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una aritmética se pasa de cada término al siguiente sumando siempre la misma cantidad, la diferencia d; en una geométrica se pasa multiplicando siempre por la misma cantidad, la razón r. Para distinguirlas se restan los términos consecutivos: si todas las restas coinciden es aritmética. Si no, se dividen: si todas las divisiones coinciden es geométrica. Al dibujarlas, la aritmética da puntos alineados y la geométrica una curva que se dispara o se aplasta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la suma de los términos de una progresión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una progresión aritmética la suma de los n primeros términos es Sₙ = n·(a₁ + aₙ)/2, que sale de emparejar el primer término con el último, el segundo con el penúltimo y así sucesivamente: todas las parejas suman lo mismo. Sumar del 1 al 100 da 100·101/2 = 5.050. En una geométrica la fórmula es Sₙ = a₁·(rⁿ − 1)/(r − 1), donde el exponente sí es n y no n − 1.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo tiene suma una progresión geométrica de infinitos términos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Solo cuando el valor absoluto de la razón es menor que 1, es decir |r| < 1. En ese caso los términos se van haciendo cada vez más pequeños y las sumas parciales se acercan a un valor concreto: S = a₁/(1 − r). Una pelota cuyo primer rebote sube 1,8 metros y que en cada rebote alcanza el 60 % de la altura anterior suma 1,8/(1 − 0,6) = 4,5 metros de subida. Si |r| ≥ 1 la serie diverge y no existe ninguna suma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué no se puede usar la fórmula de la suma geométrica cuando la razón vale 1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque el denominador de Sₙ = a₁·(rⁿ − 1)/(r − 1) sería r − 1 = 0, y no se puede dividir entre cero. Con razón 1 todos los términos son iguales al primero, así que la suma se calcula directamente como n·a₁. No es un caso raro de laboratorio: aparece siempre que una magnitud crece un 0 % por periodo, y es uno de los errores que más se repiten en los exámenes.',
      },
    },
  ],
};

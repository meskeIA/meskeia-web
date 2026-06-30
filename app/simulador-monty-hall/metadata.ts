import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Problema de Monty Hall — Probabilidad Interactiva | meskeIA',
  description: 'Simula el Problema de Monty Hall y descubre por qué cambiar de puerta gana 2 de cada 3 veces. El premio es un coche (carro o auto) y detrás de las otras puertas hay cabras. Modo manual y automático con hasta 10.000 partidas.',
  keywords: 'problema de Monty Hall, probabilidad condicional, simulador Monty Hall, cambiar de puerta, paradoja Monty Hall, estadística, probabilidad, Bayes, tres puertas, coche o cabra, carro o cabra, auto o cabra, Bachillerato, divulgación matemática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-monty-hall/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Problema de Monty Hall | meskeIA',
    description: 'Elige puerta, Monty revela una cabra. ¿Cambias? Descubre por qué cambiar gana 2/3 de las veces con este simulador interactivo.',
    url: 'https://meskeia.com/simulador-monty-hall/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Problema de Monty Hall | meskeIA',
    description: 'Prueba en vivo el Problema de Monty Hall y comprueba por qué la probabilidad de ganar cambiando es el doble que quedándote.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Problema de Monty Hall',
  description: 'Simulador interactivo del Problema de Monty Hall con modo manual (jugadas individuales) y modo automático (hasta 10.000 simulaciones). Visualiza en tiempo real por qué cambiar de puerta ofrece una probabilidad de 2/3 frente al 1/3 de no cambiar, y aprende probabilidad condicional de forma intuitiva.',
  url: 'https://meskeia.com/simulador-monty-hall/',
  category: 'EducationalApplication',
  features: [
    'Modo manual: elige puerta, Monty revela una cabra, decide si cambias',
    'Modo automático: hasta 10.000 simulaciones con slider',
    'Barras CSS animadas comparando "Cambia siempre" vs "No cambia"',
    'Contador de racha de victorias y derrotas en la sesión',
    'Bloque educativo completo sobre probabilidad condicional',
    'Ideal para secundaria, preparatoria, Bachillerato y divulgación',
  ],
  keywords: [
    'Monty Hall',
    'probabilidad condicional',
    'paradoja Monty Hall',
    'simulador probabilidad',
    'estadística interactiva',
    'Bachillerato matemáticas',
    'divulgación matemática',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿En qué consiste el Problema de Monty Hall?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Problema de Monty Hall es un clásico de probabilidad condicional. Un concursante elige una de tres puertas: detrás de una hay un coche (también llamado carro o auto en Latinoamérica) y detrás de las otras dos hay cabras. El presentador (que sabe dónde está el coche) abre una de las puertas no elegidas revelando una cabra y ofrece cambiar de puerta. La pregunta es: ¿conviene cambiar? La respuesta contraintuitiva es que cambiar dobla la probabilidad de ganar, pasando de 1/3 a 2/3.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué cambiar de puerta aumenta la probabilidad al doble?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al elegir la primera puerta, la probabilidad de haber acertado es 1/3. Eso significa que con probabilidad 2/3 el coche está en las otras dos puertas. Cuando Monty elimina una cabra, esa probabilidad de 2/3 se concentra en la única puerta restante que no elegiste. Por eso cambiar gana el 66,7 % de las veces y quedarse solo el 33,3 %. Es un resultado correcto aunque sorprenda a la intuición.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas simulaciones se necesitan para verificar el resultado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con 100 simulaciones ya se aprecia la tendencia (la estrategia "cambia siempre" ronda el 60-70 % de victorias). Con 1.000 simulaciones el resultado converge visiblemente al 2/3 teórico. Con 10.000 simulaciones (el máximo de este simulador) la diferencia entre ambas estrategias es estadísticamente contundente y el error relativo cae por debajo del 2 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tiene alguna relación el Problema de Monty Hall con el teorema de Bayes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El Problema de Monty Hall es un ejemplo directo de probabilidad condicional y puede resolverse formalmente con el teorema de Bayes: la probabilidad de que el coche esté en la puerta alternativa actualiza a 2/3 una vez que el presentador ha abierto una cabra. Es uno de los ejemplos más citados en cursos de estadística y probabilidad para ilustrar cómo nueva información (la acción del presentador) modifica las probabilidades previas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es realmente una paradoja o solo parece contraintuitivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es contraintuitivo pero no es una paradoja lógica: tiene una respuesta matemáticamente inequívoca. La confusión surge porque la mayoría de personas asume erróneamente que las dos puertas restantes tienen probabilidades iguales (50/50), ignorando que Monty actúa con información. Miles de simulaciones y la demostración formal de Bayes confirman que cambiar de puerta es la estrategia óptima. Hasta matemáticos y académicos contestaron incorrectamente cuando Marilyn vos Savant publicó el problema en 1990.',
      },
    },
  ],
};

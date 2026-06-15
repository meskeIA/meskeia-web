import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora SWOLF — Eficiencia en Natación | meskeIA',
  description:
    'Calcula tu índice SWOLF para medir la eficiencia en el agua. Combina tiempo y brazadas por largo para mejorar tu técnica de natación. Compatible con piscinas de 25m y 50m.',
  keywords: 'SWOLF natación, eficiencia natación, índice SWOLF, brazadas por largo, técnica natación, velocidad natación, calculadora natación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora SWOLF — Eficiencia en Natación',
    description:
      'Mide tu eficiencia en el agua combinando tiempo y brazadas por largo. Obtén tu nivel (élite, avanzado, intermedio, principiante) y consejos de mejora.',
    url: 'https://meskeia.com/calculadora-swolf-natacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora SWOLF — Eficiencia en Natación | meskeIA',
    description:
      'Calcula tu índice SWOLF y descubre tu nivel de eficiencia en natación. Compatible con piscinas de 25m y 50m.',
  },
  other: {
    'application-name': 'Calculadora SWOLF Natación meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Calculadora SWOLF — Eficiencia en Natación',
  description:
    'Calculadora del índice SWOLF para medir la eficiencia técnica en natación. Combina el tiempo por largo y las brazadas para obtener una puntuación de eficiencia con clasificación por nivel y consejos de mejora.',
  url: 'https://meskeia.com/calculadora-swolf-natacion/',
  category: 'UtilityApplication',
  features: [
    'Índice SWOLF de eficiencia en natación',
    'Clasificación por nivel: élite, avanzado, intermedio y principiante',
    'Velocidad media en min/100m',
    'Consejos de mejora técnica personalizados según el nivel',
    'Compatible con piscinas de 25m y 50m',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el índice SWOLF en natación y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SWOLF es un índice de eficiencia en natación que combina el tiempo en segundos por largo y el número de brazadas necesarias para recorrerlo. Se calcula sumando ambos valores: SWOLF = segundos por largo + brazadas por largo. Un SWOLF más bajo indica mayor eficiencia técnica. Por ejemplo, completar un largo de 25 m en 30 segundos con 20 brazadas da un SWOLF de 50.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué valores de SWOLF se consideran buenos para un nadador aficionado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En piscina de 25 m, valores SWOLF por debajo de 35 son propios de nadadores élite, entre 35 y 45 corresponden a nivel avanzado, entre 45 y 60 a nivel intermedio y por encima de 60 a principiante. En piscina de 50 m los valores son más altos por la mayor distancia. Lo importante es la tendencia: un SWOLF que baja con el tiempo indica mejora técnica real, independientemente del valor absoluto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el SWOLF de otras métricas de natación como las SPL o el ritmo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las SPL (strokes per length, brazadas por largo) miden solo la eficiencia del movimiento sin tener en cuenta la velocidad. El ritmo (min/100m) mide solo la velocidad sin considerar la técnica. El SWOLF combina ambas dimensiones: penaliza tanto nadar muy despacio como usar demasiadas brazadas. Por eso es útil para detectar si una mejora de velocidad se logra a costa de un aumento de brazadas, lo que puede indicar técnica deficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de nadador es útil calcular el SWOLF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SWOLF es especialmente útil para nadadores aficionados y triatletas que quieren mejorar su técnica sin entrenador. Permite hacer un seguimiento objetivo de la eficiencia sesión a sesión sin equipamiento especial, solo con un cronómetro y contando brazadas. También es valioso para nadadores que ya tienen buena resistencia cardiovascular pero quieren optimizar el deslizamiento y reducir el coste energético por metro recorrido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo mejorar mi índice SWOLF en natación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para mejorar el SWOLF hay que trabajar en dos frentes: aumentar el deslizamiento por brazada (mayor longitud de brazada) y reducir la resistencia frontal. Ejercicios como el "catch-up" o la natación con aletas largas ayudan a alargar la brazada. Nadar más despacio de forma consciente contando brazadas también entrena la conciencia propioceptiva. Con el tiempo, el objetivo es mantener el mismo tiempo por largo con menos brazadas.',
      },
    },
  ],
};

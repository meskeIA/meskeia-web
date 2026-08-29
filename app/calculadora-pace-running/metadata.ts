import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Pace de Running | meskeIA',
  description: 'Calcula tu ritmo por kilómetro, velocidad media y proyecciones para 5K, 10K, media maratón y maratón. Tabla de splits por km incluida.',
  keywords: 'calculadora pace running, ritmo por kilómetro, pace min/km, velocidad media corredor, splits carrera, proyección maratón, calculadora running, ritmo carrera',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Pace de Running',
    description: 'Obtén tu pace (min/km), velocidad media, splits y proyecciones para 5K, 10K, media maratón y maratón.',
    url: 'https://meskeia.com/calculadora-pace-running/',
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
    title: 'Calculadora de Pace de Running',
    description: 'Ritmo, velocidad, splits y proyecciones de carrera en una sola herramienta.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Pace de Running meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Pace de Running',
  description: 'Calculadora de pace de running. Introduce distancia y tiempo para obtener tu ritmo por kilómetro, velocidad media, tabla de splits por km y proyecciones de tiempo estimado para 5K, 10K, media maratón y maratón.',
  url: 'https://meskeia.com/calculadora-pace-running/',
  category: 'UtilityApplication',
  features: [
    'Cálculo de pace (ritmo) por kilómetro en formato min:seg',
    'Velocidad media en km/h',
    'Tabla de splits con tiempo acumulado por kilómetro',
    'Proyecciones para 5K, 10K, media maratón y maratón',
    'Entrada de tiempo en horas, minutos y segundos',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el pace en running y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pace o ritmo es el tiempo que tarda un corredor en recorrer un kilómetro, expresado en minutos y segundos por kilómetro (min/km). Se calcula dividiendo el tiempo total de carrera entre la distancia recorrida. Por ejemplo, terminar 10 km en 50 minutos equivale a un pace de 5:00 min/km. Es la métrica más usada en running porque permite comparar esfuerzos entre distancias distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es un buen pace para correr 10 km o una maratón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para un corredor popular, un pace de 5:00–6:30 min/km en 10 km se considera un buen resultado. En maratón, completar la distancia en menos de 4 horas (pace ~5:41 min/km) es el objetivo habitual de aficionados. Los corredores élite masculinos bajan de 3:00 min/km en maratón. El "buen pace" depende siempre del nivel individual, la edad, el terreno y las condiciones climáticas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven los splits en una carrera de running?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los splits son los tiempos parciales por kilómetro o por tramo de distancia. Sirven para controlar si se mantiene un ritmo constante (negative split: segunda mitad más rápida que la primera), si se sale demasiado rápido o si se reduce el ritmo al final de la carrera. Planificar los splits antes de una competición ayuda a distribuir el esfuerzo de forma eficiente y mejorar el tiempo final.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre pace y velocidad media en running?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pace (min/km) indica cuánto tiempo se tarda en recorrer una distancia fija, mientras que la velocidad media (km/h) indica cuánta distancia se recorre en un tiempo fijo. Ambas métricas son inversas: un pace de 5:00 min/km equivale a 12 km/h. Los corredores suelen usar pace porque es más intuitivo para planificar ritmos de carrera, mientras que la velocidad en km/h es más común en ciclismo o en comparativas con otros deportes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo usar el pace calculado para proyectar mi tiempo en una maratón o medio maratón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una vez conoces tu pace actual, puedes multiplicarlo por la distancia objetivo: la maratón mide 42,195 km y la media maratón 21,097 km. Si entrenas a 5:30 min/km, la proyección para maratón es aproximadamente 3h52min. La calculadora realiza estas proyecciones automáticamente para las distancias más habituales (5K, 10K, 21K y 42K). Ten en cuenta que el rendimiento real puede variar por fatiga acumulada en distancias largas.',
      },
    },
  ],
};

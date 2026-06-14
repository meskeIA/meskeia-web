import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Figuras Retóricas - Identifica Metáfora, Hipérbole, Símil y más | meskeIA',
  description: 'Aprende a identificar las figuras retóricas con este quiz interactivo. 27 figuras (básico, bachillerato, selectividad): metáfora, hipérbole, anáfora, oxímoron y mucho más. Sin registro.',
  keywords: 'figuras retóricas, quiz figuras retóricas, metáfora hipérbole símil, recursos literarios, lengua española, selectividad lengua, bachillerato lengua, figuras literarias ejercicios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Figuras Retóricas | meskeIA',
    description: 'Identifica metáforas, hipérboles, anáforas y 24 figuras más. Quiz interactivo con ejemplos y explicaciones. Para ESO, Bachillerato y Selectividad.',
    url: 'https://meskeia.com/quiz-figuras-retoricas/',
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
    title: 'Quiz Figuras Retóricas | meskeIA',
    description: 'Aprende a identificar figuras retóricas: 27 figuras, 3 niveles, ejemplos reales. Sin publicidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Quiz Figuras Retóricas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Figuras Retóricas",
  description: "Aprende a identificar las figuras retóricas con este quiz interactivo. 27 figuras (básico, bachillerato, selectividad): metáfora, hipérbole, anáfora, oxímoron y mucho más. Sin registro.",
  url: "https://meskeia.com/quiz-figuras-retoricas/",
  category: 'EducationalApplication',
  features: [
    '27 figuras retóricas con definición, distinción y ejemplos canónicos',
    '4 niveles: básico (ESO), intermedio (Bachillerato), avanzado (Selectividad) y todas',
    'Feedback educativo con definición y ejemplo correctos tras cada respuesta',
    'Historial de errores con revisión al final del quiz',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las figuras retóricas y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las figuras retóricas son recursos del lenguaje que alteran el uso habitual de las palabras para conseguir un efecto expresivo o estético. Se usan en literatura, publicidad y discursos para hacer el mensaje más vívido, persuasivo o memorable. Hay más de 60 figuras catalogadas, aunque en la práctica escolar se trabajan unas 20-30.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las figuras retóricas más importantes para Selectividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las figuras más frecuentes en los exámenes de Selectividad (EBAU/EvAU) son: metáfora, símil o comparación, hipérbole, personificación, anáfora, antítesis, oxímoron, metonimia, sinestesia y encabalgamiento. El quiz cubre estas y otras 17 más, organizadas por nivel de dificultad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia una metáfora de un símil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El símil (o comparación) establece una semejanza usando nexos explícitos como "como", "igual que" o "parece": "Sus ojos son como el mar". La metáfora elimina ese nexo e identifica directamente los dos términos: "Sus ojos son el mar". Ambas relacionan dos realidades distintas, pero la metáfora lo hace de forma más directa e implícita.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A partir de qué curso se estudian las figuras retóricas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las figuras básicas (comparación, metáfora, hipérbole, personificación) se introducen habitualmente en 2.º y 3.º de la ESO (12-14 años). En Bachillerato se amplía el repertorio con figuras más complejas como la sinestesia, el oxímoron o el quiasmo, que son las que suelen aparecer en Selectividad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas preguntas tiene el quiz y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz presenta ejemplos reales de textos literarios y el usuario debe identificar qué figura retórica contiene, eligiendo entre varias opciones. Cubre 27 figuras distintas distribuidas en tres niveles (básico, Bachillerato y Selectividad). Al finalizar cada pregunta se muestra la explicación de la figura, sin necesidad de registro ni instalación.',
      },
    },
  ],
};

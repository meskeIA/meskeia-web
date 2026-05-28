import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Entrenador Tablas de Multiplicar - Juego Educativo para Niños | meskeIA',
  description: 'Aprende las tablas de multiplicar jugando. Juego educativo gratuito con niveles, puntuación, rachas y medallas. Para niños de primaria. Sin registro.',
  keywords: 'tablas multiplicar, aprender multiplicar, juego matematicas, educativo niños, primaria, multiplicaciones, practicar tablas, juego gratis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Entrenador Tablas de Multiplicar | meskeIA',
    description: 'Aprende las tablas de multiplicar con este juego educativo. Niveles, puntos y medallas.',
    url: 'https://meskeia.com/tablas-multiplicar/',
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
    title: 'Entrenador Tablas de Multiplicar | meskeIA',
    description: 'Juego educativo para aprender las tablas de multiplicar.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Entrenador Tablas Multiplicar",
  description: "Aprende las tablas de multiplicar jugando. Juego educativo gratuito con niveles, puntuación, rachas y medallas. Para niños de primaria. Sin registro.",
  url: "https://meskeia.com/tablas-multiplicar/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas tablas de multiplicar hay que aprender?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tablas de multiplicar estándar van del 1 al 10 (o del 1 al 12 en algunos países). Aunque técnicamente hay infinitas multiplicaciones posibles, dominar las combinaciones del 1 al 10 cubre la gran mayoría de cálculos de la vida cotidiana y de la educación primaria. En total son 100 combinaciones únicas si contamos del 1×1 al 10×10.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué edad se aprenden las tablas de multiplicar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los niños suelen empezar a aprender las tablas de multiplicar entre los 7 y 9 años, generalmente en 2.º y 3.º de primaria. La tabla del 2 y del 5 son las primeras porque siguen patrones muy reconocibles. Se recomienda practicar unos 10-15 minutos al día para conseguir automatización en pocas semanas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el truco para aprender las tablas de multiplicar más rápido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los trucos más efectivos combinan repetición espaciada y juego: empezar por las más fáciles (×1, ×2, ×5, ×10), usar ritmos o canciones, y practicar con ejercicios cronometrados. La práctica diaria corta (10 min) supera a sesiones largas y esporádicas. Los juegos con puntuación y rachas añaden motivación extrínseca que acelera la memorización.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve saber las tablas de multiplicar de memoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer las tablas de multiplicar de forma automática libera memoria de trabajo para resolver problemas más complejos: fracciones, divisiones, porcentajes, álgebra y geometría. Los estudios muestran que los alumnos que no las dominan tardan más en operaciones derivadas porque deben calcular paso a paso lo que debería ser inmediato.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre practicar tablas con papel y con un juego digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambos métodos son válidos, pero los juegos digitales ofrecen corrección instantánea, estadísticas de progreso y elementos motivadores como puntuación, rachas y medallas que mantienen el interés. El papel es más sencillo y sin distracciones. Lo ideal es combinar ambos: fichas escritas para afianzar la grafía y juegos digitales para practicar la velocidad de respuesta.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Ritmo Vital - ¿Vives en modo urgencia permanente? | meskeIA',
  description: 'Descubre si vives acelerado o si has encontrado un ritmo vital sostenible. Test de 10 preguntas sobre urgencia y presencia. Basado en el concepto kletskassa y cronobiología. Gratuito.',
  keywords: 'ritmo vital, urgencia permanente, slow life, kletskassa, cronobiología, estrés velocidad, presencia, mindfulness, desacelerar, ritmo de vida',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Ritmo Vital | meskeIA',
    description: '¿Vives en modo urgencia permanente? Test interactivo sobre tu ritmo de vida.',
    url: 'https://meskeia.com/test-ritmo-vital/',
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
    title: 'Test de Ritmo Vital | meskeIA',
    description: '¿Tu ritmo de vida es sostenible? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test de Ritmo Vital meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Ritmo Vital',
  description: 'Herramienta interactiva de reflexión para evaluar si tu ritmo de vida es sostenible o si vives en modo urgencia permanente. Basado en el concepto kletskassa y cronobiología.',
  url: 'https://meskeia.com/test-ritmo-vital/',
  features: [
    'Test de 10 preguntas sobre tu ritmo de vida',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el concepto kletskassa y cronobiología',
    'Acciones concretas según tu resultado',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ritmo vital y por qué importa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ritmo vital es la velocidad a la que vivimos y tomamos decisiones en el día a día, incluyendo trabajo, descanso, relaciones y tiempo libre. Cuando ese ritmo está descompasado con nuestros ciclos biológicos y necesidades reales, aumenta el estrés crónico, disminuye la atención sostenida y se deteriora la calidad del sueño. La cronobiología estudia cómo los ritmos circadianos influyen directamente en el rendimiento y el bienestar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el modo urgencia permanente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modo urgencia permanente es un estado de activación crónica en el que todo parece urgente e importante al mismo tiempo. Se caracteriza por dificultad para desconectar, sensación de que "nunca hay suficiente tiempo" y tendencia a interrumpir tareas antes de completarlas. Aunque a corto plazo aumenta la productividad percibida, a medio plazo deteriora la toma de decisiones y la capacidad de concentración profunda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona este test de ritmo vital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test consta de 10 preguntas sobre hábitos cotidianos relacionados con la velocidad, la presencia y la gestión del tiempo. Cada respuesta se sitúa en dos dimensiones: nivel de urgencia percibida y capacidad de presencia. El resultado se presenta como un mapa visual con tu perfil de ritmo y sugerencias concretas para ajustarlo si es necesario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para personas que sienten que el día "se les escapa", que tienen dificultad para desconectar fuera del trabajo, que duermen mal pese al cansancio, o que llevan tiempo con la sensación de correr sin avanzar. También es relevante para quienes quieren evaluar si su estilo de vida actual es sostenible a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la kletskassa y qué relación tiene con el ritmo vital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La kletskassa es un concepto neerlandés que describe la caja registradora lenta de un supermercado, pensada para que las personas mayores puedan hacer sus compras sin prisas y con conversación. Se ha adoptado como símbolo cultural de recuperar espacios de tiempo no productivo. En este test se utiliza como referencia de un ritmo vital deliberadamente más pausado y consciente, en contraposición a la aceleración crónica.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Modelo de Negocio - ¿Los pilares de tu negocio están equilibrados? | meskeIA',
  description: 'Descubre si tu modelo de negocio está equilibrado. Test de 10 preguntas basado en el Business Model Canvas simplificado. Evalúa propuesta de valor y sostenibilidad. Gratuito y sin registro.',
  keywords: 'modelo de negocio, Business Model Canvas, diagnóstico negocio, propuesta de valor, sostenibilidad, emprendimiento, negocio viable, ingresos, cliente, estrategia negocio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Modelo de Negocio | meskeIA',
    description: '¿Tu modelo de negocio está equilibrado? Test basado en el Business Model Canvas.',
    url: 'https://meskeia.com/diagnostico-modelo-negocio/',
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
    title: 'Diagnóstico de Modelo de Negocio | meskeIA',
    description: '¿Los pilares de tu negocio están equilibrados? Descúbrelo gratis.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico de Modelo de Negocio meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Modelo de Negocio',
  description: 'Herramienta interactiva de reflexión para evaluar si tu modelo de negocio está equilibrado. Basado en el Business Model Canvas simplificado de Osterwalder.',
  url: 'https://meskeia.com/diagnostico-modelo-negocio/',
  features: [
    'Test de 10 preguntas sobre propuesta y sostenibilidad',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el Business Model Canvas',
    'Acciones concretas según tu resultado',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un modelo de negocio y cuáles son sus pilares fundamentales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un modelo de negocio describe cómo una organización crea, entrega y captura valor. Sus pilares fundamentales incluyen la propuesta de valor (qué problema resuelve y para quién), los canales de distribución, las fuentes de ingresos, la estructura de costes y los recursos y actividades clave. Cuando alguno de estos pilares está débil o desalineado, el negocio tiende a ser inestable o insostenible a medio plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste el Business Model Canvas y cómo se aplica a pequeños negocios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Business Model Canvas, desarrollado por Alexander Osterwalder, es una herramienta visual que organiza los 9 bloques esenciales de cualquier negocio en un único lienzo. Para pequeños negocios y autónomos es especialmente útil porque permite ver de un vistazo si hay coherencia entre propuesta de valor, clientes objetivo e ingresos, sin necesidad de elaborar un plan de negocio extenso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi modelo de negocio está desequilibrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Señales de desequilibrio habituales son: ingresos irregulares o dependientes de pocos clientes, dificultad para explicar claramente qué ofreces y a quién, costes que crecen más rápido que los ingresos, o clientes que no repiten ni recomiendan. Un diagnóstico estructurado de 10 preguntas te ayuda a identificar cuáles de los pilares están más débiles y priorizar acciones concretas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de negocios es útil este diagnóstico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para emprendedores en fase de validación que quieren comprobar si su idea tiene coherencia interna, para autónomos y freelances que sienten que trabajan mucho pero ganan poco, y para negocios ya en marcha que están en un punto de inflexión o quieren identificar por qué sus resultados no mejoran pese a la actividad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre propuesta de valor y modelo de negocio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La propuesta de valor es solo uno de los componentes del modelo de negocio: describe el beneficio concreto que recibes al elegir un producto o servicio frente a las alternativas. El modelo de negocio es el sistema completo que explica cómo se genera, distribuye y monetiza ese valor. Una propuesta de valor sólida con un modelo de distribución o precios inadecuado sigue siendo un negocio débil.',
      },
    },
  ],
};

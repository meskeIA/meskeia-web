import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Evaluador de Prompts - ¿Tus instrucciones a la IA son específicas o vagas? | meskeIA',
  description: 'Evalúa si sabes dar instrucciones claras a la IA y si aprovechas el resultado de forma crítica. Test de 10 preguntas sobre prompt engineering y uso efectivo de IA. Gratuito y sin registro.',
  keywords: 'evaluador prompts, prompt engineering, instrucciones IA, ChatGPT prompts, cómo hablar con IA, prompts efectivos, calidad prompts, iteración prompts, contexto IA',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Evaluador de Prompts | meskeIA',
    description: '¿Tus instrucciones a la IA son específicas o vagas? Test interactivo con diagnóstico visual.',
    url: 'https://meskeia.com/evaluador-prompts/',
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
    title: 'Evaluador de Prompts | meskeIA',
    description: '¿Sabes dar buenas instrucciones a la IA? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Evaluador de Prompts meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Evaluador de Prompts',
  description: 'Herramienta interactiva de reflexión sobre prompt engineering. 10 preguntas para evaluar la claridad de tus instrucciones a la IA y cómo procesas sus respuestas. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/evaluador-prompts/',
  features: [
    'Test de 10 preguntas sobre cómo interactúas con la IA',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa claridad de instrucciones y procesamiento de respuestas',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar tu prompt engineering',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el prompt engineering y por qué importa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El prompt engineering es la práctica de formular instrucciones claras y estructuradas para obtener respuestas útiles de una inteligencia artificial. Un prompt bien construido incluye contexto, rol, formato esperado y restricciones relevantes. Sin esta habilidad, se obtienen respuestas genéricas o incorrectas incluso de los modelos más avanzados. Es la competencia más transferible del trabajo con IA porque sirve para ChatGPT, Claude, Gemini y cualquier modelo futuro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si mis prompts son buenos o malos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un prompt es bueno cuando la respuesta de la IA requiere pocas o ninguna corrección adicional. Las señales de un prompt débil incluyen: tener que pedir aclaraciones múltiples, recibir respuestas demasiado largas o irrelevantes, o que la IA asuma un tono o formato que no necesitabas. Este evaluador mide dos dimensiones clave: la especificidad de tus instrucciones y cómo procesas críticamente las respuestas que recibes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que use herramientas de IA en su trabajo diario: redactores, desarrolladores, analistas, profesores, consultores o emprendedores. También sirve a quienes están empezando con la IA y quieren saber en qué punto están. No requiere conocimientos técnicos previos; las preguntas evalúan comportamientos concretos, no terminología.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este evaluador de un curso de prompts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un curso enseña técnicas; este evaluador diagnostica tu práctica actual. En 10 preguntas identifica si tu problema está en cómo formulas las instrucciones, en cómo evalúas críticamente las respuestas, o en ambos. El diagnóstico termina con un perfil específico y acciones concretas priorizadas, no con contenido genérico. Es un punto de partida para saber dónde enfocar el aprendizaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo lleva completar el test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre 5 y 8 minutos. Son 10 preguntas de opción múltiple que reflejan situaciones reales de trabajo con IA. Al terminar recibes inmediatamente un diagnóstico visual con tu posición en un mapa bidimensional, tu perfil y recomendaciones específicas. No requiere registro ni guardar datos.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Multitarea - ¿Tu multitarea es productiva o destructiva? | meskeIA',
  description: 'Descubre si tu forma de hacer multitarea te ayuda o te perjudica. Test de 10 preguntas sobre fragmentación y foco. Basado en investigación sobre context-switching. Gratuito y sin registro.',
  keywords: 'multitarea, context switching, fragmentación atención, foco, concentración, productividad, deep work, atención dividida, cambio de contexto, multitasking',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Multitarea | meskeIA',
    description: '¿Tu multitarea es productiva o destructiva? Test interactivo sobre context-switching.',
    url: 'https://meskeia.com/diagnostico-multitarea/',
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
    title: 'Diagnóstico de Multitarea | meskeIA',
    description: '¿La multitarea te ayuda o te perjudica? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico de Multitarea meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Multitarea',
  description: 'Herramienta interactiva de reflexión para evaluar si tu multitarea es productiva o destructiva. Basado en investigación sobre context-switching y atención dividida.',
  url: 'https://meskeia.com/diagnostico-multitarea/',
  features: [
    'Test de 10 preguntas sobre fragmentación y foco',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en investigación sobre context-switching',
    'Acciones concretas según tu resultado',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿La multitarea realmente reduce la productividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según la investigación sobre context-switching, cambiar de tarea con frecuencia tiene un coste cognitivo real: cada transición genera un período de reorientación que puede ocupar entre 15 y 25 minutos antes de recuperar plena concentración. Esto no significa que toda multitarea sea negativa; el impacto depende del tipo de tareas y de tu perfil de atención.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre multitarea productiva y multitarea destructiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La multitarea productiva combina tareas de distinto tipo cognitivo —por ejemplo, escuchar un podcast mientras caminas— sin que ninguna requiera atención profunda. La multitarea destructiva alterna tareas que compiten por el mismo tipo de procesamiento mental, como redactar un informe mientras respondes mensajes, lo que fragmenta la atención y genera más errores y más tiempo total invertido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona este test de diagnóstico de multitarea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test consta de 10 preguntas sobre tus hábitos de trabajo, frecuencia de interrupciones y capacidad de recuperar el foco. Al finalizar obtienes un diagnóstico visual que sitúa tu perfil en un mapa de fragmentación-foco, junto con acciones específicas para reducir el coste cognitivo de la multitarea en tu contexto concreto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es especialmente útil este diagnóstico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para trabajadores del conocimiento que perciben que terminan el día con mucha actividad pero poca sensación de avance, para equipos con alta carga de notificaciones y reuniones, y para cualquier persona que quiera entender si su forma de organizar las tareas le ayuda o le resta energía y rendimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el context-switching y por qué importa en el trabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El context-switching es el proceso de interrumpir una tarea para iniciar otra diferente. Cada cambio activa un mecanismo de inhibición y reactivación en el cerebro que consume recursos cognitivos. En entornos de trabajo con muchas interrupciones, el coste acumulado del context-switching puede equivaler a perder varias horas de concentración efectiva al día.',
      },
    },
  ],
};

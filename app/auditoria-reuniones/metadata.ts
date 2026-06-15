import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Auditoría de Reuniones - ¿Cuántas podrían ser un email? | meskeIA',
  description: 'Evalúa si tus reuniones aportan valor o te roban tiempo. Test interactivo de 10 preguntas sobre eficiencia y cultura de reuniones. Diagnóstico visual con perfil y acciones. Gratuito y sin registro.',
  keywords: 'auditoría reuniones, reuniones productivas, reunionitis, eficiencia reuniones, gestión del tiempo, podría ser un email, cultura reuniones, productividad laboral',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Auditoría de Reuniones | meskeIA',
    description: '¿Cuántas de tus reuniones podrían ser un email? Test interactivo con diagnóstico visual y acciones concretas.',
    url: 'https://meskeia.com/auditoria-reuniones/',
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
    title: 'Auditoría de Reuniones | meskeIA',
    description: '¿Tus reuniones aportan valor o te roban tiempo? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Auditoría de Reuniones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Auditoría de Reuniones',
  description: 'Herramienta interactiva de reflexión para evaluar la eficiencia y la cultura de reuniones en tu organización. 10 preguntas, diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/auditoria-reuniones/',
  features: [
    'Test de 10 preguntas sobre tus reuniones de trabajo',
    'Diagnóstico visual con mapa bidimensional',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar tus reuniones',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sé si mis reuniones son productivas o una pérdida de tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una reunión es productiva cuando tiene un objetivo claro, los participantes adecuados y genera decisiones o acciones concretas. Si termina sin compromisos definidos ni responsables, es probable que hubiera podido resolverse por email o chat. Revisar si el tiempo invertido por todas las personas asistentes supera el valor del resultado obtenido es el criterio más fiable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la "reunionitis" y cómo afecta a la productividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La reunionitis es la tendencia a convocar reuniones de forma excesiva o por defecto, sin evaluar si son necesarias. Reduce el tiempo disponible para trabajo profundo, fragmenta la concentración y genera fatiga cognitiva. Estudios de Microsoft Research indican que el exceso de reuniones es uno de los principales factores de agotamiento laboral en entornos de trabajo híbrido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué información necesito para auditar mis reuniones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No necesitas datos externos. El test evalúa tus propias percepciones sobre aspectos como la frecuencia de reuniones, si tienen orden del día previo, si se toman decisiones, si todos los asistentes son necesarios y si existe cultura de alternativas asíncronas. Con tus respuestas se genera un diagnóstico personalizado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las principales alternativas a las reuniones presenciales o virtuales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las alternativas más eficaces son: emails estructurados con contexto y preguntas concretas, documentos compartidos con comentarios asíncronos, grabaciones de vídeo cortas (loom-style), chats con hilo de decisiones y tableros de gestión de tareas. La clave es elegir el canal según si la comunicación requiere sincronía real o puede esperar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo al día dedica de media un trabajador a reuniones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según datos de Microsoft (2023), los trabajadores del conocimiento pasan entre el 35% y el 50% de su jornada laboral en reuniones, frente al 25% de la década anterior. Los directivos intermedios llegan al 60%. La pandemia aceleró este aumento al normalizar videollamadas para interacciones que antes se resolvían de forma espontánea.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Comunicación Interna - ¿Rápido pero sin profundidad? | meskeIA',
  description: 'Evalúa si tu equipo comunica con velocidad y profundidad o sacrifica una por la otra. Test de 10 preguntas sobre comunicación organizacional. Diagnóstico visual con perfil y acciones. Gratuito y sin registro.',
  keywords: 'comunicación interna, comunicación equipo, velocidad vs profundidad, gestión información, Slack fatigue, documentación equipo, comunicación asincrónica, productividad comunicación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Comunicación Interna | meskeIA',
    description: '¿Tu equipo comunica rápido pero sin profundidad? Test interactivo con diagnóstico visual.',
    url: 'https://meskeia.com/diagnostico-comunicacion-interna/',
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
    title: 'Diagnóstico de Comunicación Interna | meskeIA',
    description: '¿Tu equipo comunica rápido pero sin profundidad? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico de Comunicación Interna meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Comunicación Interna',
  description: 'Herramienta interactiva de reflexión sobre comunicación organizacional. 10 preguntas para evaluar si tu equipo equilibra velocidad y profundidad al comunicar. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/diagnostico-comunicacion-interna/',
  features: [
    'Test de 10 preguntas sobre cómo comunica tu equipo',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa velocidad y profundidad de la comunicación',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar la comunicación interna',
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
      name: '¿Qué problemas causa una mala comunicación interna en un equipo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una comunicación interna deficiente genera duplicidades de trabajo, decisiones tomadas sin información suficiente, conflictos derivados de malentendidos y pérdida de tiempo en reuniones innecesarias. Estudios sobre productividad organizacional estiman que los trabajadores del conocimiento destinan hasta el 20% de su jornada a buscar información que ya existe pero no está disponible de forma clara. La falta de profundidad comunicativa también reduce la confianza y el sentido de pertenencia al equipo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se equilibran la velocidad y la profundidad en la comunicación de un equipo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clave está en elegir el canal adecuado para cada tipo de mensaje. La comunicación asincrónica (documentos, wikis, correo) permite profundidad y registro permanente, mientras que la comunicación sincrónica (reuniones, llamadas, Slack en tiempo real) es útil para decisiones rápidas o contextos emocionales. Los equipos más efectivos combinan ambas: documentan las decisiones importantes y limitan las interrupciones síncronas a lo que realmente las requiere.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de equipos o empresas es útil este diagnóstico de comunicación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier equipo que trabaje de forma colaborativa: equipos remotos o híbridos, startups en crecimiento, departamentos que han escalado rápido y sienten que la información no fluye bien, o managers que notan que las reuniones se multiplican sin resolver los problemas de fondo. El diagnóstico no presupone ningún sector ni tamaño de empresa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre comunicación interna y cultura de equipo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La comunicación interna es el conjunto de prácticas, canales y hábitos que usa un equipo para compartir información. La cultura de equipo es más amplia e incluye valores, normas implícitas y formas de relacionarse. Aunque están relacionadas, son distintas: un equipo puede tener canales de comunicación bien estructurados pero una cultura de silos, o viceversa. Mejorar la comunicación interna es generalmente más rápido y tangible que cambiar la cultura, y puede ser un primer paso hacia ella.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el "Slack fatigue" y cómo afecta a la comunicación de equipo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El "Slack fatigue" o fatiga de mensajería instantánea describe el agotamiento cognitivo que produce recibir y responder mensajes en tiempo real de forma continua durante la jornada laboral. La mensajería instantánea favorece la velocidad pero fragmenta la concentración y puede generar la percepción de que "todo es urgente". Investigaciones sobre flujo de trabajo sugieren que cambiar de contexto frecuentemente puede reducir la productividad efectiva hasta un 40%. Establecer franjas horarias sin notificaciones y usar canales asincrónicos para temas no urgentes son estrategias habituales para mitigarlo.',
      },
    },
  ],
};

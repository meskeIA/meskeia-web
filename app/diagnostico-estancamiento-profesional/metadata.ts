import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Estancamiento Profesional - ¿Estás en zona de confort, estrés o flujo? | meskeIA',
  description: 'Descubre si estás en zona de confort, estrés o flujo profesional. Test interactivo de 10 preguntas basado en el modelo de flujo de Csikszentmihalyi. Gratuito y sin registro.',
  keywords: 'estancamiento profesional, zona de confort, estado de flujo, Csikszentmihalyi, flow, estrés laboral, diagnóstico carrera, desarrollo profesional, motivación trabajo, crecimiento profesional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Estancamiento Profesional | meskeIA',
    description: '¿Estás en zona de confort, estrés o flujo? Test interactivo basado en Csikszentmihalyi.',
    url: 'https://meskeia.com/diagnostico-estancamiento-profesional/',
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
    title: 'Diagnóstico de Estancamiento Profesional | meskeIA',
    description: '¿Estás en zona de confort, estrés o flujo? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico de Estancamiento Profesional meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Estancamiento Profesional',
  description: 'Herramienta interactiva de reflexión para evaluar si estás en zona de confort, estrés o flujo profesional. Basado en el modelo de flujo de Mihaly Csikszentmihalyi. 10 preguntas, resultado visual con perfil y acciones concretas.',
  url: 'https://meskeia.com/diagnostico-estancamiento-profesional/',
  features: [
    'Test de 10 preguntas sobre tu situación profesional actual',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el modelo de flujo de Csikszentmihalyi',
    'Acciones concretas según tu resultado',
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
      name: '¿Qué es el estancamiento profesional y cómo saber si lo estoy viviendo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estancamiento profesional ocurre cuando las exigencias de tu trabajo no crecen al ritmo de tus capacidades, lo que genera aburrimiento, desmotivación o sensación de no avanzar. Señales habituales son realizar tareas que ya dominas por completo, ausencia de retos nuevos y pérdida del entusiasmo inicial. Un test de reflexión estructurado te ayuda a identificar si estás en zona de confort, estrés o flujo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste el modelo de flujo de Csikszentmihalyi aplicado al trabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El psicólogo Mihaly Csikszentmihalyi propuso que el estado de flujo (flow) se alcanza cuando el nivel de desafío de una tarea coincide con el nivel de habilidad de la persona. Si el desafío supera ampliamente la habilidad, surge ansiedad; si la habilidad supera el desafío, aparece el aburrimiento. Aplicado al trabajo, el flujo se asocia con alta productividad, satisfacción y aprendizaje continuo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre zona de confort y estado de flujo en el ámbito laboral?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la zona de confort realizas tareas conocidas sin esfuerzo significativo, lo que es seguro pero limita el crecimiento. El estado de flujo implica un reto equilibrado con tus capacidades actuales, generando concentración profunda y satisfacción. Salir de la zona de confort hacia tareas ligeramente más difíciles es la vía más directa para alcanzar el flujo sin caer en el estrés.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este diagnóstico de estancamiento profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que sienta que su carrera o trabajo actual no la motiva como antes, que se perciba demasiado cómoda o, al contrario, desbordada por la carga. También resulta valioso para quienes están planificando un cambio de rol, un ascenso o una transición profesional y quieren entender su punto de partida emocional y de habilidades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de acciones concretas se obtienen tras el diagnóstico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El diagnóstico devuelve un perfil visual que sitúa tu situación en el mapa desafío-habilidad y sugiere acciones específicas según tu resultado: si estás en zona de confort, propone cómo buscar retos progresivos; si estás en estrés, cómo reducir carga o desarrollar nuevas habilidades; si estás cerca del flujo, cómo mantener y expandir ese estado.',
      },
    },
  ],
};

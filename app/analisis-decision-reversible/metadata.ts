import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Análisis Decisión Reversible vs Irreversible - Puertas tipo 1 y tipo 2 | meskeIA',
  description: 'Descubre si das demasiadas vueltas a decisiones que podrías probar. Test de 10 preguntas basado en el marco de Jeff Bezos (puertas tipo 1 y 2). Gratuito y sin registro.',
  keywords: 'decisión reversible irreversible, puertas tipo 1 tipo 2, Jeff Bezos, parálisis análisis, toma decisiones, decisión rápida, decisión importante, indecisión, framework decisiones, two-way doors',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Análisis Decisión Reversible vs Irreversible | meskeIA',
    description: '¿Das vueltas a decisiones que podrías probar sin riesgo? Test basado en Jeff Bezos.',
    url: 'https://meskeia.com/analisis-decision-reversible/',
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
    title: 'Análisis Decisión Reversible vs Irreversible | meskeIA',
    description: '¿Distingues decisiones tipo 1 de tipo 2? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Análisis Decisión Reversible vs Irreversible meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Análisis Decisión Reversible vs Irreversible',
  description: 'Herramienta interactiva de reflexión para evaluar si distingues bien entre decisiones reversibles e irreversibles. Basado en el marco de Jeff Bezos (puertas tipo 1 y tipo 2).',
  url: 'https://meskeia.com/analisis-decision-reversible/',
  features: [
    'Test de 10 preguntas sobre parálisis y prudencia decisional',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el marco de Jeff Bezos: puertas tipo 1 y tipo 2',
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
      name: '¿Qué diferencia hay entre una decisión reversible y una irreversible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una decisión reversible (puerta de doble sentido o tipo 2) es aquella que se puede deshacer o corregir si no funciona, como probar una nueva metodología de trabajo o cambiar el proveedor de un servicio. Una decisión irreversible (puerta de un solo sentido o tipo 1) tiene consecuencias difíciles o imposibles de revertir, como cerrar un negocio, vender un inmueble o publicar cierto tipo de información. Identificar correctamente el tipo de decisión permite ajustar el tiempo y recursos dedicados al análisis previo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste el marco de Jeff Bezos de puertas tipo 1 y tipo 2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Jeff Bezos describió este marco en las cartas anuales a accionistas de Amazon para explicar cómo Amazon mantiene velocidad en su toma de decisiones. Las decisiones tipo 1 son irreversibles e impactan en toda la organización, por lo que requieren análisis profundo y consenso amplio. Las decisiones tipo 2 son reversibles y de alcance más limitado; tratarlas con el mismo proceso que las tipo 1 genera lentitud innecesaria. El error más frecuente es aplicar el rigor de tipo 1 a decisiones que en realidad son tipo 2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo detectar si estoy sufriendo parálisis por análisis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La parálisis por análisis ocurre cuando dedicamos tiempo y energía desproporcionados a decisiones que en realidad podrían probarse con bajo riesgo. Señales habituales: buscar constantemente más información antes de actuar, aplazar la decisión hasta que "el momento sea perfecto", pedir opinión a muchas personas sin llegar a una conclusión o sentir ansiedad ante opciones que objetivamente tienen marcha atrás. Este test evalúa tu tendencia a la parálisis y te indica si corresponde con el nivel de irreversibilidad real de tus decisiones habituales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es recomendable tomarse más tiempo antes de decidir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dedicar más tiempo es razonable cuando la decisión tiene consecuencias difícilmente reversibles, afecta a otras personas de forma significativa, implica recursos económicos, personales o profesionales importantes, o cuando la información disponible es claramente insuficiente. En cambio, si la decisión es experimentable, de alcance limitado y reversible en pocas semanas o meses, la demora suele costar más (en tiempo y oportunidades perdidas) que el error que se intenta evitar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Este análisis sirve también para decisiones personales, no solo empresariales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Aunque el marco surgió en contexto empresarial, aplica perfectamente a decisiones personales: cambiar de ciudad, iniciar o terminar una relación, cambiar de trabajo, emprender un proyecto creativo o adoptar un nuevo hábito. En todos estos casos, distinguir si la decisión es experimentable o definitiva ayuda a decidir con más claridad y a reducir la ansiedad asociada a la incertidumbre. El test plantea situaciones de ambos contextos para ofrecer un diagnóstico realista.',
      },
    },
  ],
};

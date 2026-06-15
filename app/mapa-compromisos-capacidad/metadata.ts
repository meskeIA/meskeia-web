import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Compromisos vs Capacidad - ¿Has dicho sí a más de lo que puedes? | meskeIA',
  description: 'Descubre si tu carga de compromisos supera tu capacidad real. Test de 10 preguntas sobre sobrecarga y capacidad de gestión. Diagnóstico visual con perfil y acciones. Gratuito y sin registro.',
  keywords: 'compromisos vs capacidad, sobrecarga, decir que no, gestión compromisos, capacidad real, burnout, overcommitment, límites personales, carga de trabajo, planificación realista',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Compromisos vs Capacidad | meskeIA',
    description: '¿Has dicho sí a más de lo que puedes hacer bien? Test interactivo de carga realista.',
    url: 'https://meskeia.com/mapa-compromisos-capacidad/',
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
    title: 'Mapa de Compromisos vs Capacidad | meskeIA',
    description: '¿Tu carga es sostenible? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Mapa de Compromisos vs Capacidad meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Compromisos vs Capacidad',
  description: 'Herramienta interactiva de reflexión para evaluar si tu carga de compromisos es realista respecto a tu capacidad. Análisis de sobrecarga y gestión de límites.',
  url: 'https://meskeia.com/mapa-compromisos-capacidad/',
  features: [
    'Test de 10 preguntas sobre carga y capacidad',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en análisis de carga realista',
    'Acciones concretas según tu resultado',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sé si tengo demasiados compromisos para mi capacidad real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los síntomas más frecuentes son incumplir plazos de forma habitual, sentir que nunca terminas la lista de tareas y necesitar renegociar compromisos con regularidad. Este test evalúa 10 dimensiones de carga y capacidad para darte un diagnóstico visual personalizado que identifica si estás en zona sostenible, en el límite o en sobrecarga.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el overcommitment y por qué ocurre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El overcommitment o sobrecompromiso ocurre cuando aceptamos más obligaciones de las que podemos cumplir bien dado nuestro tiempo, energía y recursos disponibles. Suele deberse a dificultad para decir no, subestimar el tiempo real de cada tarea, o no tener visibilidad de la carga total acumulada. Con el tiempo genera estrés, calidad reducida y deterioro de relaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este análisis de una simple lista de tareas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una lista de tareas registra qué tienes pendiente, pero no evalúa si tu capacidad real permite hacerlo todo. Este test cruza dos variables: la carga total de compromisos y tu capacidad de gestión, y te sitúa en un mapa 2D que muestra tu perfil (por ejemplo, "Alta carga / Baja capacidad"). Eso permite acciones muy distintas según dónde estés en el mapa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar este test si trabajo por cuenta propia o como autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el test está diseñado para funcionar tanto en contextos laborales por cuenta ajena como en trabajos autónomos, proyectos personales o gestión del hogar. Las preguntas abordan compromisos en sentido amplio, no solo laboral, lo que lo hace útil para cualquier persona que sienta que tiene más entre manos de lo que puede abarcar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de acciones concretas obtengo al terminar el test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al finalizar recibes un perfil de cuadrante (p. ej. "Zona de riesgo: alta carga, baja capacidad") con entre 3 y 5 acciones específicas adaptadas a tu resultado: desde técnicas para liberar compromisos existentes hasta hábitos para mejorar la capacidad de gestión. Las sugerencias son prácticas e inmediatamente aplicables, sin metodologías complejas.',
      },
    },
  ],
};

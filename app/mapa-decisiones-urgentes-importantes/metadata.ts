import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Decisiones Urgentes vs Importantes - ¿Vives apagando fuegos? | meskeIA',
  description: 'Descubre si vives en modo reactivo o construyes futuro. Test de 10 preguntas basado en la Matriz Eisenhower adaptada. Diagnóstico visual con perfil y acciones concretas. Gratuito y sin registro.',
  keywords: 'matriz eisenhower, urgente vs importante, gestión del tiempo, prioridades, productividad, apagar fuegos, planificación estratégica, Covey, cuadrante 2',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Decisiones Urgentes vs Importantes | meskeIA',
    description: '¿Vives apagando fuegos o construyendo futuro? Test interactivo basado en la Matriz Eisenhower.',
    url: 'https://meskeia.com/mapa-decisiones-urgentes-importantes/',
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
    title: 'Mapa de Decisiones Urgentes vs Importantes | meskeIA',
    description: '¿Vives en modo urgencia permanente? Descúbrelo con este test gratuito basado en Eisenhower.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Mapa de Decisiones Urgentes vs Importantes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Decisiones Urgentes vs Importantes',
  description: 'Herramienta interactiva de reflexión basada en la Matriz Eisenhower adaptada. 10 preguntas para evaluar si priorizas lo importante o solo reaccionas a lo urgente. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/mapa-decisiones-urgentes-importantes/',
  features: [
    'Test de 10 preguntas sobre cómo gestionas prioridades',
    'Diagnóstico visual con mapa bidimensional',
    'Basado en la Matriz Eisenhower y el Cuadrante 2 de Covey',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar tu gestión del tiempo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la Matriz Eisenhower y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Matriz Eisenhower es una herramienta de gestión del tiempo que clasifica las tareas en cuatro cuadrantes según su urgencia e importancia. Ayuda a identificar qué merece atención inmediata, qué debe planificarse, qué puede delegarse y qué conviene eliminar. El presidente Dwight Eisenhower la popularizó y Stephen Covey la difundió en su libro "Los 7 hábitos de la gente altamente efectiva".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si estoy viviendo en modo urgencia permanente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Señales habituales son: responder siempre al último correo o notificación, sensación de que el día se va en apagar incendios, dificultad para dedicar tiempo a proyectos de largo plazo y la sensación de que sin ti todo se para. El test de 10 preguntas de esta herramienta evalúa exactamente ese patrón y genera un diagnóstico visual con tu perfil actual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre urgente e importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Urgente es lo que exige atención inmediata, generalmente impuesto por otros o por plazos externos. Importante es lo que contribuye a tus objetivos de largo plazo y a tu bienestar o el de tu equipo. La confusión habitual es tratar todo lo urgente como si fuera importante, lo que deja sin tiempo las tareas realmente estratégicas como planificar, aprender o construir relaciones sólidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este diagnóstico de prioridades?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que sienta que su tiempo no le alcanza o que trabaja mucho sin avanzar en lo que realmente importa. Es especialmente relevante para profesionales con autonomía en la gestión de su agenda, responsables de equipo, emprendedores y estudiantes en etapas de alta carga. No requiere conocimientos previos; el test tarda unos cinco minutos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Cuadrante 2 de Covey y por qué es tan importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Cuadrante 2 agrupa las actividades que son importantes pero no urgentes: planificación, formación, relaciones personales y prevención de problemas. Covey argumenta que vivir más tiempo en este cuadrante reduce las crisis del Cuadrante 1 (urgente e importante) y evita el desgaste del Cuadrante 3 (urgente pero no importante). Las personas que dedican tiempo deliberado al Cuadrante 2 suelen reportar mayor sensación de control y resultados sostenibles.',
      },
    },
  ],
};

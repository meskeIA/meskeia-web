import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Delegación Efectiva - ¿Delegas bien o solo sueltas tareas? | meskeIA',
  description: 'Descubre si delegas con acompañamiento y autonomía real o si microges­tionas o abandonas tareas. Test de 10 preguntas basado en el Modelo Situacional de Hersey-Blanchard. Gratuito y sin registro.',
  keywords: 'delegación efectiva, Hersey Blanchard, liderazgo situacional, delegar tareas, microgestión, management, autonomía equipo, feedback delegación, desarrollo equipo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Delegación Efectiva | meskeIA',
    description: '¿Delegas bien o solo sueltas tareas? Test interactivo basado en el Modelo Situacional de Hersey-Blanchard.',
    url: 'https://meskeia.com/test-delegacion-efectiva/',
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
    title: 'Test de Delegación Efectiva | meskeIA',
    description: '¿Delegas con criterio o solo sueltas tareas? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test de Delegación Efectiva meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Delegación Efectiva',
  description: 'Herramienta interactiva de reflexión basada en el Modelo Situacional de Hersey-Blanchard. 10 preguntas para evaluar si delegas con acompañamiento y autonomía real. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/test-delegacion-efectiva/',
  features: [
    'Test de 10 preguntas sobre cómo delegas en tu equipo',
    'Diagnóstico visual con mapa bidimensional',
    'Basado en el Modelo Situacional de Hersey-Blanchard',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar tu delegación',
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
      name: '¿Qué diferencia hay entre delegar y simplemente asignar tareas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Asignar tareas implica indicar qué hay que hacer y esperar el resultado. Delegar de forma efectiva supone también transferir la responsabilidad, dar la autonomía necesaria y ajustar el nivel de acompañamiento según la experiencia y motivación de la persona. El modelo de liderazgo situacional de Hersey y Blanchard distingue cuatro estilos de delegación (dirigir, entrenar, apoyar y delegar) según el nivel de madurez del colaborador en la tarea concreta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo saber si estoy microges­tionando a mi equipo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los indicadores más comunes de microgestión son: revisar el trabajo antes de que la persona lo considere terminado, pedir actualizaciones frecuentes no solicitadas, corregir detalles menores de forma sistemática o tomar decisiones que corresponden al colaborador. La microgestión suele ser involuntaria y puede derivar de la falta de confianza, de presión externa sobre resultados o de un estilo de liderazgo poco adaptado al nivel de autonomía real del equipo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de personas o roles es útil este test de delegación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que tenga personas a su cargo, desde coordinadores de pequeños equipos hasta directivos de organizaciones medianas. También es valioso para quienes están en transición hacia un rol de liderazgo y quieren detectar sus tendencias. El test no evalúa habilidades técnicas sino patrones de comportamiento en situaciones reales de gestión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Modelo Situacional de Hersey-Blanchard y por qué se usa para evaluar la delegación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Modelo de Liderazgo Situacional, desarrollado por Paul Hersey y Ken Blanchard en la década de 1970, propone que no existe un único estilo de liderazgo óptimo. El estilo adecuado depende del nivel de madurez del colaborador en la tarea: competencia (capacidad técnica) y compromiso (motivación y confianza). El modelo se usa para evaluar la delegación porque ofrece un marco concreto para calibrar cuánta dirección y cuánto apoyo necesita cada persona en cada momento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si delego demasiado y no hago suficiente seguimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El exceso de delegación sin seguimiento se conoce a veces como "abandono de responsabilidad" o laissez-faire, y puede generar desorientación, errores no detectados a tiempo y pérdida de confianza del equipo en el liderazgo. La delegación efectiva no implica desaparecer: requiere acordar expectativas claras, establecer puntos de revisión acordados y estar disponible para resolver bloqueos, sin sustituir la autonomía del colaborador.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Errores de Escritura Creativa — 15 Fallos con Correcciones y Ejemplos | meskeIA',
  description: '15 errores frecuentes en escritura creativa con ejemplo incorrecto y corrección comentada. Head-hopping, diálogos de exposición, el truco del espejo, adjetivitis y más. Con consejo práctico para cada caso.',
  keywords: 'errores escritura creativa, como escribir mejor, head hopping narrador, show dont tell, dialogos realistas, adjetivitis, escritura de novela, tecnica narrativa, fallos escritores, mary sue, deus ex machina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Errores de Escritura Creativa — 15 Fallos con Correcciones',
    description: '15 errores frecuentes en escritura creativa con ejemplos malos y correcciones explicadas. Aprende qué falla y por qué.',
    url: 'https://meskeia.com/errores-escritura-creativa',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Errores de Escritura Creativa — 15 Fallos con Correcciones',
    description: '15 errores frecuentes en escritura creativa con ejemplos. Head-hopping, el truco del espejo, adjetivitis y más.',
  },
  other: {
    'application-name': 'Errores de Escritura Creativa meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Errores de Escritura Creativa — 15 Fallos con Correcciones',
  description: 'Directorio de 15 errores frecuentes en escritura creativa con ejemplo incorrecto y corrección comentada. Cubre voz narrativa, diálogos, descripción, estructura, personajes y estilo.',
  url: 'https://meskeia.com/errores-escritura-creativa/',
  category: 'EducationalApplication',
  features: [
    '15 errores frecuentes en escritura creativa analizados en profundidad',
    'Ejemplo de texto incorrecto y corrección explicada para cada error',
    'Explicación del porqué falla y porqué funciona la corrección',
    'Filtros por categoría: voz, diálogos, descripción, estructura, personajes, estilo',
    'Niveles básico, intermedio y avanzado',
    'Consejo práctico aplicable directamente al manuscrito',
    'Proceso de revisión en 5 pasadas',
    'Gratuito, sin registro, en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el head-hopping y por qué arruina una novela?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El head-hopping ocurre cuando el narrador salta entre la perspectiva mental de varios personajes dentro de una misma escena o párrafo sin transición clara. Desorientan al lector porque pierde el punto de vista desde el que está viviendo la historia. La solución es escoger un único personaje focal por escena y, si es necesario cambiar, hacer una separación visual o de capítulo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa "show, don\'t tell" en escritura creativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '"Show, don\'t tell" (muestra, no cuentes) es el principio de transmitir emociones, rasgos y situaciones a través de acciones, diálogos y detalles concretos en lugar de afirmaciones directas. En lugar de escribir "Elena estaba nerviosa", mostrar que "Elena se mordía la uña del pulgar y miraba la puerta cada diez segundos". No es una regla absoluta, pero su aplicación mejora la implicación del lector.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el "truco del espejo" y por qué se critica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El truco del espejo es el recurso de hacer que un personaje se mire al espejo para describir su aspecto físico. Es un cliché muy gastado porque resulta forzado y mecánico; los lectores lo identifican de inmediato como artificio. Existen alternativas más naturales: que otro personaje lo describa, que el protagonista se vea en una foto antigua o que los detalles físicos emerjan de la acción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los errores más comunes en los diálogos de novela?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tres más frecuentes son los diálogos de exposición (personajes que se dicen información que ya conocen solo para informar al lector), el abuso de acotaciones elaboradas en lugar de "dijo" y los diálogos demasiado literarios que nadie hablaría en voz alta. Un diálogo funciona cuando revela carácter, avanza la trama o crea tensión, no cuando transmite datos de fondo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un personaje Mary Sue y un protagonista bien construido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un personaje Mary Sue es perfecto, sin defectos creíbles, admirado por todos y capaz de superar cualquier obstáculo sin esfuerzo ni coste real. Un protagonista bien construido tiene contradicciones internas, comete errores con consecuencias y crece a través de la historia. La clave no es que el personaje sea imperfecto, sino que sus limitaciones sean relevantes para la trama y que su evolución sea ganada, no regalada.',
      },
    },
  ],
};

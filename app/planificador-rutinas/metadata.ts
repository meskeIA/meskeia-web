import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Planificador Visual de Rutinas - Agenda Visual del Día | meskeIA',
  description: 'Crea rutinas diarias con pictogramas visuales. Ideal para personas con autismo, TDAH, discapacidad intelectual o cualquier persona que se beneficie de una agenda visual estructurada. Sin registro, funciona sin conexión.',
  keywords: 'planificador rutinas visual, agenda visual autismo, rutinas autismo, pictogramas rutinas, TDAH organizacion, agenda diaria pictogramas, rutinas discapacidad cognitiva, horario visual, apoyo conductual positivo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador Visual de Rutinas | meskeIA',
    description: 'Crea y sigue rutinas diarias con pictogramas visuales. Para autismo, TDAH y discapacidad cognitiva.',
    url: 'https://meskeia.com/planificador-rutinas/',
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
    title: 'Planificador Visual de Rutinas | meskeIA',
    description: 'Agenda visual con pictogramas para estructurar el día. Ideal para autismo y TDAH.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador Visual de Rutinas - Agenda Visual del Día",
  description: "Crea rutinas diarias con pictogramas visuales. Ideal para personas con autismo, TDAH, discapacidad intelectual o cualquier persona que se beneficie de una agenda visual estructurada. Sin registro, funciona sin conexión.",
  url: 'https://meskeia.com/planificador-rutinas/',
  category: 'UtilityApplication',
  features: [
    'Crea rutinas paso a paso con pictogramas emoji personalizables',
    'Modo seguimiento paso a paso, con la tarea actual en grande y un tono de éxito al completar cada una',
    'Barra de progreso visual y contador de posición en la secuencia',
    'Diseñado para personas con TEA, TDAH y discapacidad cognitiva',
    'Datos guardados localmente: funciona sin internet y sin cuenta',
    'Múltiples rutinas independientes (mañana, tarde, noche, fin de semana)',
    'Reordenación de tareas con duración orientativa por paso',
  ],
});

/**
 * Pregunta que va en las dos bocas: la FAQ visible de page.tsx (que la importa) y el FAQPage de
 * abajo. Antes cada una daba su respuesta, con cifras de tareas por edad distintas y sin fuente
 * (hallazgo 5290, CLAUDE.md §1.quinquies punto 1): ahora una sola, sin cifras.
 */
export const PREGUNTA_CUANTAS_TAREAS = {
  question: '¿Cuántas tareas debo incluir en una rutina?',
  answer:
    'Depende de la persona y de la rutina: no hay una cifra que sirva para todos. Lo habitual es empezar con pocas tareas, cada una un paso claro y concreto, y añadir más cuando la rutina corta esté consolidada. Quien conoce a la persona (la familia, el educador o el terapeuta) es quien mejor puede ajustar la longitud.',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué las rutinas visuales son importantes para personas con autismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las personas con TEA (trastorno del espectro autista) procesan mejor la información visual que la verbal. Las rutinas visuales convierten la secuencia abstracta del día en una representación concreta y predecible. Esto reduce la ansiedad ante lo desconocido, facilita las transiciones entre actividades, aumenta la autonomía al poder anticipar qué viene después sin depender de instrucciones verbales, y disminuye las conductas disruptivas asociadas a la incertidumbre. Son una herramienta central en los programas de intervención para TEA como TEACCH.',
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_CUANTAS_TAREAS.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: PREGUNTA_CUANTAS_TAREAS.answer,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo introducir una rutina visual por primera vez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pasos recomendados: 1) Empieza con la rutina más repetida del día (mañana o noche). 2) Crea la secuencia con pictogramas conocidos para la persona. 3) Repasa verbalmente la rutina antes de empezar cada día. 4) Guía físicamente los primeros días, reduciendo el apoyo progresivamente. 5) Refuerza positivamente cada paso completado. 6) Mantén la rutina consistente al inicio; introduce cambios solo cuando esté bien afianzada. La constancia es más importante que la perfección.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las rutinas visuales funcionan también para personas con TDAH?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, son muy eficaces para el TDAH. Las personas con TDAH tienen dificultades con la memoria de trabajo y la función ejecutiva, lo que hace que olvidar pasos de una rutina sea frecuente. Una agenda visual externaliza la memoria: la persona no necesita recordar qué sigue porque puede verlo. También ayuda a iniciar tareas (el reto del "inicio"), a no perderse en medio de la rutina y a gestionar el tiempo. Muchos adultos con TDAH usan planificadores visuales como herramienta de productividad diaria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los pictogramas y dónde se pueden encontrar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los pictogramas son imágenes simples y esquemáticas que representan acciones, objetos o conceptos de forma unívoca. En el campo de la comunicación aumentativa, los más usados son los de ARASAAC (Centro Aragonés de Comunicación Aumentativa y Alternativa), disponibles gratuitamente en arasaac.org bajo licencia Creative Commons. Representan más de 30.000 conceptos en decenas de idiomas. Este planificador visual usa emojis como pictogramas accesibles, combinables con texto descriptivo.',
      },
    },
  ],
};

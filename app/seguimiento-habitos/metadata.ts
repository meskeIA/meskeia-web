import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Seguimiento de Hábitos - Construye rutinas saludables | meskeIA',
  description: 'Crea y sigue tus hábitos diarios con calendario visual, rachas, estadísticas detalladas y sistema de logros. Herramienta gratuita para construir rutinas saludables.',
  keywords: 'seguimiento hábitos, tracker hábitos, rutinas diarias, rachas, productividad, bienestar, hábitos saludables, calendario hábitos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Seguimiento de Hábitos - meskeIA',
    description: 'Crea y sigue tus hábitos diarios con calendario visual, rachas y sistema de logros',
    url: 'https://meskeia.com/seguimiento-habitos/',
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
    title: 'Seguimiento de Hábitos - meskeIA',
    description: 'Construye rutinas saludables con visualización de rachas y logros',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Seguimiento de Hábitos - Construye rutinas saludables",
  description: "Crea y sigue tus hábitos diarios con calendario visual, rachas, estadísticas detalladas y sistema de logros. Herramienta gratuita para construir rutinas saludables.",
  url: 'https://meskeia.com/seguimiento-habitos/',
  category: 'UtilityApplication',
  features: [
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos días se tarda en formar un hábito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un estudio de la University College London dirigido por Phillippa Lally encontró que el tiempo medio para automatizar un hábito es de 66 días, con un rango de 18 a 254 días según la persona y la complejidad del comportamiento. La idea popular de "21 días" proviene de una observación informal del cirujano Maxwell Maltz y no está respaldada por investigación controlada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un tracker de hábitos y para qué sirven las rachas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un tracker de hábitos registra si completaste cada hábito cada día y muestra tu progreso en un calendario visual. Las rachas (días consecutivos cumplidos) aprovechan el sesgo de pérdida: una vez que llevas varios días seguidos, el impulso de "no romper la cadena" actúa como motivación extra. Estudios de gamificación muestran que las rachas aumentan la adherencia a corto plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos hábitos es recomendable trabajar al mismo tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de los expertos en cambio de conducta recomiendan trabajar entre 1 y 3 hábitos nuevos simultáneamente. Intentar cambiar demasiadas cosas a la vez agota la fuerza de voluntad y la memoria de trabajo, lo que aumenta la tasa de abandono. Es mejor consolidar un hábito hasta que sea automático antes de añadir otro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un tracker de hábitos en el navegador y una app como Habitica o Streaks?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un tracker web funciona sin instalación ni cuenta, lo que reduce la fricción inicial; los datos se guardan en el navegador (localStorage). Apps nativas como Habitica o Streaks ofrecen notificaciones push, sincronización entre dispositivos y funciones sociales o de gamificación más avanzadas. Si buscas privacidad total y sencillez, el tracker web es suficiente; si necesitas recordatorios en el móvil, una app nativa puede ser más efectiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué estrategias ayudan a no abandonar un hábito nuevo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las técnicas con mayor evidencia son: el "apilamiento de hábitos" (unir el nuevo hábito a uno ya automatizado), reducir la fricción de entrada (preparar el entorno de antemano), establecer un mínimo viable muy pequeño para los días difíciles, y registrar el progreso visualmente. Perdonarse un fallo puntual sin abandonar (la regla del "nunca dos veces seguidas") también mejora la adherencia a largo plazo.',
      },
    },
  ],
};

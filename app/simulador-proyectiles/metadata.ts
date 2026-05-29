import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Proyectiles 2D - Movimiento Parabólico | meskeIA',
  description:
    'Simula tiros parabólicos: ajusta velocidad, ángulo, gravedad y resistencia del aire. Calcula alcance, altura máxima y tiempo de vuelo. Física Bachillerato y Universidad.',
  keywords:
    'simulador proyectiles, movimiento parabólico, tiro oblicuo, alcance proyectil, altura máxima, física bachillerato, cinemática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-proyectiles/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Proyectiles 2D | meskeIA',
    description:
      'Simulador interactivo de movimiento parabólico con resistencia del aire y diferentes gravedades planetarias',
    url: 'https://meskeia.com/simulador-proyectiles/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Proyectiles 2D | meskeIA',
    description: 'Aprende cinemática con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el movimiento parabólico y cómo se simula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El movimiento parabólico (o tiro oblicuo) combina un movimiento horizontal uniforme con una caída vertical acelerada por la gravedad. El simulador descompone la velocidad inicial en sus componentes horizontal y vertical, integra las ecuaciones cinemáticas en cada fotograma y dibuja la trayectoria resultante en tiempo real sobre un canvas 2D.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué parámetros se pueden ajustar en el simulador de proyectiles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes modificar la velocidad inicial (m/s), el ángulo de lanzamiento (0°–90°), la altura de lanzamiento, la gravedad (con presets para Tierra, Luna, Marte y Júpiter) y activar o desactivar la resistencia del aire. El simulador permite comparar hasta tres lanzamientos simultáneos con diferentes configuraciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué ángulo se obtiene el mayor alcance en un tiro parabólico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sin resistencia del aire y con lanzamiento desde el nivel del suelo, el alcance máximo se obtiene a 45°. Con resistencia del aire, el ángulo óptimo es ligeramente inferior, en torno a 30°–40° dependiendo de la velocidad y el coeficiente de arrastre. El simulador calcula y muestra el alcance real para cada combinación de parámetros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué cursos y asignaturas es útil este simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para Física de 2.º de Bachillerato (cinemática, dinámica) y para asignaturas de primer curso universitario de Física General o Mecánica. También sirve para preparar problemas de selectividad relacionados con el movimiento parabólico y para visualizar conceptos antes de resolver ejercicios analíticos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la resistencia del aire a la trayectoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La resistencia del aire introduce una fuerza de rozamiento proporcional al cuadrado de la velocidad, lo que reduce el alcance y la altura máxima respecto al caso ideal. La trayectoria deja de ser una parábola perfecta: la parte descendente es más inclinada y el proyectil impacta con un ángulo mayor que el de lanzamiento.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Proyectiles 2D',
  description:
    'Simulador interactivo de movimiento parabólico. Ajusta velocidad inicial, ángulo, altura, gravedad y resistencia del aire para observar la trayectoria, el alcance, la altura máxima y el tiempo de vuelo.',
  url: 'https://meskeia.com/simulador-proyectiles/',
  category: 'EducationalApplication',
  features: [
    'Trayectoria 2D animada con Canvas',
    'Ángulo, velocidad inicial, altura y gravedad ajustables',
    'Presets de gravedad: Tierra, Luna, Marte, Júpiter',
    'Modo con/sin resistencia del aire',
    'Comparación de hasta 3 lanzamientos simultáneos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['proyectiles', 'tiro parabólico', 'cinemática', 'física bachillerato'],
});

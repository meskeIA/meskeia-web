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
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Proyectiles 2D | meskeIA',
    description: 'Aprende cinemática con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
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
        text: 'El movimiento parabólico (o tiro oblicuo) combina un movimiento horizontal uniforme con una caída vertical acelerada por la gravedad. Sin resistencia del aire, el simulador usa la solución exacta de las ecuaciones cinemáticas (x = v₀·cos θ·t, y = h₀ + v₀·sen θ·t − ½·g·t²); con resistencia, que no tiene solución cerrada, integra numéricamente con el método de Runge-Kutta de cuarto orden (RK4) hasta el instante en que el proyectil toca el suelo. La trayectoria se dibuja como gráfico vectorial (SVG) y puede animarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué parámetros se pueden ajustar en el simulador de proyectiles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes modificar la velocidad inicial (1 a 100 m/s), el ángulo de lanzamiento (0°–90°), la altura de lanzamiento (0 a 100 m), la gravedad (con presets para Tierra, Luna, Marte y Júpiter, o un valor propio) y activar la resistencia del aire con su coeficiente k. Puedes guardar hasta tres lanzamientos en tarjetas comparativas, con su trayectoria superpuesta en el gráfico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué ángulo se obtiene el mayor alcance en un tiro parabólico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sin resistencia del aire y con lanzamiento desde el nivel del suelo, el alcance máximo se obtiene a 45°. Desde una altura h₀ el óptimo baja: tan θ = v₀/√(v₀² + 2·g·h₀), que con 20 m/s desde 30 m da 32,5°. Con resistencia del aire también baja de 45°, y cuánto depende de la velocidad y del coeficiente de rozamiento: con 100 m/s y k = 0,05 queda en 27°. El simulador calcula el ángulo de máximo alcance para los valores que introduzcas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué cursos y asignaturas es útil este simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para Física de los últimos cursos de secundaria o preparatoria (cinemática, dinámica) y para asignaturas de primer curso universitario de Física General o Mecánica. También sirve para preparar problemas de examen de admisión universitaria sobre movimiento parabólico y para comprobar ejercicios resueltos a mano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la resistencia del aire a la trayectoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La resistencia del aire introduce una fuerza de rozamiento proporcional al cuadrado de la velocidad (F = −k·|v|·v), lo que reduce el alcance, la altura máxima y la velocidad de impacto respecto al caso ideal. La trayectoria deja de ser una parábola: la bajada dura más que la subida y es más empinada, y el proyectil impacta con un ángulo mayor que el de lanzamiento. Con 20 m/s a 45° y k = 0,05, el alcance cae de 40,77 m a 17,53 m.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Proyectiles 2D',
  description:
    'Simulador interactivo de movimiento parabólico. Ajusta velocidad inicial, ángulo, altura, gravedad y resistencia del aire y obtén alcance, altura máxima, tiempo de vuelo, velocidad de impacto y ángulo de máximo alcance, con la trayectoria dibujada en SVG: solución exacta sin rozamiento e integración RK4 con rozamiento cuadrático.',
  url: 'https://meskeia.com/simulador-proyectiles/',
  category: 'EducationalApplication',
  features: [
    'Trayectoria dibujada en SVG, con animación del lanzamiento',
    'Ángulo, velocidad inicial, altura y gravedad ajustables',
    'Presets de gravedad: Tierra, Luna, Marte, Júpiter',
    'Sin resistencia del aire: solución analítica exacta',
    'Con resistencia del aire (rozamiento cuadrático): integración numérica RK4 hasta el suelo',
    'Alcance, altura máxima, tiempo de vuelo, velocidad de impacto y ángulo de máximo alcance',
    'Hasta 3 lanzamientos guardados en tarjetas comparativas, con sus trayectorias superpuestas',
    'Caja con las ecuaciones del tiro parabólico',
  ],
  keywords: ['proyectiles', 'tiro parabólico', 'cinemática', 'física bachillerato'],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Distribución Normal — Curva de Gauss Interactiva | meskeIA',
  description: 'Visualiza la distribución normal moviendo media (μ) y desviación típica (σ). Calcula probabilidades, áreas, puntuaciones Z y la regla 68-95-99.7 paso a paso.',
  keywords: 'distribución normal, curva de Gauss, campana de Gauss, media, desviación típica, puntuación Z, tipificación, regla 68-95-99.7, estadística, probabilidad, EBAU, selectividad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-distribucion-normal/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Distribución Normal | meskeIA',
    description: 'Mueve μ y σ y observa cómo cambia la curva de Gauss. Calcula probabilidades y puntuaciones Z visualmente.',
    url: 'https://meskeia.com/simulador-distribucion-normal/',
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
    title: 'Simulador de Distribución Normal | meskeIA',
    description: 'Visualiza la curva de Gauss y calcula probabilidades de forma interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Distribución Normal',
  description: 'Simulador interactivo de la distribución normal o campana de Gauss. Manipula la media (μ) y la desviación típica (σ) para ver cómo cambia la curva en tiempo real, calcula probabilidades de tramos, puntuaciones Z (tipificación) y aprende visualmente la regla empírica 68-95-99.7.',
  url: 'https://meskeia.com/simulador-distribucion-normal/',
  category: 'EducationalApplication',
  features: [
    'Manipulación interactiva de μ (media) y σ (desviación típica)',
    'Cálculo automático de probabilidades P(X<a), P(X>a), P(a<X<b)',
    'Tipificación a puntuación Z y comparación con N(0,1)',
    'Visualización de la regla 68-95-99.7 sombreada',
    'Problemas tipo predefinidos (alturas, calificaciones, control de calidad)',
    'Comparación simultánea de tu distribución sobre la curva N(0,1) estándar en modo overlay',
    'Indicador del valor de densidad f(x) en cualquier punto de la campana de Gauss',
    'Tabla de ángulos notables y porcentajes exactos de las reglas 1σ, 2σ y 3σ',
  ],
  keywords: ['distribución normal', 'Gauss', 'estadística', 'probabilidad', 'puntuación Z', 'EBAU', 'Bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la distribución normal o curva de Gauss?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La distribución normal es un modelo estadístico que describe cómo se distribuyen muchas variables naturales y sociales (alturas, errores de medición, calificaciones) alrededor de su valor medio. Su gráfica forma una campana simétrica característica, llamada campana de Gauss. Queda completamente definida por dos parámetros: la media (μ), que determina el centro, y la desviación típica (σ), que controla el ancho de la campana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la regla 68-95-99,7 en estadística?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla empírica establece que, en cualquier distribución normal, aproximadamente el 68% de los datos cae dentro de una desviación típica de la media (μ ± σ), el 95% dentro de dos desviaciones (μ ± 2σ) y el 99,7% dentro de tres desviaciones (μ ± 3σ). Esta regla permite hacer estimaciones rápidas de probabilidad sin necesidad de calcular integrales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula una puntuación Z y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La puntuación Z (o valor tipificado) indica cuántas desviaciones típicas está un valor respecto a la media: Z = (X − μ) / σ. Sirve para comparar valores de distribuciones con distintas medias y desviaciones en una escala común. Por ejemplo, una nota de 7 en un examen con μ=5 y σ=1 tiene Z=2, lo que indica que está dos desviaciones por encima de la media del grupo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia la distribución normal de otras distribuciones estadísticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La distribución normal es continua, simétrica y sus colas se extienden teóricamente hasta ±∞. Se diferencia de la distribución binomial (discreta, para recuentos de éxitos) o de la distribución uniforme (todos los valores igualmente probables). Su importancia radica en el Teorema Central del Límite: la media de muchas muestras independientes tiende a seguir una distribución normal, independientemente de la distribución original de los datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un simulador interactivo de distribución normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de Bachillerato, ciclos formativos o universidad que aprenden estadística y probabilidad. También ayuda a docentes a visualizar conceptos en clase. Permite experimentar cómo cambia la forma de la curva al modificar μ y σ, calcular probabilidades de tramos concretos y comprender visualmente conceptos que resultan abstractos con solo fórmulas.',
      },
    },
  ],
};

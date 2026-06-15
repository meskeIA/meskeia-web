import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Inferencia Bayesiana | meskeIA',
  description: 'Aplica el teorema de Bayes paso a paso. Calcula probabilidades posteriores, actualiza creencias con evidencia y visualiza el proceso de inferencia bayesiana.',
  keywords: 'teorema de bayes, inferencia bayesiana, probabilidad posterior, prior, likelihood, verosimilitud, estadística bayesiana, probabilidad condicional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Inferencia Bayesiana | meskeIA',
    description: 'Aplica el teorema de Bayes paso a paso. Calcula probabilidades posteriores con prior, likelihood y evidencia.',
    url: 'https://meskeia.com/inferencia-bayesiana/',
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
    title: 'Calculadora de Inferencia Bayesiana',
    description: 'Teorema de Bayes explicado paso a paso con ejemplos prácticos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Inferencia Bayesiana",
  description: "Aplica el teorema de Bayes paso a paso. Calcula probabilidades posteriores, actualiza creencias con evidencia y visualiza el proceso de inferencia bayesiana.",
  url: 'https://meskeia.com/inferencia-bayesiana/',
  category: 'EducationalApplication',
  features: [
    'Cuatro modos de cálculo: caso simple, múltiples hipótesis, actualización secuencial y diagnóstico clínico',
    'Actualización secuencial de Bayes: cada observación se convierte en nueva prior automáticamente',
    'Modo diagnóstico con sensibilidad, especificidad y prevalencia para interpretar pruebas médicas',
    'Cálculo de likelihood ratio positivo (LR+) y negativo (LR−) en el modo diagnóstico',
    'Comparación simultánea de hasta 5 hipótesis con suma de probabilidades normalizada automáticamente',
    'Ejemplos precargados: diagnóstico médico, correo spam, atribución de autoría y decisiones legales',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el teorema de Bayes y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El teorema de Bayes es una fórmula que permite actualizar la probabilidad de un evento (probabilidad posterior) cuando se dispone de nueva evidencia. Su forma es: P(A|B) = P(B|A) × P(A) / P(B). Se usa en diagnóstico médico, filtros de spam, modelos de machine learning, predicciones meteorológicas y cualquier situación donde se actualice una creencia con datos observados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son la probabilidad prior y la probabilidad posterior?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La probabilidad prior (a priori) es la creencia inicial sobre un evento antes de observar ninguna evidencia; por ejemplo, la prevalencia de una enfermedad en la población. La probabilidad posterior (a posteriori) es la probabilidad actualizada después de incorporar la evidencia observada, como el resultado positivo de una prueba diagnóstica. La posterior se convierte en nueva prior al llegar más datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre estadística bayesiana y estadística frecuentista?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estadística frecuentista interpreta la probabilidad como la frecuencia a largo plazo de un evento en repeticiones teóricas del experimento, y no asigna probabilidades a hipótesis fijas. La bayesiana permite asignar probabilidades a las hipótesis mismas y actualizarlas con evidencia. El enfoque bayesiano es más flexible cuando hay información previa relevante o el número de observaciones es pequeño.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se interpreta la verosimilitud (likelihood) en el teorema de Bayes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La verosimilitud P(B|A) mide la probabilidad de observar la evidencia B dado que la hipótesis A es cierta. No es una probabilidad sobre A, sino sobre los datos. Por ejemplo, en un test diagnóstico con sensibilidad del 95%, la verosimilitud de un positivo dado que el paciente está enfermo es 0,95. Un valor de verosimilitud alto indica que la evidencia es compatible con la hipótesis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué perfiles es útil esta calculadora de inferencia bayesiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes universitarios de Estadística, Matemáticas, Ingeniería o Ciencias de la Salud que necesitan comprender el teorema de Bayes con ejemplos concretos; para científicos de datos y desarrolladores de modelos probabilísticos; y para profesionales sanitarios que quieren interpretar correctamente la sensibilidad y especificidad de pruebas diagnósticas.',
      },
    },
  ],
};

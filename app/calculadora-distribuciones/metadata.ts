import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Distribuciones de Probabilidad | meskeIA',
  description: 'Calcula probabilidades con distribuciones Normal, Poisson, Exponencial, Uniforme, Gamma y Beta. Funciones PDF, CDF y cuantiles con visualización.',
  keywords: 'distribución normal, distribución poisson, distribución exponencial, gaussiana, probabilidad, estadística, PDF, CDF, cuantiles, función densidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Distribuciones de Probabilidad | meskeIA',
    description: 'Calcula probabilidades con distribuciones Normal, Poisson, Exponencial, Uniforme, Gamma y Beta. Con visualización de PDF y CDF.',
    url: 'https://meskeia.com/calculadora-distribuciones/',
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
    title: 'Calculadora de Distribuciones de Probabilidad',
    description: 'Normal, Poisson, Exponencial, Uniforme, Gamma y Beta con PDF, CDF y cuantiles.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Distribuciones de Probabilidad",
  description: "Calcula probabilidades con distribuciones Normal, Poisson, Exponencial, Uniforme, Gamma y Beta. Funciones PDF, CDF y cuantiles con visualización.",
  url: 'https://meskeia.com/calculadora-distribuciones/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué distribuciones de probabilidad incluye esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herramienta cubre seis distribuciones: Normal (gaussiana), Poisson, Exponencial, Uniforme continua, Gamma y Beta. Para cada una permite calcular la función de densidad de probabilidad (PDF), la función de distribución acumulada (CDF) y los cuantiles, además de visualizar la curva con los parámetros elegidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre PDF y CDF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La PDF (función de densidad de probabilidad) describe la probabilidad relativa en un punto concreto de la distribución; en variables continuas no representa una probabilidad directa, sino la densidad. La CDF (función de distribución acumulada) da la probabilidad de que la variable tome un valor menor o igual a x, y siempre oscila entre 0 y 1.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se usa la distribución de Poisson frente a la Normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La distribución de Poisson modela el número de eventos discretos que ocurren en un intervalo de tiempo o espacio fijo cuando los eventos son independientes y tienen una tasa promedio constante (llamadas telefónicas por hora, fallos de máquinas por semana). La distribución Normal es más adecuada para variables continuas que resultan de la suma de muchos factores independientes, como mediciones físicas o notas de exámenes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un cuantil y cómo se interpreta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cuantil es el valor que deja por debajo un determinado porcentaje de la distribución. Por ejemplo, el cuantil 0,95 de una distribución Normal estándar es aproximadamente 1,645, lo que significa que el 95% de los valores quedan por debajo de ese punto. Los cuantiles se usan en estadística para definir intervalos de confianza, valores críticos en contrastes de hipótesis y percentiles en pruebas educativas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué asignaturas o situaciones es útil esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil en asignaturas de Estadística y Probabilidad (grados universitarios de Matemáticas, Ingeniería, Economía, Biología), en cursos de análisis de datos y machine learning, y para profesionales que necesitan calcular probabilidades de forma rápida sin recurrir a tablas estadísticas en papel.',
      },
    },
  ],
};

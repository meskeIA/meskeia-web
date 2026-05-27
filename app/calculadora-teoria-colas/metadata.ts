import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Teoría de Colas M/M/1 - Análisis de Sistemas de Espera | meskeIA',
  description: 'Calcula métricas de sistemas de colas M/M/1: utilización, longitud de cola, tiempos de espera. Gráficos interactivos y simulación de eventos. 100% gratis.',
  keywords: 'teoria de colas, mm1, sistema de colas, tiempo de espera, utilizacion servidor, longitud cola, investigacion operativa, little, poisson',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Teoría de Colas M/M/1 | meskeIA',
    description: 'Analiza sistemas de colas con métricas completas: utilización, longitud de cola, tiempos de espera. Gráficos y simulación incluidos.',
    url: 'https://meskeia.com/calculadora-teoria-colas/',
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
    title: 'Calculadora Teoría de Colas M/M/1 | meskeIA',
    description: 'Analiza sistemas de colas M/M/1 con métricas completas y gráficos interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora Teoría de Colas M/M/1',
  description: 'Calcula métricas de sistemas de colas M/M/1: utilización, longitud de cola, tiempos de espera. Gráficos interactivos y simulación de eventos.',
  url: 'https://meskeia.com/calculadora-teoria-colas/',
  category: 'EducationalApplication',
  features: [
    'Cálculo de métricas M/M/1: ρ, Lq, L, Wq, W',
    'Gráficos de utilización y longitud de cola',
    'Simulación de eventos discretos',
    'Ley de Little interactiva',
    'Gratuito, en español, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la teoría de colas M/M/1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo M/M/1 describe un sistema de espera con llegadas que siguen una distribución de Poisson (M), tiempos de servicio exponenciales (M) y un único servidor (1). Es el modelo básico de la teoría de colas, usado para analizar cajeros, servidores informáticos, líneas de atención y cualquier sistema donde los clientes esperan servicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el tiempo de espera en cola M/M/1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo medio de espera en cola es Wq = ρ / (μ − λ), donde ρ = λ/μ es la utilización del servidor, λ es la tasa de llegadas y μ la tasa de servicio. El tiempo total en el sistema (espera + servicio) es W = 1 / (μ − λ). Por la Ley de Little, L = λ·W y Lq = λ·Wq.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la utilización del servidor en un sistema de colas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La utilización ρ = λ/μ indica la fracción de tiempo que el servidor está ocupado. Si ρ < 1 el sistema es estable; si ρ ≥ 1 la cola crece indefinidamente. A medida que ρ se acerca a 1, los tiempos de espera aumentan de forma no lineal: con ρ = 0,8 la cola es 4 veces mayor que con ρ = 0,5.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué establece la Ley de Little?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Ley de Little establece que el número medio de clientes en cualquier sistema estable (L) es igual a la tasa de llegadas (λ) multiplicada por el tiempo medio de permanencia (W): L = λ·W. Es universal: se aplica a colas, fábricas, hospitales y redes informáticas sin depender de la distribución de llegadas ni de servicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo reducir el tiempo de espera en un sistema de colas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las estrategias principales son: aumentar la tasa de servicio μ (servidor más rápido), reducir la tasa de llegadas λ (citas, reservas, gestión de demanda), añadir servidores paralelos (modelo M/M/c), priorizar clientes según urgencia (colas con prioridades) o suavizar la variabilidad de llegadas. Un servidor al 90% de utilización tiene colas 9 veces mayores que uno al 50%.',
      },
    },
  ],
};

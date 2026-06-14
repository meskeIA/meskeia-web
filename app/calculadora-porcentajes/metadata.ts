import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Porcentajes Online - 5 Modos de Cálculo | meskeIA',
  description: 'Calculadora de porcentajes completa y gratuita. Calcula el X% de una cantidad, qué porcentaje es, aumentos, disminuciones y variación porcentual.',
  keywords: 'calculadora porcentajes, calcular porcentaje, tanto por ciento, porcentaje de un numero, aumento porcentual, variacion porcentual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Porcentajes Online - meskeIA',
    description: 'Calcula porcentajes fácilmente: X% de cantidad, qué % es, aumentos y variaciones.',
    url: 'https://meskeia.com/calculadora-porcentajes/',
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
    title: 'Calculadora de Porcentajes Online',
    description: 'Calcula porcentajes fácilmente: X% de cantidad, qué % es, aumentos y variaciones.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el porcentaje de un número?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para calcular el X% de un número, multiplica ese número por X y divide entre 100. Por ejemplo, el 15% de 200 es 200 × 15 / 100 = 30. En calculadora: escribe 200 × 15 % = y obtendrás directamente 30.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber qué porcentaje representa una cantidad sobre un total?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Divide la parte entre el total y multiplica por 100. Fórmula: porcentaje = (parte / total) × 100. Por ejemplo, si de 80 alumnos han aprobado 60, el porcentaje de aprobados es (60 / 80) × 100 = 75%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula un aumento porcentual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La variación porcentual entre un valor inicial y uno final se calcula como: ((valor_final − valor_inicial) / valor_inicial) × 100. Si el precio de un producto era 50 € y ahora es 65 €, el aumento es ((65 − 50) / 50) × 100 = 30%. Si el resultado es negativo, indica una disminución.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre puntos porcentuales y porcentaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un punto porcentual es la diferencia aritmética entre dos porcentajes. Si el paro pasa del 12% al 15%, el aumento es de 3 puntos porcentuales, pero el incremento porcentual relativo es del 25% (porque 3/12 × 100 = 25%). Confundir ambos conceptos es un error frecuente en la interpretación de estadísticas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve calcular porcentajes en la vida cotidiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los porcentajes aparecen en descuentos de tiendas, tasas de interés de préstamos, subidas salariales, resultados electorales, notas escolares (ponderaciones) y propinas. Dominar su cálculo permite comparar ofertas, entender noticias económicas y tomar mejores decisiones financieras.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Porcentajes Online - 5 Modos de Cálculo",
  description: "Calculadora de porcentajes completa y gratuita. Calcula el X% de una cantidad, qué porcentaje es, aumentos, disminuciones y variación porcentual.",
  url: 'https://meskeia.com/calculadora-porcentajes/',
  category: 'EducationalApplication',
  features: [
    "5 modos de cálculo: porcentaje de cantidad, qué % es, aumento, disminución y variación",
    "Calcula descuentos, IVA y subidas de precio con un solo paso",
    "Muestra la fórmula matemática utilizada en cada cálculo",
    "Formato numérico en español (punto de miles, coma decimal)",
    "Resultados instantáneos sin necesidad de pulsar Enter",
    "Interfaz adaptada a móvil y escritorio",
    "Sin registro ni instalación, funciona completamente en el navegador",
  ],
});

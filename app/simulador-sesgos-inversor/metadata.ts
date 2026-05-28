import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Sesgos del Inversor — ¿Decides con la cabeza o con el miedo? | meskeIA',
  description:
    '8 escenarios reales para detectar tus sesgos cognitivos como inversor: aversión a pérdidas, efecto manada, exceso de confianza, sesgo de confirmación y más. Descubre qué frena tu rentabilidad.',
  keywords: [
    'sesgos cognitivos inversor',
    'psicología financiera',
    'aversión pérdidas',
    'efecto manada inversión',
    'sesgo confirmación finanzas',
    'exceso confianza bolsa',
    'finanzas conductuales',
    'behavioral finance',
    'sesgo anclaje',
    'efecto disposición',
  ],
  openGraph: {
    title: 'Simulador Sesgos del Inversor | meskeIA',
    description:
      '¿Tus decisiones financieras las toma el cerebro racional o el emocional? 8 escenarios para descubrir tus sesgos cognitivos y cómo te afectan como inversor.',
    url: 'https://meskeia.com/simulador-sesgos-inversor/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/simulador-sesgos-inversor/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador Sesgos del Inversor",
  description: "8 escenarios reales para detectar tus sesgos cognitivos como inversor: aversión a pérdidas, efecto manada, exceso de confianza, sesgo de confirmación y más. Descubre qué frena tu rentabilidad.",
  url: "https://meskeia.com/simulador-sesgos-inversor/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los sesgos cognitivos en inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los sesgos cognitivos son patrones sistemáticos de pensamiento que llevan a tomar decisiones irracionales al invertir. Incluyen la aversión a pérdidas, el efecto manada, el exceso de confianza o el sesgo de confirmación. Identificarlos es el primer paso para tomar decisiones financieras más racionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la aversión a las pérdidas en finanzas conductuales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aversión a las pérdidas describe cómo el dolor de perder dinero es psicológicamente el doble de intenso que el placer de ganarlo, según los estudios de Kahneman y Tversky. Esto lleva a los inversores a mantener posiciones perdedoras demasiado tiempo o a vender prematuramente activos ganadores por miedo a perder el beneficio acumulado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el efecto manada en inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto manada ocurre cuando un inversor sigue las decisiones de la mayoría sin análisis propio. Es especialmente peligroso en mercados alcistas extremos o durante pánicos bursátiles, ya que amplifica las burbujas y las caídas. Comprar porque "todo el mundo compra" suele significar comprar cerca de máximos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el exceso de confianza a la rentabilidad del inversor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El exceso de confianza lleva a sobreestimar la capacidad para predecir el mercado, a operar con demasiada frecuencia y a asumir más riesgo del adecuado. Estudios de Barber y Odean mostraron que los inversores más activos obtienen rentabilidades hasta 2-3 puntos porcentuales anuales menores que los pasivos, en parte por este sesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un simulador de sesgos del inversor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un simulador de sesgos del inversor presenta escenarios reales de mercado para que el usuario tome decisiones y luego analiza qué sesgo ha activado. Es una herramienta de autoconocimiento financiero: al reconocer tus sesgos en un entorno seguro, puedes diseñar reglas de inversión que los compensen antes de que afecten a tu cartera real.',
      },
    },
  ],
};

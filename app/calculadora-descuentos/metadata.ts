import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Descuentos Online - Calcula Rebajas y Ofertas | meskeIA',
  description: 'Calculadora de descuentos gratuita. Calcula el precio final con descuento, ahorro en euros y descuentos encadenados. Ideal para rebajas, Black Friday y ofertas.',
  keywords: 'calculadora descuentos, calcular rebaja, precio final, ahorro, black friday, rebajas, ofertas, porcentaje descuento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Descuentos Online - meskeIA',
    description: 'Calcula el precio final con descuento y cuánto ahorras. Perfecta para rebajas y ofertas.',
    url: 'https://meskeia.com/calculadora-descuentos/',
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
    title: 'Calculadora de Descuentos Online',
    description: 'Calcula el precio final con descuento y cuánto ahorras.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el precio final después de un descuento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Multiplica el precio original por (1 − descuento/100). Por ejemplo, un artículo de 80 € con un 25% de descuento cuesta 80 × (1 − 0,25) = 60 €. El ahorro es la diferencia: 80 − 60 = 20 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calculan dos descuentos seguidos o encadenados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los descuentos encadenados no se suman directamente. Primero se aplica el primer descuento y luego el segundo sobre el precio ya reducido. Un 20% más un 10% no equivale a un 30%, sino a un 28% total. La fórmula es: precio_final = precio_original × (1 − d1/100) × (1 − d2/100).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve una calculadora de descuentos en Black Friday?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En Black Friday muchas tiendas aplican varios descuentos encadenados o combinan el precio con cupones adicionales. Una calculadora de descuentos permite comprobar rápidamente el precio final real, comparar ofertas de distintas tiendas y detectar si el "descuento" es tan grande como parece respecto al precio habitual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber qué porcentaje de descuento me han aplicado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Divide la diferencia entre el precio original y el precio con descuento entre el precio original, y multiplica por 100. Fórmula: descuento (%) = ((precio_original − precio_final) / precio_original) × 100. Por ejemplo: (50 − 35) / 50 × 100 = 30% de descuento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El IVA se aplica antes o después del descuento en una factura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España el IVA se aplica sobre la base imponible ya reducida por el descuento. Es decir, primero se resta el descuento al precio sin IVA y sobre esa base se calcula el IVA correspondiente (21%, 10% o 4% según el producto). Así, un descuento reduce también la cuota de IVA que se paga.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Descuentos Online - Calcula Rebajas y Ofertas",
  description: "Calculadora de descuentos gratuita. Calcula el precio final con descuento, ahorro en euros y descuentos encadenados. Ideal para rebajas, Black Friday y ofertas.",
  url: 'https://meskeia.com/calculadora-descuentos/',
  category: 'FinanceApplication',
  features: [
  ],
});

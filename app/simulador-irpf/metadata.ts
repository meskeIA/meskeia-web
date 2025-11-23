import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador IRPF 2025 Gratis - Rendimientos Capital Mobiliario | meskeIA',
  description:
    '¿Cuánto pagarás por dividendos y plusvalías en 2025? Calcula IRPF de rendimientos del capital mobiliario: acciones, fondos y criptomonedas con tramos actualizados.',
  keywords: [
    'simulador IRPF 2025',
    'rendimientos capital mobiliario',
    'impuestos dividendos',
    'plusvalías acciones',
    'plusvalías criptomonedas',
    'calculadora fiscal',
    'declaración renta',
    'hacienda',
    'agencia tributaria',
    'meskeIA',
  ],
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Simulador IRPF 2025 Gratis - Rendimientos Capital Mobiliario | meskeIA',
    description:
      'Simulador IRPF 2025 gratuito para calcular impuestos de rendimientos del capital mobiliario. Dividendos, plusvalías de acciones, fondos y criptomonedas.',
    type: 'website',
    url: 'https://meskeia.com/simulador-irpf/',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Simulador IRPF 2025 Gratis | meskeIA',
    description:
      'Calculadora gratuita de IRPF 2025 para rendimientos del capital mobiliario. Dividendos, plusvalías y más.',
  },
};

// JSON-LD para Schema.org
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Simulador IRPF 2025',
  applicationCategory: 'FinanceApplication',
  description:
    'Simulador IRPF 2025 gratuito para calcular impuestos sobre rendimientos del capital mobiliario. Incluye cálculo de impuestos por tramos para intereses, dividendos, plusvalías de acciones, fondos de inversión y criptomonedas según normativa española vigente.',
  url: 'https://meskeia.com/simulador-irpf',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
  },
  operatingSystem: 'Web',
  permissions: 'No requiere permisos',
  price: '0',
  priceCurrency: 'EUR',
  featureList: [
    'Cálculo de IRPF por tramos progresivos (19%, 21%, 23%, 26%, 30%)',
    'Rendimientos de intereses y dividendos',
    'Plusvalías de venta de acciones',
    'Plusvalías de fondos de inversión',
    'Plusvalías de criptomonedas',
    'Tabla detallada por tramos de tributación',
    'Cálculos según normativa 2025',
    'Interfaz responsive y accesible',
  ],
};

// FAQ JSON-LD
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calculan los impuestos del capital mobiliario en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los rendimientos del capital mobiliario tributan por tramos: 19% hasta 6.000€, 21% de 6.000€ a 50.000€, 23% de 50.000€ a 200.000€, 26% de 200.000€ a 300.000€ y 30% por encima de 300.000€.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué incluye el capital mobiliario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Incluye intereses de depósitos y bonos, dividendos de acciones, plusvalías por venta de acciones, fondos de inversión, ETFs, criptomonedas y otros activos financieros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las criptomonedas tributan como capital mobiliario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, las plusvalías obtenidas por la venta de criptomonedas se consideran ganancias patrimoniales y tributan con los mismos tramos que el capital mobiliario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es fiable este simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador utiliza los tramos oficiales de 2025 y proporciona estimaciones precisas para casos generales. Para situaciones complejas, consulte con un asesor fiscal cualificado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo incluir pérdidas en el simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el simulador permite introducir valores negativos para las plusvalías, lo que representa minusvalías que pueden compensar otras ganancias patrimoniales.',
      },
    },
  ],
};

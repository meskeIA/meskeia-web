import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las 6 Clases de Activos: Rentabilidad, Riesgo y Correlación | meskeIA',
  description:
    'Visualizador educativo de las 6 clases de activos: acciones, bonos, inmobiliario, materias primas, criptomonedas y efectivo. Compara rentabilidad histórica, volatilidad, correlación y carteras tipo.',
  keywords: [
    'clases de activos',
    'renta variable fija',
    'diversificación cartera',
    'correlación activos',
    'acciones bonos inmobiliario',
    'educación financiera',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las 6 Clases de Activos — Visualizador Educativo | meskeIA',
    description:
      'Acciones, bonos, inmobiliario, materias primas, cripto y efectivo: rentabilidad histórica, volatilidad, correlación y carteras tipo.',
    url: 'https://meskeia.com/visualizador-tipos-activos/',
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
    title: 'Las 6 Clases de Activos — Visualizador Educativo | meskeIA',
    description:
      'Acciones, bonos, inmobiliario, materias primas, cripto y efectivo: rentabilidad histórica, volatilidad, correlación y carteras tipo.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Visualizador Tipos de Activos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Clases de Activos',
  description:
    'Visualizador educativo interactivo de las 6 clases de activos principales: acciones, bonos, inmobiliario, materias primas, criptomonedas y efectivo. Incluye comparativa de rentabilidad histórica y volatilidad, matriz de correlación entre clases y ejemplos de carteras tipo por perfil de riesgo.',
  url: 'https://meskeia.com/visualizador-tipos-activos/',
  category: 'FinanceApplication',
  features: [
    'Comparativa de 6 clases de activos: rentabilidad, volatilidad y horizonte',
    'Detalle completo de cada clase con ventajas, riesgos y ejemplos',
    'Matriz de correlación entre clases para entender la diversificación',
    '4 carteras tipo (defensiva, equilibrada, crecimiento, especulativa)',
    'Guía educativa sobre diversificación y gestión de riesgo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las principales clases de activos financieros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las seis clases de activos principales son: renta variable (acciones), renta fija (bonos), inmobiliario (REITs e inmuebles directos), materias primas (oro, petróleo, metales), criptomonedas y efectivo o equivalentes. Cada clase tiene un perfil de rentabilidad, riesgo y correlación diferente, lo que las hace complementarias para construir una cartera diversificada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué es importante diversificar entre distintas clases de activos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diversificar entre clases de activos reduce el riesgo total de la cartera porque sus precios no se mueven siempre en la misma dirección. Cuando la renta variable cae, los bonos o el oro suelen comportarse de forma diferente, amortiguando las pérdidas. Una diversificación efectiva no depende solo del número de posiciones, sino de combinar activos con baja correlación entre sí.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué clase de activo ha ofrecido mayor rentabilidad histórica a largo plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Históricamente, la renta variable (acciones) ha sido la clase de activo con mayor rentabilidad a largo plazo, con retornos anualizados del 7-10% en índices globales antes de inflación. Sin embargo, también presenta la mayor volatilidad a corto plazo. Los bonos de gobierno ofrecen menor rentabilidad pero más estabilidad, mientras que el efectivo protege el capital nominal pero pierde poder adquisitivo con la inflación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se elige la proporción de cada clase de activo según el perfil de riesgo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La asignación de activos depende principalmente del horizonte temporal y la tolerancia al riesgo. Un perfil defensivo suele invertir un 70-80% en renta fija y efectivo y un 20-30% en renta variable. Un perfil de crecimiento invierte la proporción contraria. El horizonte temporal es clave: cuanto mayor sea el plazo disponible, mayor peso puede tener la renta variable para aprovechar su prima de rentabilidad a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre invertir directamente en un activo y hacerlo a través de fondos o ETFs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Invertir directamente (comprar acciones o un inmueble físico) requiere mayor capital, conocimiento y gestión activa. Los fondos de inversión y ETFs permiten acceder a una clase de activo de forma diversificada, con costes bajos y alta liquidez. Por ejemplo, un ETF de bonos globales da exposición a cientos de emisores con una sola operación, reduciendo el riesgo de concentración sin necesidad de analizar cada emisor individualmente.',
      },
    },
  ],
};

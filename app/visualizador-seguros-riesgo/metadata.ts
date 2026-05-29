import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seguros y Riesgo | meskeIA',
  description: 'Visualiza cómo funcionan los seguros: tipos, cálculo de prima actuarial, pool de riesgo y mutualización. Aprende la matemática detrás de los seguros.',
  keywords: ['seguros', 'riesgo', 'prima de seguro', 'actuario', 'mutualización', 'seguro de vida', 'seguro de salud'],
  openGraph: {
    title: 'Seguros y Riesgo — meskeIA',
    description: 'Cómo funcionan los seguros: prima actuarial, pool de riesgo y tipos de cobertura.',
    url: 'https://meskeia.com/visualizador-seguros-riesgo/',
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
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Seguros y Riesgo',
  description: 'Herramienta educativa sobre seguros, prima actuarial y gestión del riesgo',
  url: 'https://meskeia.com/visualizador-seguros-riesgo/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la prima de un seguro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prima pura o actuarial se calcula multiplicando la probabilidad de que ocurra el siniestro por la cuantía esperada de la indemnización: Prima pura = P(siniestro) × Indemnización esperada. A esta prima pura se añaden los gastos de gestión y el margen de beneficio de la aseguradora para obtener la prima comercial que paga el asegurado. Cuanto mayor es el riesgo o la cobertura, mayor es la prima.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el pool de riesgo y por qué hace viables los seguros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pool de riesgo es el principio de mutualización: al reunir a muchos asegurados independientes, la variabilidad relativa de las pérdidas totales disminuye. Por la ley de los grandes números, cuanto mayor es el grupo, más predecible se vuelve el coste total, lo que permite a la aseguradora fijar primas estables. Sin este mecanismo, cada individuo tendría que mantener reservas enormes para hacer frente a eventos imprevisibles por sí solo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el seguro de vida de riesgo y el seguro de ahorro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El seguro de vida de riesgo paga una suma asegurada a los beneficiarios solo si el asegurado fallece durante la vigencia de la póliza; si no hay siniestro, la prima no se recupera. El seguro de vida ahorro o mixto combina cobertura de fallecimiento con una componente de capitalización: al vencimiento, el asegurado recibe el capital acumulado. Los planes de ahorro-seguros suelen ofrecer menos rentabilidad que otros vehículos de inversión pero tienen ventajas fiscales en algunos países.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la selección adversa en los seguros y cómo afecta al mercado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La selección adversa ocurre cuando quienes tienen mayor probabilidad de siniestro se aseguran más que los de bajo riesgo, porque conocen mejor su situación que la aseguradora (asimetría de información). Esto eleva las primas promedio, lo que expulsa a los asegurados de bajo riesgo y deja solo a los de alto riesgo, generando una espiral que puede colapsar el mercado. Las aseguradoras lo combaten con cuestionarios médicos, periodos de carencia y segmentación de la cartera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué perfil de usuario es útil este visualizador de seguros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está pensado para estudiantes de economía, finanzas o actuaría que quieran entender intuitivamente los fundamentos matemáticos de los seguros antes de profundizar en los modelos actuariales formales. También es útil para cualquier persona que vaya a contratar un seguro y quiera entender qué factores determinan su precio y qué mecanismos protegen al asegurado.',
      },
    },
  ],
};

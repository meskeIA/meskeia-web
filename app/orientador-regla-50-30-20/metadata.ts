import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Regla 50/30/20 - Distribuye tu Presupuesto | meskeIA',
  description: 'Aplica la regla 50/30/20 de Elizabeth Warren para distribuir tus ingresos: 50% necesidades, 30% deseos, 20% ahorro. Organiza tu presupuesto mensual.',
  keywords: 'regla 50 30 20, presupuesto, finanzas personales, distribuir ingresos, ahorro, necesidades, deseos, elizabeth warren',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Regla 50/30/20 | meskeIA',
    description: 'Distribuye tus ingresos según la regla 50/30/20: necesidades, deseos y ahorro',
    url: 'https://meskeia.com/orientador-regla-50-30-20/',
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
    title: 'Orientador Regla 50/30/20 | meskeIA',
    description: 'Distribuye tus ingresos según la regla 50/30/20: necesidades, deseos y ahorro',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Regla 50/30/20",
  description: "Aplica la regla 50/30/20 de Elizabeth Warren para distribuir tus ingresos: 50% necesidades, 30% deseos, 20% ahorro. Organiza tu presupuesto mensual.",
  url: "https://meskeia.com/orientador-regla-50-30-20/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la regla 50/30/20 y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla 50/30/20 es un método de presupuesto personal popularizado por la senadora Elizabeth Warren en su libro "All Your Worth". Divide los ingresos netos en tres categorías: 50% para necesidades esenciales (alquiler, alimentación, suministros), 30% para deseos y ocio, y el 20% restante para ahorro y pago de deudas. Es una guía orientativa, no una norma rígida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué se considera "necesidad" en la regla 50/30/20?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las necesidades son gastos imprescindibles para vivir y trabajar: alquiler o hipoteca, electricidad, agua, internet, alimentación básica, transporte al trabajo y seguros obligatorios. No incluyen suscripciones de ocio, restaurantes ni ropa no esencial. Si tus necesidades superan el 50% de tus ingresos, conviene revisar gastos fijos o buscar ingresos adicionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil la regla 50/30/20?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para personas que empiezan a organizar sus finanzas personales, quieren ahorrar de forma sistemática sin presupuestos complicados, o tienen ingresos variables. También sirve como punto de partida para quienes nunca han llevado un registro de gastos, ya que las tres categorías son fáciles de recordar y aplicar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería ahorrar al mes según esta regla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla indica destinar el 20% de los ingresos netos al ahorro y a reducir deudas. Con un salario neto de 1.500 € mensuales, el objetivo sería ahorrar 300 € al mes. Este porcentaje incluye tanto el ahorro para emergencias o jubilación como el pago acelerado de deudas como préstamos personales o tarjetas de crédito.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre esta regla y llevar un presupuesto detallado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla 50/30/20 es un método simplificado que requiere muy poco seguimiento: solo clasificar los gastos en tres bloques. Un presupuesto detallado, en cambio, asigna cantidades concretas a cada categoría (ropa, ocio, transporte, etc.) y exige un registro más minucioso. La regla 50/30/20 es ideal si buscas una guía rápida; un presupuesto detallado conviene si quieres optimizar cada partida de gasto.',
      },
    },
  ],
};

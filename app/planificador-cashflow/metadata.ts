import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador Cash Flow - Flujo de Caja a 12 Meses | meskeIA',
  description: 'Proyecta tu flujo de caja mes a mes. Identifica meses críticos, previene crisis de liquidez y simula escenarios What-If. Herramienta gratuita para autónomos y pymes.',
  keywords: 'cash flow, flujo de caja, tesoreria, liquidez, proyeccion financiera, planificacion financiera, pyme, autonomo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador Cash Flow | meskeIA',
    description: 'Proyecta tu flujo de caja a 12 meses. Identifica riesgos de liquidez y planifica mejor tu tesorería.',
    url: 'https://meskeia.com/planificador-cashflow/',
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
    title: 'Planificador Cash Flow | meskeIA',
    description: 'Herramienta gratuita para proyectar tu flujo de caja y prevenir crisis de liquidez.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador Cash Flow",
  description: "Proyecta tu flujo de caja mes a mes. Identifica meses críticos, previene crisis de liquidez y simula escenarios What-If. Herramienta gratuita para autónomos y pymes.",
  url: "https://meskeia.com/planificador-cashflow/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un cash flow o flujo de caja y para qué sirve proyectarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cash flow registra el movimiento real de dinero que entra y sale de un negocio cada mes, a diferencia del beneficio contable. Proyectarlo a 12 meses permite anticipar meses con déficit de liquidez antes de que ocurran, tomar decisiones de financiación con tiempo suficiente y evitar situaciones en las que hay beneficios en papel pero no hay dinero en la cuenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se usa el planificador de flujo de caja?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Introduce el saldo inicial de caja, las entradas previstas (cobros de clientes, subvenciones, financiación) y las salidas (nóminas, alquileres, proveedores, impuestos) para cada uno de los 12 meses. El planificador calcula automáticamente el saldo acumulado mes a mes y señala los períodos con riesgo de saldo negativo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es más útil un planificador de cash flow?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente valioso para autónomos y pequeñas empresas con ingresos estacionales o irregulares, negocios que cobran a 30-90 días pero pagan a proveedor al contado, y emprendedores que acaban de lanzar su actividad. También es útil para detectar el impacto de una nueva inversión o contratación en la liquidez futura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre flujo de caja y cuenta de resultados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuenta de resultados recoge ingresos y gastos cuando se devengan (al emitir o recibir una factura), mientras que el cash flow refleja cuándo entra o sale el dinero realmente. Un negocio puede tener beneficios contables y quedarse sin liquidez si sus clientes tardan en pagar. Por eso la proyección de tesorería es un complemento indispensable de la contabilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los escenarios What-If en la planificación de tesorería?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los escenarios What-If permiten simular situaciones hipotéticas: ¿qué pasa si un cliente importante tarda 30 días más en pagar? ¿O si suben los costes de suministros un 10%? Modificando una variable se ve en tiempo real cómo cambia el saldo acumulado en cada mes, lo que ayuda a tomar decisiones preventivas antes de que el problema sea real.',
      },
    },
  ],
};

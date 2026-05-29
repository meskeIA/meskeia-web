import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Mercados Financieros | Bolsa, Libro de Órdenes y Activos | meskeIA',
  description: 'Cómo funciona la bolsa: libro de órdenes (bid/ask/spread), formación de precios, tipos de activos (acciones, bonos, ETF, derivados), índices bursátiles y participantes del mercado.',
  keywords: ['mercados financieros', 'bolsa', 'libro ordenes', 'bid ask', 'acciones', 'bonos', 'ETF', 'IBEX 35', 'SP500', 'formacion precios'],
  openGraph: {
    title: 'Visualizador de Mercados Financieros | meskeIA',
    description: 'Cómo funciona la bolsa: libro de órdenes, formación de precios, tipos de activos e índices bursátiles.',
    url: 'https://meskeia.com/visualizador-mercados-financieros/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Mercados Financieros - Bolsa, Órdenes y Activos",
  description: "Cómo funciona la bolsa: libro de órdenes (bid/ask/spread), formación de precios, tipos de activos (acciones, bonos, ETF, derivados), índices bursátiles y participantes del mercado.",
  url: "https://meskeia.com/visualizador-mercados-financieros/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se forma el precio de una acción en bolsa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio de una acción se determina por el cruce de oferta y demanda en el libro de órdenes. Los compradores publican órdenes de compra (bid) y los vendedores órdenes de venta (ask); la transacción se ejecuta cuando ambos precios coinciden. La diferencia entre el mejor bid y el mejor ask se llama spread, e indica la liquidez del activo: cuanto menor sea el spread, más eficiente es el mercado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una acción, un bono y un ETF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una acción representa una participación en el capital de una empresa y da derecho a dividendos y votaciones. Un bono es un préstamo al emisor (empresa o Estado) que paga intereses periódicos y devuelve el principal al vencimiento. Un ETF (fondo cotizado) replica un índice o cesta de activos y se negocia en bolsa como una acción, ofreciendo diversificación a bajo coste.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el IBEX 35 y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IBEX 35 es el principal índice bursátil español, compuesto por las 35 empresas de mayor liquidez cotizadas en el mercado continuo. Se calcula ponderando la capitalización bursátil ajustada por el free float (acciones disponibles para el mercado), de modo que las empresas más grandes tienen más peso. Se revisa dos veces al año por el Comité Asesor Técnico de BME.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los derivados financieros y para qué se usan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los derivados son contratos cuyo valor depende de un activo subyacente (acción, índice, divisa, materias primas). Los más comunes son futuros, opciones y swaps. Se usan principalmente para cobertura de riesgo (hedging), especulación apalancada o arbitraje. Al implicar apalancamiento, pueden generar pérdidas superiores al capital inicial invertido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quiénes participan en los mercados financieros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales participantes son: inversores minoristas (personas físicas), inversores institucionales (fondos de pensiones, aseguradoras, hedge funds), market makers (entidades que garantizan liquidez publicando bid y ask), bancos de inversión, bancos centrales (que intervienen en divisas y deuda) y brókers que actúan como intermediarios entre compradores y vendedores.',
      },
    },
  ],
};

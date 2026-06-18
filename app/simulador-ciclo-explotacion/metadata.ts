import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Ciclo de Explotación - PME, PMF y Fondo de Maniobra | meskeIA',
  description: 'Visualiza el ciclo operativo de tu empresa: período de maduración económico (PME), financiero (PMF) y fondo de maniobra necesario. Modo industrial y comercial.',
  keywords: 'ciclo de explotacion, periodo de maduracion economico, periodo de maduracion financiero, fondo de maniobra necesario, PME PMF, ciclo operativo empresa, plazo cobro pago, gestion circulante',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador del Ciclo de Explotación - PME y Fondo de Maniobra | meskeIA',
    description: 'Calcula el período de maduración económico (PME) y financiero (PMF) de tu empresa con diagrama visual. Modo industrial y comercial. Fondo de maniobra necesario incluido.',
    url: 'https://meskeia.com/simulador-ciclo-explotacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Ciclo de Explotación - meskeIA',
    description: 'Visualiza el ciclo operativo de tu empresa: stock, fabricación, cobro y pago. Calcula PME, PMF y el fondo de maniobra que necesitas.',
  },
  other: {
    'application-name': 'Simulador Ciclo de Explotación meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Ciclo de Explotación',
  description: 'Herramienta para visualizar y calcular el ciclo operativo de una empresa: el tiempo desde que se paga a proveedores hasta que se cobra a clientes. Calcula el Período de Maduración Económico (PME), el Período de Maduración Financiero (PMF) y el Fondo de Maniobra necesario para financiar el ciclo. Disponible para empresas industriales (con fabricación) y comerciales (sin fabricación).',
  url: 'https://meskeia.com/simulador-ciclo-explotacion/',
  category: 'FinanceApplication',
  features: [
    'Diagrama Gantt visual del ciclo económico y financiero de la empresa',
    'Modo empresa industrial (MP → Fabricación → PT → Cobro) y comercial (Stock → Cobro)',
    'Cálculo del PME, PMF y Fondo de Maniobra necesario',
    'Tres ejemplos predefinidos: industrial, comercial y servicios',
    'Semáforo de alerta según la duración del PMF',
    'Visualización de qué parte del ciclo financia el proveedor (PMP)',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ciclo de explotación de una empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo de explotación es el proceso que abarca desde que la empresa desembolsa dinero para adquirir materias primas o mercancías hasta que recupera ese dinero cobrando a sus clientes. En una empresa industrial incluye el almacenamiento de materias primas, la fabricación, el almacenamiento de producto terminado y el cobro. En una empresa comercial simplemente va del stock a la venta y el cobro. Su duración determina cuánto capital circulante necesita la empresa para funcionar sin interrupciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el PME y el PMF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Período de Maduración Económico (PME) es el tiempo total que tarda la empresa en completar su ciclo operativo: desde que entra la materia prima (o la mercancía) hasta que se cobra al cliente. El Período de Maduración Financiero (PMF) es el PME menos el Período Medio de Pago a proveedores (PMP). Es decir, el PMF es el número de días que la empresa debe financiar con recursos propios o préstamos, porque una parte del ciclo ya está financiada por los proveedores. Un PMF bajo o negativo indica una buena posición de tesorería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Fondo de Maniobra necesario y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Fondo de Maniobra necesario es el importe en euros que la empresa necesita tener disponible para financiar los días de su ciclo operativo que los proveedores no cubren (el PMF). Se calcula multiplicando el PMF por el coste operativo diario de la empresa (costes anuales dividido entre 365). Por ejemplo, si el PMF es 45 días y los costes anuales son 1.000.000 €, el Fondo de Maniobra necesario es 45 × (1.000.000 / 365) ≈ 123.287 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre si el PMF es negativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un PMF negativo significa que los proveedores financian todo el ciclo operativo y además abonan una parte antes de que la empresa tenga que pagar nada. Esto es habitual en grandes superficies de distribución (cobran al contado y pagan a 90 días) y en negocios con suscripción anticipada. En estos casos el Fondo de Maniobra necesario es 0 y la empresa puede incluso tener un excedente de tesorería estructural. Es una posición financiera muy favorable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puede una empresa reducir su ciclo de explotación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las palancas principales son: reducir el stock de materias primas y de producto terminado mediante técnicas just-in-time o mejor previsión de demanda; acortar el tiempo de fabricación con mejoras de proceso; anticipar el cobro de clientes mediante factoring o descuentos por pronto pago; y ampliar el plazo de pago a proveedores negociando confirming o aplazamientos. Cada día que se reduce el PMF equivale a liberar un importe equivalente al coste diario de la empresa en capital circulante.',
      },
    },
  ],
};

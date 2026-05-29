import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Control de Gastos Mensual - Gestiona tu Presupuesto | meskeIA',
  description: 'Controla tus gastos mensuales por categorías. Registra ingresos y gastos, visualiza estadísticas y gestiona tu presupuesto familiar de forma sencilla.',
  keywords: 'control gastos, presupuesto mensual, gestión gastos, finanzas personales, ahorro, categorías gastos, presupuesto familiar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Control de Gastos Mensual | meskeIA',
    description: 'Gestiona tu presupuesto con categorías y estadísticas visuales.',
    url: 'https://meskeia.com/control-gastos/',
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
    title: 'Control de Gastos Mensual | meskeIA',
    description: 'Controla y visualiza tus gastos mensuales por categorías.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Control de Gastos",
  description: "Controla tus gastos mensuales por categorías. Registra ingresos y gastos, visualiza estadísticas y gestiona tu presupuesto familiar de forma sencilla.",
  url: "https://meskeia.com/control-gastos/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo puedo empezar a controlar mis gastos mensuales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El primer paso es registrar todos los ingresos y gastos del mes, clasificándolos por categorías como alimentación, vivienda, transporte, ocio o salud. Con un registro de dos o tres meses ya puedes identificar patrones: qué categorías consumen más, cuáles son prescindibles y cuánto queda disponible para ahorro. Una hoja de cálculo o una herramienta de presupuesto digital facilitan esta tarea considerablemente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas categorías de gastos debería usar para gestionar mi presupuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre 8 y 12 categorías suele ser el rango más manejable. Demasiadas categorías hacen el seguimiento tedioso y se abandonan; muy pocas no permiten identificar dónde se produce el gasto excesivo. Las categorías básicas habituales son: vivienda, alimentación, transporte, suministros, ocio, salud, ropa, educación y ahorro. Puedes adaptar esta estructura a tus hábitos reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué porcentaje de mis ingresos debería destinar al ahorro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un porcentaje universal: depende de tus ingresos, gastos fijos y objetivos vitales. Una referencia orientativa es la regla 50/30/20 (50% necesidades, 30% deseos, 20% ahorro), pero muchos hogares con ingresos medios o bajos no pueden llegar a ese 20%. Lo más importante es que el ahorro sea un gasto fijo prioritario, no lo que "sobra" al final del mes. Incluso ahorrar el 5-10% de forma consistente genera un fondo de emergencia en pocos años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve visualizar las estadísticas de gastos por categoría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los gráficos y estadísticas por categoría permiten ver de un vistazo qué partidas se llevan la mayor parte del presupuesto, comparar meses anteriores y detectar gastos que han crecido sin que lo hayas notado. Esta visión global es más efectiva que revisar transacción por transacción, porque facilita tomar decisiones concretas: reducir una categoría específica, ajustar el presupuesto o reasignar fondos hacia el ahorro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre presupuesto y control de gastos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El presupuesto es un plan previo: defines cuánto puedes gastar en cada categoría antes de que ocurra. El control de gastos es el seguimiento posterior: registras lo que realmente has gastado. Ambos son complementarios. Sin presupuesto, el control solo informa; sin control, el presupuesto es solo un deseo. La combinación de fijar límites por categoría y revisar el gasto real cada mes es la base de una gestión financiera personal efectiva.',
      },
    },
  ],
};

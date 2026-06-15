import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Viaje de tus Impuestos - ¿A dónde va tu dinero? | meskeIA',
  description: 'Visualiza cómo se reparten los Presupuestos Generales del Estado. Gráfico interactivo con desglose por partida: pensiones, sanidad, educación, defensa y más.',
  keywords: 'presupuestos generales estado, impuestos españa, gasto público, pensiones, sanidad, educación, deuda pública, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Viaje de tus Impuestos - ¿A dónde va tu dinero?',
    description: 'Gráfico interactivo del gasto público en España. Descubre cuánto de tus impuestos va a pensiones, sanidad, educación y más.',
    url: 'https://meskeia.com/visualizador-viaje-impuestos/',
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
    title: 'El Viaje de tus Impuestos',
    description: '¿A dónde va tu dinero? Visualiza el gasto público español con gráficos interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Viaje Impuestos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Viaje de tus Impuestos',
  description: 'Explicador visual interactivo sobre el destino de los impuestos en España. Gráfico de los Presupuestos Generales del Estado con desglose por partida y cálculo personalizado según tu aportación.',
  url: 'https://meskeia.com/visualizador-viaje-impuestos/',
  features: [
    'Gráfico doughnut interactivo del gasto público español',
    'Desglose de cada partida presupuestaria con explicación',
    'Calculadora: cuánto aportas tú a cada partida según tu IRPF',
    'Datos de los PGE 2025',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿A dónde va el dinero de los impuestos en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mayor destino del gasto público en España son las pensiones y la Seguridad Social, que representan en torno al 40% del presupuesto. Le siguen la sanidad, la deuda pública (intereses), la educación y las transferencias a comunidades autónomas. El desglose exacto varía cada año según los Presupuestos Generales del Estado aprobados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los Presupuestos Generales del Estado y quién los aprueba?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los Presupuestos Generales del Estado (PGE) son el documento que recoge todos los ingresos y gastos previstos por el Gobierno de España para un año. Los elabora el Ministerio de Hacienda y deben ser aprobados por las Cortes Generales (Congreso y Senado). Si no se aprueban nuevos, los del año anterior se prorrogan automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo saber cuánto de mis impuestos va a cada partida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Introduciendo el importe aproximado que pagas de IRPF al año, la herramienta calcula tu aportación proporcional a cada partida del presupuesto: cuántos euros van a pensiones, cuántos a sanidad, cuántos a defensa, etc. Es una estimación basada en el reparto porcentual de los PGE 2025.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre gasto corriente y gasto de capital en el presupuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El gasto corriente cubre operaciones recurrentes: sueldos de funcionarios, prestaciones sociales, intereses de la deuda o compra de suministros. El gasto de capital financia inversiones que generan activos a largo plazo, como infraestructuras, equipamiento o transferencias de capital a empresas públicas. En España, el gasto corriente supone la mayor parte del presupuesto total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto gasta España en defensa comparado con otros países europeos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'España dedica en torno al 1,3% de su PIB a defensa, por debajo de la media de la OTAN (2%) y de países como Francia, Alemania o Polonia. En términos del presupuesto total del Estado, el gasto en defensa representa alrededor del 3-4%, claramente inferior al peso de las pensiones o la sanidad.',
      },
    },
  ],
};

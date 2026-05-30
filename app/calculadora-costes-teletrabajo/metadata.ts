import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Costes Teletrabajo vs Oficina — Ahorro Real | meskeIA',
  description:
    'Calcula el ahorro o coste real de trabajar desde casa frente a ir a la oficina: transporte, comidas, electricidad, ropa y más. Resultado mensual y anual.',
  keywords:
    'calculadora teletrabajo, ahorro teletrabajo, coste trabajar desde casa, teletrabajo vs oficina, ahorro trabajar en casa, gastos teletrabajo, calculadora trabajo remoto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Costes Teletrabajo vs Oficina',
    description:
      '¿Cuánto ahorras (o gastas) trabajando desde casa? Calcula tu ahorro real en transporte, comidas, electricidad y ropa.',
    url: 'https://meskeia.com/calculadora-costes-teletrabajo/',
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
    title: 'Calculadora Costes Teletrabajo vs Oficina',
    description:
      '¿Vale la pena el teletrabajo económicamente? Calcula el ahorro real comparando todos los gastos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Costes Teletrabajo",
  description: "Calcula el ahorro o coste real de trabajar desde casa frente a ir a la oficina: transporte, comidas, electricidad, ropa y más. Resultado mensual y anual.",
  url: "https://meskeia.com/calculadora-costes-teletrabajo/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto dinero se ahorra al mes trabajando desde casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ahorro varía enormemente según la situación personal. El principal factor es el transporte: quien usa coche o transporte público para desplazarse a diario puede ahorrar entre 100 y 300 € al mes. Las comidas fuera suponen otro ahorro significativo. Sin embargo, el teletrabajo añade costes en electricidad, calefacción y conexión a internet, que en invierno pueden superar los 50 € mensuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos aumentan cuando se trabaja desde casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al teletrabajar suben principalmente la factura eléctrica (ordenador, iluminación, calefacción o aire acondicionado durante toda la jornada), el consumo de internet y, en algunos casos, la alimentación en casa si no se cocinaba antes. También puede haber gastos puntuales de mobiliario o equipamiento ergonómico para el espacio de trabajo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo deducir los gastos de teletrabajo en la declaración de la renta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para empleados por cuenta ajena en España, los gastos de teletrabajo generalmente no son deducibles en el IRPF de forma directa. La empresa sí puede compensar al empleado hasta 7 € diarios exentos de tributación según la normativa vigente. Los autónomos tienen más posibilidades de deducción proporcional de suministros si trabajan desde casa y cumplen los requisitos de la AEAT.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona esta calculadora de costes de teletrabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La calculadora compara los gastos mensuales de trabajar en oficina (transporte, comidas, ropa profesional) frente a los de teletrabajar (electricidad extra, internet, consumibles). Introduces tus datos reales —días al mes en cada modalidad, coste de desplazamiento, precio del menú, etc.— y obtienes el ahorro o sobrecoste neto mensual y anual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El teletrabajo siempre es más barato que ir a la oficina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No necesariamente. Para personas que viven cerca del trabajo o que ya cocinan en casa, el ahorro puede ser modesto. Además, el teletrabajo eleva el gasto energético del hogar, que en determinadas épocas del año puede compensar parcialmente lo ahorrado en transporte. La calculadora permite ver el balance real según cada caso concreto.',
      },
    },
  ],
};

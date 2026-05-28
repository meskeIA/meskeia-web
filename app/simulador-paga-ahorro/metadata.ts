import { Metadata } from 'next';

const title = 'Simulador de Paga y Ahorro — Aprende a gestionar tu dinero | meskeIA';
const description = 'Herramienta educativa para jóvenes: gestiona tu paga semanal o mensual, distribuye gastos por categorías y aprende a ahorrar con objetivos visuales.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'paga semanal, ahorrar paga, gestionar dinero joven, educacion financiera jovenes, ahorro adolescentes, presupuesto paga, mesada ahorro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Paga y Ahorro | meskeIA',
    description,
    url: 'https://meskeia.com/simulador-paga-ahorro/',
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
    title: 'Simulador de Paga y Ahorro | meskeIA',
    description: 'Aprende a gestionar tu paga y ahorrar con objetivos visuales',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Simulador de Paga y Ahorro',
  description,
  url: 'https://meskeia.com/simulador-paga-ahorro/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo puedo aprender a ahorrar con mi paga semanal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para ahorrar con una paga semanal, lo más efectivo es separar un porcentaje fijo antes de gastar. Una regla habitual es reservar el 20% nada más recibirla. Distribuir el resto en categorías concretas (ocio, transporte, caprichos) ayuda a no sobrepasar el presupuesto y a visualizar el progreso hacia un objetivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A partir de qué edad es recomendable empezar a gestionar una paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de expertos en educación financiera sugieren introducir una paga gestionada por el propio niño entre los 8 y los 10 años. A esa edad ya comprenden la diferencia entre necesidades y deseos y pueden registrar ingresos y gastos simples. La paga se convierte así en una práctica de hábitos financieros antes de manejar dinero real en la adolescencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería ahorrar un adolescente de su paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una cifra universal, pero una orientación frecuente es ahorrar entre el 10% y el 30% de la paga, dependiendo del objetivo que se tenga. Si el objetivo es comprar algo concreto en pocos meses, conviene acercarse al 30%. Si la paga cubre también gastos cotidianos, el 10-15% puede ser más sostenible sin renunciar a todo el ocio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un simulador de ahorro de una simple hoja de cálculo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un simulador de ahorro guía al usuario paso a paso, propone categorías de gasto y calcula automáticamente cuánto tiempo tardará en alcanzar un objetivo concreto. Una hoja de cálculo exige conocimientos previos de fórmulas y diseño. Para personas sin experiencia financiera, el simulador reduce la barrera de entrada y hace el proceso visual y motivador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la regla 50/30/20 y se puede aplicar a una paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla 50/30/20 es una guía de distribución del presupuesto: 50% para necesidades, 30% para deseos y 20% para ahorro. Fue popularizada por la senadora estadounidense Elizabeth Warren. Puede adaptarse a una paga ajustando los porcentajes según la edad y los compromisos de gasto habituales del joven.',
      },
    },
  ],
};

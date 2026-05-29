import { Metadata } from 'next';

const title = 'Juego de Presupuesto Mensual — ¿Llegas a fin de mes? | meskeIA';
const description = 'Juego educativo: gestiona un presupuesto mensual real con escenarios y decisiones. Aprende a priorizar gastos, ahorrar y reaccionar ante imprevistos. Para jóvenes y adultos.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'juego presupuesto, educacion financiera juego, simulador presupuesto mensual, aprender finanzas jovenes, gestionar dinero juego, presupuesto primer sueldo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego de Presupuesto Mensual | meskeIA',
    description,
    url: 'https://meskeia.com/juego-presupuesto-mensual/',
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
    title: 'Juego de Presupuesto Mensual | meskeIA',
    description: '¿Puedes llegar a fin de mes? Juego educativo de gestión de presupuesto',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Juego de Presupuesto Mensual',
  description,
  url: 'https://meskeia.com/juego-presupuesto-mensual/',
  applicationCategory: 'GameApplication',
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
      name: '¿Qué es un juego educativo de presupuesto mensual y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una simulación interactiva en la que el jugador gestiona ingresos y gastos reales durante un mes virtual, tomando decisiones sobre alimentación, vivienda, ocio y ahorro. El objetivo es aprender a priorizar gastos y anticipar imprevistos en un entorno sin consecuencias reales, desarrollando habilidades financieras básicas de forma práctica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A partir de qué edad es adecuado este juego de finanzas personales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El juego está diseñado para jóvenes a partir de 14-16 años y adultos de cualquier edad que quieran mejorar su manejo del dinero. Es especialmente útil para quienes acaban de recibir su primer sueldo, estudiantes universitarios que empiezan a gestionar su propio presupuesto, o cualquier persona que quiera practicar la planificación mensual antes de aplicarla en la vida real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la mecánica del juego de presupuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El jugador parte de unos ingresos mensuales ficticios y debe distribuirlos entre gastos fijos (alquiler, transporte, facturas), variables (alimentación, ocio) y ahorro. A lo largo del mes aparecen eventos inesperados (averías, gastos médicos, oportunidades) que requieren ajustes. Al final se muestra el balance y una valoración de las decisiones tomadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia a este juego de una simple calculadora de presupuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una calculadora de presupuesto registra datos estáticos; este juego introduce escenarios dinámicos con decisiones y consecuencias. La dimensión lúdica activa la toma de decisiones bajo presión y permite ver el impacto emocional de los imprevistos financieros, algo que una hoja de cálculo no puede simular. El aprendizaje es más efectivo porque se basa en la experiencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se necesita registrarse o instalar algo para jugar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, el juego funciona completamente en el navegador sin necesidad de crear una cuenta ni descargar ninguna aplicación. Es gratuito y accesible desde cualquier dispositivo, incluyendo móvil y tablet. Los resultados y el progreso de la partida actual se muestran en pantalla durante la sesión.',
      },
    },
  ],
};

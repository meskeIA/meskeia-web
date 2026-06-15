import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Diversificación de Clientes Freelance | meskeIA',
  description: 'Analiza la concentración de tu cartera de clientes con el índice Herfindahl. Detecta dependencia excesiva y riesgo de falso autónomo.',
  keywords: 'diversificación clientes, concentración cartera, Herfindahl, falso autónomo, freelance, dependencia cliente, TRADE, HHI',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Diversificación de Clientes Freelance | meskeIA',
    description: 'Analiza la concentración de tu cartera de clientes con el índice Herfindahl. Detecta dependencia excesiva y riesgo de falso autónomo.',
    url: 'https://meskeia.com/orientador-diversificacion-clientes/',
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
    title: 'Orientador de Diversificación de Clientes Freelance | meskeIA',
    description: 'Analiza la concentración de tu cartera de clientes con el índice Herfindahl. Detecta dependencia excesiva y riesgo de falso autónomo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Diversificación Clientes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Diversificación de Clientes Freelance',
  description: 'Analiza la concentración de tu cartera de clientes con el índice Herfindahl-Hirschman (HHI). Detecta dependencia excesiva, riesgo de falso autónomo (TRADE) y sugiere estrategias de diversificación.',
  url: 'https://meskeia.com/orientador-diversificacion-clientes/',
  features: [
    'Cálculo del índice Herfindahl-Hirschman (HHI) para freelancers',
    'Detección de riesgo de falso autónomo (TRADE, art. 11 LETA)',
    'Gráfico donut de distribución de clientes',
    'Escenarios comparativos (actual, ideal, sin cliente principal)',
    'Estrategias personalizadas de diversificación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el índice Herfindahl-Hirschman (HHI) y para qué sirve a un freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El índice Herfindahl-Hirschman (HHI) mide la concentración de mercado calculando la suma de los cuadrados de las cuotas de participación de cada elemento. Aplicado a una cartera freelance, indica cuánto depende tu facturación de unos pocos clientes. Un HHI cercano a 10.000 indica dependencia total de un único cliente; por debajo de 1.500 se considera una cartera razonablemente diversificada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se considera que un autónomo es TRADE o falso autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según el artículo 11 de la Ley del Estatuto del Trabajo Autónomo (LETA), se considera Trabajador Autónomo Económicamente Dependiente (TRADE) cuando el 75 % o más de los ingresos proviene de un único cliente. Esta situación puede conllevar obligaciones contractuales específicas y, si la relación tiene rasgos laborales, riesgo de ser considerado falso autónomo con sanciones para la empresa contratante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos clientes necesito para tener una cartera freelance equilibrada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un número mágico, pero una cartera saludable suele distribuir los ingresos de forma que ningún cliente supere el 40-50 % de la facturación total. Con 4-6 clientes activos de tamaño similar se puede mantener un HHI bajo y reducir el riesgo de que la pérdida de uno comprometa la viabilidad del negocio. La diversificación ideal depende también del sector y del tipo de proyectos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué estrategias existen para diversificar clientes como freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales estrategias incluyen: buscar clientes en sectores distintos para reducir exposición a ciclos económicos concretos, combinar proyectos puntuales con contratos recurrentes, desarrollar productos o servicios propios con ingresos pasivos, y mantener una prospección activa incluso cuando se trabaja a plena capacidad. Diversificar por tamaño de cliente (grandes y pequeños) también reduce el riesgo de dependencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia la concentración de cartera freelance de la diversificación de inversiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aunque ambos conceptos usan el índice HHI y principios similares, la diversificación de cartera freelance se centra en riesgo de ingresos operativos (perder un cliente afecta la liquidez inmediata), mientras que la diversificación de inversiones gestiona riesgo patrimonial a largo plazo. En la práctica, un freelance debe diversificar tanto su cartera de clientes como sus ahorros e inversiones para una protección financiera completa.',
      },
    },
  ],
};

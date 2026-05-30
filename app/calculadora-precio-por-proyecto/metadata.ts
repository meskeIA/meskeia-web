import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Precio por Proyecto Freelance | meskeIA',
  description: 'Calcula cuánto cobrar por un proyecto freelance completo. Horas estimadas, complejidad, imprevistos, gastos y margen de negociación.',
  keywords: 'precio proyecto freelance, presupuesto freelance, cobrar proyecto, tarifa proyecto, calcular precio, autónomo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Precio por Proyecto Freelance | meskeIA',
    description: 'Estima cuánto cobrar por un proyecto freelance completo con desglose, imprevistos y rango de negociación.',
    url: 'https://meskeia.com/calculadora-precio-por-proyecto/',
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
    title: 'Calculadora de Precio por Proyecto Freelance | meskeIA',
    description: 'Calcula el precio justo de tu próximo proyecto freelance. Desglose completo y rango de negociación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Precio por Proyecto meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Precio por Proyecto Freelance',
  description: 'Herramienta gratuita para estimar el precio de un proyecto freelance completo. Calcula horas, complejidad, urgencia, imprevistos y gastos para obtener un rango de negociación profesional.',
  url: 'https://meskeia.com/calculadora-precio-por-proyecto/',
  features: [
    'Cálculo de precio por proyecto con desglose detallado',
    'Rango de negociación: precio mínimo, recomendado e ideal',
    'Multiplicadores de complejidad y urgencia',
    'Margen de imprevistos configurable',
    'Métricas útiles: tarifa efectiva, duración estimada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el precio de un proyecto freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio de un proyecto freelance se obtiene multiplicando las horas estimadas por la tarifa horaria y ajustando por factores como complejidad, urgencia y gastos directos. A esto se añade un margen de imprevistos (habitualmente un 10-20%) para cubrir revisiones no previstas o problemas técnicos. El resultado suele expresarse como un rango entre un precio mínimo aceptable y un precio ideal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debo cobrar por un proyecto si soy autónomo o freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una cifra universal: depende de tu tarifa horaria, el tipo de proyecto, su complejidad y el plazo de entrega. Como referencia, un desarrollador web freelance en España cobra entre 30 € y 90 €/h, mientras que diseñadores y consultores se mueven en rangos similares. Lo fundamental es calcular primero cuántas horas reales requiere el proyecto y añadir los gastos asociados antes de presentar un presupuesto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre cobrar por hora y cobrar por proyecto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cobrar por hora traslada el riesgo al cliente: si el proyecto se alarga, cobra más. Cobrar por proyecto fija un precio cerrado, lo que el cliente valora porque controla su presupuesto, pero implica que el profesional asume el riesgo de desviaciones. Por eso es clave estimar con precisión y añadir un margen de imprevistos cuando se trabaja con precio fijo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el margen de imprevistos y cuánto debería incluir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El margen de imprevistos es un porcentaje adicional sobre el precio base que cubre situaciones no previstas: cambios de alcance del cliente, problemas técnicos inesperados o revisiones extra. Para proyectos cortos y bien definidos se recomienda un 10%; para proyectos complejos o con alcance abierto, un 20-25% es habitual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el rango de negociación en un presupuesto freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rango de negociación presenta tres cifras: el precio mínimo por debajo del cual el proyecto no es rentable, el precio recomendado que equilibra competitividad y margen, y el precio ideal que maximiza el beneficio. Tener este rango permite ceder en la negociación sin comprometer la viabilidad económica del trabajo.',
      },
    },
  ],
};

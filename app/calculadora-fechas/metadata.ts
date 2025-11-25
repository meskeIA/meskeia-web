/**
 * Metadata para Calculadora de Fechas - meskeIA
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Fechas Online | Diferencia entre Fechas y Edad - meskeIA',
  description:
    'Calculadora de fechas profesional: diferencia entre fechas, suma/resta días, edad exacta y día de la semana. Herramienta gratuita con resultados precisos en español.',
  keywords: [
    'calculadora fechas',
    'diferencia entre fechas',
    'calcular edad',
    'sumar días',
    'restar fechas',
    'día de la semana',
    'edad exacta',
    'calculadora temporal',
  ],
  openGraph: {
    title: 'Calculadora de Fechas Online | meskeIA',
    description:
      'Calcula diferencias entre fechas, suma/resta días, determina edades exactas y días de la semana',
    type: 'website',
    locale: 'es_ES',
  },
};

// Schema.org JSON-LD para SEO
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Fechas',
  description:
    'Herramienta online gratuita para calcular diferencias entre fechas, edades, sumar o restar días y determinar días de la semana',
  url: 'https://meskeia.com/calculadora-fechas/',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  creator: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};

// Schema.org FAQ
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo calculo la diferencia entre dos fechas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona la fecha inicial y la fecha final en la primera calculadora. La herramienta te mostrará la diferencia en días, semanas, meses y años con precisión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La calculadora considera los años bisiestos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, nuestra calculadora tiene en cuenta los años bisiestos, los diferentes días de cada mes y proporciona cálculos precisos considerando el calendario gregoriano actual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo calcular fechas futuras?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por supuesto. Puedes sumar días, semanas, meses o años a cualquier fecha base para obtener una fecha futura. También puedes restar tiempo para obtener fechas pasadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé qué día de la semana fue una fecha histórica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Usa la calculadora "Día de la semana" e introduce cualquier fecha desde 1900. Te dirá exactamente qué día de la semana fue y cuánto tiempo ha pasado desde entonces.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La calculadora de edad es precisa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Totalmente. La calculadora de edad proporciona la edad exacta en años, meses y días, además de información adicional como días totales vividos y días hasta el próximo cumpleaños.',
      },
    },
  ],
};

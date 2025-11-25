import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor de Tallas Internacional Gratis - Ropa, Calzado y Complementos | meskeIA',
  description:
    '¿Qué talla es una 38 EU en USA? Conversor de tallas internacional para ropa y calzado (ES/EU, US, UK). Incluye hombre, mujer y niños. Perfecto para compras online.',
  keywords: [
    'conversor tallas',
    'tallas internacionales',
    'tallas europa',
    'tallas usa',
    'tallas uk',
    'calzado internacional',
    'ropa internacional',
    'equivalencia tallas',
    'compras online',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Tallas Internacional Gratis | meskeIA',
    description:
      'Herramienta gratuita para convertir tallas internacionales. Ropa de hombre y mujer, calzado, anillos, guantes y gorros. Convierte entre ES/EU, US y UK fácilmente.',
    url: 'https://meskeia.com/conversor-tallas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de Tallas Internacional Gratis | meskeIA',
    description:
      'Convierte tallas de ropa, calzado y complementos entre sistemas ES/EU, US y UK. Perfecto para compras online internacionales.',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Conversor de Tallas Internacional',
  description:
    'Aplicación web gratuita para convertir tallas internacionales de ropa, calzado y complementos entre sistemas ES/EU, US y UK. Ideal para compras online internacionales con conversiones precisas.',
  url: 'https://meskeia.com/conversor-tallas/',
  applicationCategory: 'Shopping',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
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

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el conversor de tallas internacional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona el tipo de prenda (ropa hombre/mujer, calzado, complementos), elige tu sistema de tallas actual (ES/EU, US, UK), introduce tu talla y obtendrás las equivalencias automáticamente en los otros sistemas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sistemas de tallas soporta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Soportamos conversiones entre España/Europa (ES/EU), Estados Unidos (US) y Reino Unido (UK) para ropa de hombre y mujer, calzado de todas las edades, anillos, guantes y gorros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son exactas las conversiones de tallas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las conversiones son aproximadas basadas en estándares internacionales. Cada marca puede variar, por lo que recomendamos consultar siempre la guía de tallas específica del fabricante antes de comprar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo convertir tallas de calzado en centímetros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, nuestro conversor de calzado también muestra la longitud aproximada del pie en centímetros, lo cual es muy útil para comparar con las medidas exactas del fabricante.',
      },
    },
  ],
};

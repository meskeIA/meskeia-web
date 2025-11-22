import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Contraseñas Seguras | meskeIA',
  description:
    'Generador de contraseñas seguras con algoritmos criptográficos avanzados. Personaliza longitud, caracteres y genera contraseñas imposibles de descifrar. 100% privado y gratuito.',
  keywords: [
    'generador contraseñas',
    'password generator español',
    'contraseñas seguras',
    'seguridad online',
    'ciberseguridad',
    'contraseñas aleatorias',
    'generador passwords',
    'contraseñas fuertes',
    'seguridad informática',
    'protección datos',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: 'Generador de Contraseñas Seguras - meskeIA',
    description:
      'Crea contraseñas ultra seguras con criptografía avanzada. Personalizable, privado, sin registro. Protege tus cuentas con la mejor seguridad.',
    url: 'https://meskeia.com/generador-contrasenas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Generador de Contraseñas Seguras - meskeIA',
    description:
      'Herramienta gratuita para generar contraseñas ultra seguras con criptografía de nivel militar',
  },
  alternates: {
    canonical: 'https://meskeia.com/generador-contrasenas/',
  },
};

// Schema.org JSON-LD
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Generador de Contraseñas Seguras',
  description:
    'Generador de contraseñas ultra seguras con algoritmos criptográficos avanzados y opciones personalizables',
  url: 'https://meskeia.com/generador-contrasenas/',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  inLanguage: 'es-ES',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1250',
  },
};

/**
 * Metadata para Generador de Contraseñas - meskeIA
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Contraseñas Seguras | meskeIA',
  description:
    'Genera contraseñas seguras y aleatorias con diferentes niveles de complejidad. Herramienta gratuita con opciones personalizables de longitud, mayúsculas, números y símbolos.',
  keywords: [
    'generador contraseñas',
    'contraseñas seguras',
    'password generator',
    'generador passwords',
    'crear contraseña',
    'contraseña aleatoria',
    'seguridad online',
    'contraseñas fuertes',
  ],
  openGraph: {
    title: 'Generador de Contraseñas Seguras | meskeIA',
    description:
      'Genera contraseñas seguras y aleatorias con diferentes niveles de complejidad',
    type: 'website',
    locale: 'es_ES',
  },
};

// Schema.org JSON-LD para SEO
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Generador de Contraseñas Seguras',
  description:
    'Herramienta gratuita para generar contraseñas seguras y aleatorias con opciones personalizables',
  url: 'https://meskeia.com/generador-contrasenas',
  applicationCategory: 'UtilitiesApplication',
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

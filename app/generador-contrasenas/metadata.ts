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
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

// Schema.org JSON-LD para SEO
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Generador de Contraseñas Seguras',
  description:
    'Herramienta gratuita para generar contraseñas seguras y aleatorias con opciones personalizables',
  url: 'https://meskeia.com/generador-contrasenas/',
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos caracteres debe tener una contraseña segura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los expertos en ciberseguridad recomiendan un mínimo de 12 caracteres para cuentas personales y 16 o más para cuentas críticas como banca o correo electrónico. A mayor longitud, más combinaciones posibles y más difícil resulta un ataque por fuerza bruta. Una contraseña de 16 caracteres con letras, números y símbolos tardaría miles de millones de años en romperse con hardware actual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro generar contraseñas en el navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, siempre que la generación se realice localmente sin enviar datos a ningún servidor. Esta herramienta funciona completamente en el navegador mediante la API Web Crypto, que usa generadores de números pseudoaleatorios criptográficamente seguros (CSPRNG). Las contraseñas nunca se almacenan ni se transmiten por internet.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una contraseña y una frase de contraseña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una contraseña tradicional es una cadena corta de caracteres aleatorios como "X7#mK9@q". Una frase de contraseña (passphrase) es una secuencia de palabras aleatorias, como "caballo-batería-grapadora-azul", que resulta más larga y fácil de recordar pero igualmente segura. Para cuentas con autenticación de dos factores, ambos enfoques son válidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Debo usar una contraseña diferente para cada cuenta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, reutilizar contraseñas es uno de los principales riesgos de seguridad. Si un servicio sufre una filtración de datos, los atacantes prueban esas credenciales en otros servicios (credential stuffing). Usar una contraseña única por cuenta limita el daño a un solo servicio en caso de brecha. Un gestor de contraseñas facilita recordar contraseñas distintas para cada sitio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué caracteres hacen más fuerte una contraseña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Combinar cuatro tipos de caracteres maximiza la seguridad: letras minúsculas (a-z), letras mayúsculas (A-Z), dígitos (0-9) y símbolos especiales (!@#$%^&*). Con los cuatro tipos activados y 12 caracteres, el espacio de búsqueda supera los 95^12 ≈ 540 cuatrillones de combinaciones. Evita palabras del diccionario, fechas de nacimiento o nombres propios, incluso con sustituciones obvias como "a→@".',
      },
    },
  ],
};

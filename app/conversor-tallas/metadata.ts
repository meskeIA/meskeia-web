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
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de Tallas Internacional Gratis | meskeIA',
    description:
      'Convierte tallas de ropa, calzado y complementos entre sistemas ES/EU, US y UK. Perfecto para compras online internacionales.',
    images: ['https://meskeia.com/og-image.png']
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo convierto mi talla europea a talla americana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La conversión depende del tipo de prenda. En ropa de mujer, una talla 36 EU equivale aproximadamente a una XS/2 US; una 40 EU es una S/6 US. En calzado de mujer, una 38 EU corresponde a una 7.5 US. Selecciona el tipo de prenda en el conversor, introduce tu talla EU y obtendrás la equivalencia US al instante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sistemas de tallas soporta el conversor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El conversor cubre los tres sistemas más usados en compras internacionales: España/Europa (ES/EU), Estados Unidos (US) y Reino Unido (UK). Incluye ropa de hombre y mujer, calzado para adultos y niños, y complementos como anillos, guantes y gorros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son exactas las equivalencias de tallas entre países?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las conversiones se basan en estándares internacionales ampliamente aceptados, pero cada marca puede aplicar sus propias hormas y patrones. Se recomienda contrastar siempre con la guía de tallas específica del fabricante antes de finalizar una compra, especialmente en calzado y ropa ajustada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo convertir tallas de calzado usando la medida del pie en centímetros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El conversor de calzado muestra también la longitud aproximada del pie en centímetros para cada talla, lo que facilita la comparación con las tablas de medidas internas que publican algunos fabricantes y permite una elección más precisa cuando hay duda entre dos tallas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un conversor de tallas si puedo buscar en Google?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una búsqueda general suele devolver tablas estáticas que no distinguen entre tipo de prenda, género o sistema de origen. Este conversor aplica la tabla específica según la categoría elegida (ropa hombre, mujer, calzado niño, anillos…) y permite cambiar el sistema de origen libremente, reduciendo el riesgo de errores en compras online internacionales.',
      },
    },
  ],
};

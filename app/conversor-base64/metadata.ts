import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor Base64 - Codifica y Decodifica Texto e Imágenes | meskeIA',
  description: 'Codifica y decodifica texto, imágenes y archivos en Base64. Genera data URI para desarrollo web, convierte imágenes a Base64 para CSS inline.',
  keywords: 'base64, codificar, decodificar, encode, decode, data uri, imagen base64, texto base64, conversor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor Base64',
    description: 'Codifica y decodifica texto, imágenes y archivos en Base64.',
    url: 'https://meskeia.com/conversor-base64/',
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
    title: 'Conversor Base64',
    description: 'Codifica y decodifica en Base64 online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor Base64",
  description: "Codifica y decodifica texto, imágenes y archivos en Base64. Genera data URI para desarrollo web, convierte imágenes a Base64 para CSS inline.",
  url: "https://meskeia.com/conversor-base64/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es Base64 y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Base64 es un esquema de codificación que convierte datos binarios (imágenes, archivos, texto) en una cadena de caracteres ASCII seguros para transmitir por protocolos de texto como HTTP o correo electrónico. Se usa ampliamente en desarrollo web para incrustar imágenes directamente en CSS o HTML (data URI), en tokens de autenticación (JWT) y en el intercambio de datos en APIs.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo convierto una imagen a Base64 para usarla en CSS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Carga la imagen en el conversor y obtendrás una cadena Base64 que puedes usar directamente como data URI en CSS con la sintaxis url("data:image/png;base64,CADENA..."). Esto evita peticiones HTTP adicionales para imágenes pequeñas como iconos o logos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre codificar y decodificar en Base64?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Codificar convierte datos originales (texto, imagen, archivo) a su representación Base64, una cadena de letras, números y los símbolos + y /. Decodificar realiza el proceso inverso: toma una cadena Base64 y recupera los datos originales. Base64 no es cifrado, solo es una representación alternativa de los datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro usar esta herramienta para codificar datos sensibles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La codificación y decodificación se realiza completamente en tu navegador, sin enviar los datos a ningún servidor. Sin embargo, recuerda que Base64 no es un método de cifrado: cualquiera que tenga la cadena resultante puede decodificarla fácilmente. Para datos sensibles, usa cifrado real (AES, RSA) además o en lugar de Base64.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la cadena Base64 es más larga que el texto original?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Base64 codifica cada 3 bytes de datos en 4 caracteres ASCII, lo que supone un incremento de tamaño de aproximadamente un 33%. Es el coste de representar datos binarios arbitrarios con un conjunto de caracteres reducido y seguro para texto. Este sobrecoste es aceptable en la mayoría de casos de uso web.',
      },
    },
  ],
};

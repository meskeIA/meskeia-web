import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Codificador Base64 Online - Codificar y Decodificar | meskeIA',
  description: 'Codifica y decodifica texto en Base64 y URL encoding. Soporta archivos e imágenes. Herramienta segura que funciona en tu navegador sin enviar datos.',
  keywords: 'base64, codificar base64, decodificar base64, base64 online, url encode, url decode, btoa, atob, codificacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Codificador Base64 Online | meskeIA',
    description: 'Codifica y decodifica texto en Base64 de forma segura.',
    url: 'https://meskeia.com/codificador-base64/',
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
    title: 'Codificador Base64 | meskeIA',
    description: 'Codifica y decodifica texto en Base64 online',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Codificador Base64",
  description: "Codifica y decodifica texto en Base64 y URL encoding. Soporta archivos e imágenes. Herramienta segura que funciona en tu navegador sin enviar datos.",
  url: "https://meskeia.com/codificador-base64/",
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
        text: 'Base64 es un esquema de codificación que representa datos binarios usando solo 64 caracteres ASCII imprimibles (A-Z, a-z, 0-9, + y /). Se usa para incrustar imágenes directamente en HTML o CSS, transmitir archivos adjuntos en emails (MIME), almacenar datos binarios en JSON o XML, y en tokens de autenticación como los JWT. No es cifrado: cualquiera puede decodificarlo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Base64 cifra los datos o solo los codifica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Base64 solo codifica, no cifra. La codificación es reversible y pública: cualquier persona con acceso al texto en Base64 puede decodificarlo en segundos. Si necesitas proteger la confidencialidad de los datos, debes cifrarlos primero (por ejemplo con AES) y después, si es necesario, codificar el resultado en Base64 para transportarlo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo debo usar URL encoding en lugar de Base64?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'URL encoding (también llamado percent-encoding) sustituye caracteres especiales como espacios, &, = o ? por su equivalente %XX para que puedan incluirse en una URL sin ambigüedad. Base64 es preferible para datos binarios o cuando necesitas una representación compacta en campos de texto. En query strings de URLs se suele preferir URL encoding o la variante Base64url (que reemplaza + y / por - y _ para evitar conflictos con la URL).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el texto codificado en Base64 es más largo que el original?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Base64 representa cada 3 bytes de datos originales como 4 caracteres ASCII, lo que supone un incremento de tamaño del 33% aproximadamente. Este sobrecoste es el precio de usar solo caracteres seguros y universales. En archivos grandes, como imágenes incrustadas en CSS, conviene evaluar si el impacto en el tamaño de la página compensa la reducción de peticiones HTTP.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo incrustar una imagen en HTML usando Base64?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Codifica el archivo de imagen en Base64 y úsalo como valor del atributo src en una etiqueta img con el prefijo de tipo MIME: data:image/png;base64,<cadena_base64>. Esto elimina la petición HTTP adicional para cargar la imagen, lo que puede ser útil para iconos pequeños o imágenes críticas de carga inicial. Para imágenes grandes no se recomienda porque aumenta el tamaño del HTML.',
      },
    },
  ],
};

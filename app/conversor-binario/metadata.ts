import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Conversor Binario Online - Texto a Binario y Binario a Texto | meskeIA',
  description: 'Conversor binario gratuito. Convierte texto a código binario (0 y 1) y viceversa. Incluye hexadecimal, octal y ASCII. Aprende sistemas numéricos.',
  keywords: 'conversor binario, texto a binario, binario a texto, codigo binario, ascii, hexadecimal, octal, sistemas numericos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor Binario Online - meskeIA',
    description: 'Convierte texto a binario y viceversa. Con hexadecimal, octal y ASCII.',
    url: 'https://meskeia.com/conversor-binario/',
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
    title: 'Conversor Binario Online',
    description: 'Convierte texto a código binario y viceversa.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor Binario Online - Texto a Binario y Binario a Texto",
  description: "Conversor binario gratuito. Convierte texto a código binario (0 y 1) y viceversa. Incluye hexadecimal, octal y ASCII. Aprende sistemas numéricos.",
  url: 'https://meskeia.com/conversor-binario/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el sistema binario y por qué lo usan los ordenadores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema binario es un sistema de numeración que usa solo dos dígitos: 0 y 1. Los ordenadores lo utilizan porque sus componentes electrónicos (transistores) tienen dos estados físicos distinguibles: apagado (0) y encendido (1). Cada 0 o 1 es un "bit" (binary digit), y 8 bits forman un byte, la unidad básica de información.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se convierte texto a binario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada carácter del texto tiene un número asignado en la tabla ASCII o Unicode. Por ejemplo, la letra "A" es el número 65, que en binario se escribe 01000001. El conversor toma cada carácter, obtiene su código numérico y lo expresa en base 2 usando grupos de 8 bits. El texto "Hola" se convierte en cuatro grupos de 8 bits separados por espacios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre binario, octal y hexadecimal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tres son bases numéricas distintas. El binario (base 2) usa solo 0 y 1. El octal (base 8) usa dígitos del 0 al 7 y agrupa los bits de 3 en 3. El hexadecimal (base 16) usa dígitos del 0 al 9 y letras A-F, agrupando los bits de 4 en 4. El hexadecimal es el más compacto: el byte 11111111 en binario equivale a FF en hex o 377 en octal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa la codificación binaria en la práctica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El binario está presente en todo el software: los archivos en disco son secuencias de bytes, las imágenes se codifican como matrices de bits, las redes transmiten paquetes binarios y los protocolos criptográficos operan sobre números en base 2. También se usa en electrónica digital, programación de microcontroladores y en el diseño de circuitos lógicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es ASCII y cómo se relaciona con el binario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ASCII (American Standard Code for Information Interchange) es una tabla que asigna un número del 0 al 127 a cada carácter imprimible y de control del inglés estándar. Ese número se almacena en binario: la "a" minúscula es 97 (01100001 en binario). Para idiomas con caracteres especiales como el español (ñ, á, é...) se usa Unicode UTF-8, que extiende ASCII con más bytes por carácter.',
      },
    },
  ],
};

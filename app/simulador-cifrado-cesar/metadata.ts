import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Cifrado César | meskeIA',
  description: 'Cifra y descifra texto con el cifrado César. Rueda del alfabeto animada, histograma de frecuencias y ataque automático por análisis de frecuencias.',
  keywords: ['cifrado César', 'criptografía', 'sustitución monoalfabética', 'análisis de frecuencias', 'ROT-13', 'Julio César', 'informática', 'Bachillerato', 'preparatoria', 'secundaria'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Cifrado César | meskeIA',
    description: 'Rueda del alfabeto interactiva, cifrado/descifrado en tiempo real y ataque por análisis de frecuencias.',
    url: 'https://meskeia.com/simulador-cifrado-cesar/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Cifrado César | meskeIA',
    description: 'Rueda del alfabeto interactiva, cifrado/descifrado en tiempo real y ataque automático por análisis de frecuencias.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Simulador Cifrado César meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Cifrado César',
  description: 'Cifra y descifra texto con el cifrado César con rueda animada, histograma de frecuencias y ataque automático.',
  url: 'https://meskeia.com/simulador-cifrado-cesar/',
  category: 'EducationalApplication',
  features: [
    'Rueda del alfabeto animada en Canvas 2D',
    'Cifrado y descifrado en tiempo real',
    'Histograma de frecuencias de letras',
    'Ataque automático por análisis de frecuencias',
    '5 textos predefinidos',
    'ROT-13 como caso especial',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el cifrado César y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado César es una técnica de sustitución monoalfabética que desplaza cada letra del alfabeto un número fijo de posiciones. Por ejemplo, con desplazamiento 3, la "A" se convierte en "D", la "B" en "E" y así sucesivamente. Se atribuye a Julio César, quien lo usó para comunicaciones militares. Es el cifrado histórico más sencillo y el punto de entrada en criptografía clásica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se rompe o descifra el cifrado César sin conocer la clave?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado César se rompe fácilmente mediante análisis de frecuencias o simplemente probando los 25 desplazamientos posibles (fuerza bruta). El análisis de frecuencias compara la distribución de letras en el texto cifrado con la distribución típica del idioma (en español, "E", "A" y "O" son las más frecuentes) e infiere el desplazamiento sin necesidad de clave.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es ROT-13 y cómo se relaciona con el cifrado César?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ROT-13 es un caso especial del cifrado César con desplazamiento 13. Como el alfabeto tiene 26 letras, aplicar ROT-13 dos veces devuelve el texto original, lo que lo hace simétrico: cifrar y descifrar usan la misma operación. Se usa habitualmente en foros de internet para ocultar spoilers o soluciones de acertijos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el cifrado César del cifrado Vigenère?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado César usa un único desplazamiento para todas las letras (sustitución monoalfabética), lo que lo hace vulnerable al análisis de frecuencias. El cifrado Vigenère usa una palabra clave de longitud variable, aplicando un desplazamiento diferente a cada posición del texto (sustitución polialfabética), lo que enmascara las frecuencias y lo hace mucho más robusto aunque tampoco es seguro por estándares modernos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve estudiar el cifrado César hoy en día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aunque el cifrado César no tiene aplicación práctica en seguridad moderna, es fundamental para introducir conceptos clave de criptografía: sustitución, desplazamiento, análisis de frecuencias y la idea de espacio de clave pequeño como debilidad. Es parte del currículo de informática en Bachillerato (España), preparatoria o secundaria (Latinoamérica), FP de DAM/DAW y cursos universitarios de seguridad informática.',
      },
    },
  ],
};

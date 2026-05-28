import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor IEEE 754 - Punto Flotante 32/64 bits | meskeIA',
  description: 'Convierte números decimales a formato IEEE 754 (punto flotante) y viceversa. Visualiza signo, exponente y mantisa en binario. Soporta precisión simple (32 bits) y doble (64 bits).',
  keywords: 'IEEE 754, punto flotante, float, double, binario, exponente, mantisa, signo, 32 bits, 64 bits, precisión simple, precisión doble, arquitectura computadores, representación numérica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor IEEE 754 - Punto Flotante | meskeIA',
    description: 'Convierte decimales a IEEE 754 y visualiza signo, exponente y mantisa. Precisión simple y doble.',
    url: 'https://meskeia.com/conversor-ieee754/',
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
    title: 'Conversor IEEE 754 | meskeIA',
    description: 'Convierte decimales a punto flotante IEEE 754 con visualización binaria.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Conversor IEEE 754 meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor IEEE 754",
  description: "Convierte números decimales a formato IEEE 754 (punto flotante) y viceversa. Visualiza signo, exponente y mantisa en binario. Soporta precisión simple (32 bits) y doble (64 bits).",
  url: "https://meskeia.com/conversor-ieee754/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el estándar IEEE 754?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estándar IEEE 754 es la norma internacional que define cómo los ordenadores representan y operan con números de punto flotante. Fue publicado en 1985 y revisado en 2008. Especifica dos formatos principales: precisión simple (32 bits, tipo float en C/Java) y precisión doble (64 bits, tipo double), así como las reglas de redondeo y el tratamiento de valores especiales como infinito o NaN (Not a Number).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las partes de un número en formato IEEE 754?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un número IEEE 754 se divide en tres campos: el bit de signo (0 = positivo, 1 = negativo), el exponente con sesgo (8 bits en simple, 11 en doble) y la mantisa o fracción (23 bits en simple, 52 en doble). El valor final se calcula como: (-1)^signo × 2^(exponente - sesgo) × (1 + mantisa). El sesgo es 127 para precisión simple y 1023 para doble.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué 0.1 + 0.2 no es exactamente 0.3 en los ordenadores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque 0.1 y 0.2 no pueden representarse de forma exacta en binario, al igual que 1/3 no puede representarse exactamente en decimal. El estándar IEEE 754 almacena aproximaciones de estos valores, y la suma de dos aproximaciones acumula el error. El resultado real de 0.1 + 0.2 en punto flotante de 64 bits es 0.30000000000000004, no 0.3. Esto afecta a todos los lenguajes que usan IEEE 754 (Python, JavaScript, Java, C, etc.).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo usar precisión simple (32 bits) y cuándo doble (64 bits)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La precisión simple ocupa 4 bytes y tiene una precisión de aproximadamente 7 dígitos decimales significativos; es suficiente para gráficos 3D, audio o aprendizaje automático donde se prioriza el rendimiento. La precisión doble ocupa 8 bytes y ofrece unos 15-16 dígitos significativos; es la opción estándar en cálculos científicos, financieros o de ingeniería donde la exactitud importa más que la velocidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son NaN e Infinito en IEEE 754?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son valores especiales definidos por el estándar. Infinito positivo o negativo se produce al dividir un número por cero (ej.: 1.0 / 0.0). NaN (Not a Number) representa operaciones indefinidas, como la raíz cuadrada de un número negativo o 0.0 / 0.0. Ambos tienen representaciones binarias específicas en IEEE 754 y permiten propagar errores sin interrumpir el programa, facilitando su detección posterior.',
      },
    },
  ],
};

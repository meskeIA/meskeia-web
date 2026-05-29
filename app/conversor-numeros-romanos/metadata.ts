import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de Números Romanos Online - Arábigos a Romanos | meskeIA',
  description: 'Conversor de números romanos gratuito. Convierte números arábigos (1, 2, 3...) a romanos (I, II, III...) y viceversa. Con reglas y ejemplos.',
  keywords: 'numeros romanos, conversor numeros romanos, romano a arabigo, arabigo a romano, I V X L C D M, cifras romanas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Números Romanos Online - meskeIA',
    description: 'Convierte números arábigos a romanos y viceversa. Con reglas y ejemplos.',
    url: 'https://meskeia.com/conversor-numeros-romanos/',
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
    title: 'Conversor de Números Romanos Online',
    description: 'Convierte números arábigos a romanos y viceversa.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor Números Romanos",
  description: "Conversor de números romanos gratuito. Convierte números arábigos (1, 2, 3...) a romanos (I, II, III...) y viceversa. Con reglas y ejemplos.",
  url: "https://meskeia.com/conversor-numeros-romanos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se escriben los números romanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los números romanos utilizan siete símbolos: I (1), V (5), X (10), L (50), C (100), D (500) y M (1000). Se combinan sumando o restando su valor: cuando un símbolo de menor valor precede a uno mayor, se resta (IV = 4, IX = 9, XL = 40, CD = 400). Cuando está después, se suma (VI = 6, XV = 15). Ningún símbolo puede repetirse más de tres veces consecutivas, excepto M.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué número es MMXXVI en arábigo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MMXXVI equivale a 2026 en numeración arábiga. Se descompone en: MM = 2000, XX = 20 y VI = 6. Los números romanos se leen sumando los valores de los símbolos de izquierda a derecha, salvo cuando un símbolo menor precede a uno mayor, caso en que se resta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hasta qué número se puede expresar en números romanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con el sistema estándar, el mayor número romano es MMMCMXCIX, que equivale a 3999. Para números mayores, el sistema romano clásico usaba una barra horizontal sobre el símbolo para multiplicarlo por 1000 (vinculum), lo que permitía expresar decenas de millones. En la práctica moderna, los números romanos se usan principalmente para siglos, años, capítulos y numeración ornamental.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usan hoy en día los números romanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los números romanos se emplean en contextos formales o tradicionales: numeración de siglos (siglo XXI), reyes y papas (Carlos III, Juan Pablo II), capítulos de libros y actos de obras teatrales, carátulas de relojes analógicos, años en créditos cinematográficos y televisivos, numeración de ediciones y eventos (Olimpiadas, Super Bowl). También se ven en fachadas de edificios históricos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los números romanos tienen un símbolo para el cero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El sistema romano no tiene representación para el cero, lo que fue una limitación importante para el cálculo matemático. El concepto de cero llegó a Europa procedente de la India a través del mundo árabe, y fue fundamental para el desarrollo de la aritmética y el álgebra modernas. Los números arábigos (0-9) sustituyeron progresivamente a los romanos en la Edad Media por su mayor versatilidad.',
      },
    },
  ],
};

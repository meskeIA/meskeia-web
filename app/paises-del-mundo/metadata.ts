import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Países del Mundo - Buscador con Capitales, Banderas y Datos | meskeIA',
  description: 'Explora los 196 países del mundo. Busca por nombre o capital y descubre banderas, población, superficie, moneda, idioma y prefijo telefónico de cada país.',
  keywords: 'países del mundo, capitales, banderas, monedas, idiomas, población, superficie, prefijo telefónico, atlas mundial, geografía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Países del Mundo - Buscador Completo | meskeIA',
    description: 'Explora los 196 países del mundo con sus capitales, banderas, monedas, idiomas y más datos interesantes.',
    url: 'https://meskeia.com/paises-del-mundo/',
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
    title: 'Países del Mundo - Buscador Completo | meskeIA',
    description: 'Explora los 196 países del mundo con sus capitales, banderas, monedas, idiomas y más.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Países del Mundo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Países del Mundo",
  description: "Explora los 196 países del mundo. Busca por nombre o capital y descubre banderas, población, superficie, moneda, idioma y prefijo telefónico de cada país.",
  url: "https://meskeia.com/paises-del-mundo/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos países hay en el mundo actualmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Esta base de datos incluye 196 países y territorios: 193 son estados miembros de las Naciones Unidas, 2 tienen estatus de estado observador permanente (Ciudad del Vaticano y Palestina) y se añade Taiwán. La cifra varía según la fuente: los organismos internacionales suelen citar 193 (solo miembros ONU) o 195 (+ Vaticano y Palestina); algunos atlas añaden también Taiwán o Kosovo según el criterio de reconocimiento aplicado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el país más grande del mundo por superficie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rusia es el país más grande del mundo, con una superficie de aproximadamente 17,1 millones de km², lo que representa cerca del 11% de la superficie terrestre total. Le siguen Canadá (10 millones de km²), Estados Unidos (9,8 millones de km²) y China (9,6 millones de km²).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué país tiene más habitantes en el mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'India superó a China en 2023 como el país más poblado del mundo, con más de 1.440 millones de habitantes. China tiene aproximadamente 1.410 millones. Estados Unidos ocupa el tercer lugar con alrededor de 335 millones de personas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un buscador de países del mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un buscador de países permite consultar rápidamente datos geográficos y culturales de cualquier nación: capital, bandera, población, superficie, moneda oficial, idioma principal y prefijo telefónico internacional. Es útil para estudiantes, viajeros, periodistas y cualquier persona que necesite información básica de referencia sobre geografía mundial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos idiomas oficiales existen en el mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el mundo existen entre 6.000 y 7.000 lenguas vivas, aunque el número de idiomas con estatus oficial varía según el país. El español es oficial en 21 países, el inglés en más de 50 y el francés en 29. Algunos países como Bolivia, India o Sudáfrica tienen más de 10 idiomas oficiales reconocidos.',
      },
    },
  ],
};

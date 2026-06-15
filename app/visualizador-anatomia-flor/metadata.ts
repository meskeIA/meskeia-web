import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía de una Flor - De la Polinización al Fruto | meskeIA',
  description: 'Explora la anatomía de una flor de forma visual: partes clickables, tipos de polinización, formación de frutos y semillas, y datos fascinantes. Explicador visual interactivo.',
  keywords: 'anatomía flor, partes de la flor, polinización, estambre, pistilo, pétalos, sépalos, fruto, semilla, botánica, angiospermas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía de una Flor - De la Polinización al Fruto',
    description: 'Partes de la flor, tipos de polinización, formación de frutos y datos fascinantes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-anatomia-flor/',
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
    title: 'Anatomía de una Flor - Explicador Visual',
    description: 'Partes de la flor, polinización, frutos y semillas. Explicador visual interactivo en español.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Anatomía Flor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía de una Flor - De la Polinización al Fruto',
  description: 'Explicador visual interactivo sobre la anatomía de una flor: partes clickables con funciones, tipos de polinización, transformación del ovario en fruto, dispersión de semillas y datos fascinantes del mundo vegetal.',
  url: 'https://meskeia.com/visualizador-anatomia-flor/',
  category: 'EducationalApplication',
  features: [
    'Diagrama interactivo de una flor con partes clickables y colores distintivos',
    'Proceso de polinización paso a paso: entomófila, anemófila, ornitófila e hidrófila',
    'Transformación del ovario en fruto: carnosos, secos y dispersión de semillas',
    'Datos fascinantes: 400.000 especies, Rafflesia, orquídeas y más',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las partes principales de una flor y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las partes principales de una flor son: los sépalos (protegen el capullo antes de abrirse), los pétalos (atraen a los polinizadores), los estambres (órgano masculino que produce el polen), el pistilo (órgano femenino compuesto por estigma, estilo y ovario) y los nectarios (producen néctar para atraer polinizadores). Cada parte cumple una función específica en la reproducción de la planta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se produce la polinización en las flores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La polinización es el proceso por el que el polen de los estambres llega al estigma del pistilo para fertilizar el óvulo. Puede producirse por insectos (polinización entomófila), por el viento (anemófila), por aves como colibríes (ornitófila) o por el agua (hidrófila). Una vez que el grano de polen germina en el estigma, forma un tubo polínico que transporta los gametos masculinos hasta el óvulo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se transforma una flor en fruto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tras la fecundación, el ovario de la flor se desarrolla y engorda para convertirse en el fruto. Las paredes del ovario forman el pericarpio (la parte comestible en frutos carnosos) mientras que los óvulos fecundados se convierten en semillas. Los pétalos, sépalos y estambres se marchitan y caen, quedando solo el fruto que protege y nutre a las semillas hasta su dispersión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas especies de plantas con flor existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas con flor, denominadas angiospermas, representan el grupo vegetal más diverso de la Tierra con aproximadamente 400.000 especies descritas. Esto supone alrededor del 90% de todas las plantas terrestres conocidas. Aparecieron hace unos 130 millones de años y se diversificaron rápidamente, en parte gracias a su relación coevolutiva con los insectos polinizadores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la flor más grande del mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Rafflesia arnoldii, nativa de los bosques tropicales de Sumatra e Indonesia, produce la flor individual más grande del mundo, con un diámetro que puede superar el metro y un peso de hasta 10 kg. Es una planta parásita sin hojas, raíces ni tallo propio: vive completamente dentro de los tejidos de su planta huésped y solo emerge cuando florece, emitiendo un olor a carne podrida para atraer a las moscas polinizadoras.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Instrumentos Musicales - Guía de 45 Instrumentos del Mundo | meskeIA',
  description: 'Explora 45 instrumentos musicales de todo el mundo: cuerda, viento, percusión, teclado y electrónicos. Origen, materiales, registro y curiosidades de cada instrumento.',
  keywords: 'instrumentos musicales, violín, guitarra, piano, batería, flauta, trompeta, percusión, cuerda, viento, orquesta, música, organología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Instrumentos Musicales - Guía de 45 Instrumentos del Mundo',
    description: 'Explora 45 instrumentos musicales: cuerda, viento, percusión, teclado y electrónicos con origen, materiales y curiosidades.',
    url: 'https://meskeia.com/instrumentos-musicales/',
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
    title: 'Instrumentos Musicales - Guía Completa',
    description: 'Explora 45 instrumentos musicales de todo el mundo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Instrumentos Musicales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Instrumentos Musicales - Guía de 45 Instrumentos del Mundo',
  description: 'Explora 45 instrumentos musicales de todo el mundo: cuerda, viento, percusión, teclado y electrónicos. Origen, materiales, registro y curiosidades de cada instrumento.',
  url: 'https://meskeia.com/instrumentos-musicales/',
  category: 'EducationalApplication',
  features: [
    '45 instrumentos con origen, materiales y registro sonoro',
    'Familias: cuerda, viento madera, viento metal, percusión, teclado, electrónicos',
    'Curiosidades históricas y culturales de cada instrumento',
    'Gratuito, en español, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las familias de instrumentos musicales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los instrumentos se clasifican en 5 familias principales: cuerda (violín, guitarra, arpa, contrabajo), viento madera (flauta, clarinete, oboe, saxofón), viento metal (trompeta, trombón, trompa, tuba), percusión (batería, timbales, xilófono, maracas) y teclado (piano, órgano, clavicémbalo). Los instrumentos electrónicos (sintetizador, theremin) forman una categoría moderna adicional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué instrumento musical es más fácil de aprender para principiantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ukelele y la guitarra acústica son considerados accesibles por principiantes: pocos acordes básicos permiten tocar canciones completas en pocas semanas. La flauta dulce y las percusiones de ritmo fijo también tienen baja curva de entrada. Los instrumentos de cuerda frotada (violín, chelo) y los de viento metal (trompeta) requieren más tiempo para producir un sonido limpio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos instrumentos hay en una orquesta sinfónica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una orquesta sinfónica estándar tiene entre 60 y 100 músicos. La cuerda forma el grupo más numeroso (violines I y II, violas, chelos, contrabajos: unos 50-60 integrantes). El viento madera suma 10-14 instrumentistas, el viento metal 12-15, la percusión 4-6 y puede incluir arpa, piano o celesta. El número exacto varía según la partitura y el tamaño de la sala.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un violín y una viola?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La viola es más grande que el violín (entre 38 y 43 cm de cuerpo vs 35 cm del violín) y está afinada una quinta más grave: Do-Sol-Re-La frente al Sol-Re-La-Mi del violín. Su timbre es más oscuro y menos brillante. Ambos se tocan bajo el mentón con arco, pero la viola usa clave de do (clave de alto) mientras el violín usa clave de sol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un instrumento de percusión idiófono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los idiófonos producen sonido por vibración de su propio cuerpo sin necesidad de membrana, cuerda ni columna de aire. Ejemplos: xilófono, marimba, campanas, castañuelas, triángulo, crótalos, platillos y pandereta (las sonajas). Se diferencian de los membranófonos (tambores, timbales) que vibran mediante una membrana tensada.',
      },
    },
  ],
};

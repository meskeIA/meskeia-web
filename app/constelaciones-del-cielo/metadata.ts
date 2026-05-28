import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Constelaciones del Cielo - Guía de 32 Constelaciones Famosas | meskeIA',
  description: 'Explora las 32 constelaciones más famosas del cielo: zodiacales, boreales y australes. Estrellas principales, mitología griega, mejor época de observación y curiosidades.',
  keywords: 'constelaciones, astronomía, zodíaco, estrellas, Orión, Osa Mayor, Cruz del Sur, mitología griega, cielo nocturno, observación astronómica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Constelaciones del Cielo - Guía de 32 Constelaciones Famosas',
    description: 'Explora las 32 constelaciones más famosas: zodiacales, boreales y australes. Estrellas, mitología y curiosidades.',
    url: 'https://meskeia.com/constelaciones-del-cielo/',
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
    title: 'Constelaciones del Cielo - Guía Astronómica',
    description: 'Explora las 32 constelaciones más famosas del cielo nocturno.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Constelaciones del Cielo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Constelaciones del Cielo",
  description: "Explora las 32 constelaciones más famosas del cielo: zodiacales, boreales y australes. Estrellas principales, mitología griega, mejor época de observación y curiosidades.",
  url: "https://meskeia.com/constelaciones-del-cielo/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas constelaciones hay en el cielo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Unión Astronómica Internacional reconoce oficialmente 88 constelaciones que cubren toda la esfera celeste. De ellas, las más famosas y fáciles de identificar son las 32 constelaciones zodiacales, boreales y australes más conocidas, como Orión, Osa Mayor, Cruz del Sur y las 12 del zodiaco.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la constelación más fácil de identificar en el cielo nocturno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Orión es considerada la constelación más reconocible del cielo. Su característica más llamativa es el "Cinturón de Orión", formado por tres estrellas alineadas (Alnitak, Alnilam y Mintaka). Es visible desde todo el planeta entre noviembre y marzo, lo que la convierte en un punto de referencia ideal para iniciarse en la observación astronómica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre las constelaciones del hemisferio norte y del sur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las constelaciones boreales (hemisferio norte) incluyen figuras como la Osa Mayor, Casiopea y Perseo, visibles principalmente desde Europa, América del Norte y Asia. Las constelaciones australes (hemisferio sur) incluyen la Cruz del Sur, Centauro y Carina, visibles desde Sudamérica, Oceanía y África. Algunas constelaciones zodiacales, al estar en el ecuador celeste, son visibles desde ambos hemisferios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué época del año es mejor observar las constelaciones del zodiaco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada constelación del zodiaco tiene su mejor época de visibilidad, que coincide aproximadamente con el mes opuesto al que el Sol está en esa constelación. Por ejemplo, Escorpio se ve mejor en junio-julio, mientras que Géminis alcanza su máximo esplendor en invierno. La guía de constelaciones indica para cada una su época óptima de observación a lo largo del año.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tienen las constelaciones con la mitología griega?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de las constelaciones visibles desde el hemisferio norte tienen su origen en la mitología griega y fueron codificadas por el astrónomo Ptolomeo en el siglo II d.C. en su obra "Almagesto". Representan héroes como Hércules y Perseo, dioses como Orión el cazador, animales mitológicos como Pegaso y Draco, y objetos simbólicos. Esta tradición se transmitió a través de la cultura árabe medieval hasta la astronomía moderna.',
      },
    },
  ],
};

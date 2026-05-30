import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estilos Arquitectónicos — Cronología Interactiva | meskeIA',
  description: 'Explora 16 estilos arquitectónicos desde la Grecia clásica hasta la arquitectura sostenible. Edificios icónicos, arquitectos y contexto histórico de la arquitectura occidental.',
  keywords: ['historia arquitectura', 'estilos arquitectónicos', 'gótico', 'barroco arquitectura', 'bauhaus', 'modernismo arquitectura', 'cronología arquitectura'],
  openGraph: {
    title: 'Estilos Arquitectónicos — Cronología Interactiva',
    description: 'Del Partenón a la Sagrada Família: 16 estilos con edificios icónicos, arquitectos y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-arquitectura-estilos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-arquitectura-estilos/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Estilos Arquitectónicos',
  description: 'Herramienta educativa sobre historia de la arquitectura y estilos arquitectónicos occidentales',
  url: 'https://meskeia.com/visualizador-arquitectura-estilos/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los principales estilos arquitectónicos de la historia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre los estilos más reconocibles destacan la arquitectura griega clásica (órdenes dórico, jónico y corintio), la romana (arcos, bóvedas, hormigón), el Románico y el Gótico medievales, el Renacimiento y el Barroco (siglos XV-XVII), el Neoclasicismo, el Art Nouveau, el Racionalismo de la Bauhaus, el Movimiento Moderno (Le Corbusier, Mies van der Rohe), el Posmodernismo y la arquitectura sostenible contemporánea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia al Románico del Gótico en arquitectura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Románico (siglos X-XII) se caracteriza por muros gruesos, arcos de medio punto, ventanas pequeñas y una sensación de solidez y horizontalidad. El Gótico (siglos XII-XV) introduce el arco ojival, el arbotante y los pilares esbeltos, lo que permite elevar las estructuras y abrir grandes ventanales con vidrieras. El resultado visual es radicalmente distinto: pesadez y recogimiento en el Románico frente a verticalidad y luminosidad en el Gótico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la arquitectura Bauhaus y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Bauhaus fue una escuela de diseño y arquitectura fundada en Weimar (Alemania) en 1919 por Walter Gropius. Propugnaba la integración de arte, artesanía e industria bajo el principio "la forma sigue a la función". Su influencia es enorme: sentó las bases del diseño industrial moderno, el urbanismo racionalista y la arquitectura funcionalista del siglo XX. Fue clausurada por los nazis en 1933, pero sus docentes emigraron y difundieron sus ideas por todo el mundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo identificar el estilo barroco en un edificio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Barroco arquitectónico (siglos XVII-XVIII) se reconoce por la exuberancia decorativa, las formas curvas y ondulantes, el juego dramático de luz y sombra (claroscuro), las columnas salomónicas y las fachadas muy ornamentadas. Ejemplos icónicos son la Basílica de San Pedro en Roma (Bernini), el Palacio de Versalles o, en España, la fachada del Obradoiro de la Catedral de Santiago de Compostela.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve estudiar los estilos arquitectónicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer los estilos arquitectónicos permite leer los edificios como documentos históricos: reflejan la economía, la religión, la política y la tecnología de cada época. Es conocimiento fundamental para estudiantes de arquitectura, historia del arte, patrimonio cultural y turismo. También resulta útil para viajeros que quieran entender los monumentos que visitan o para cualquier persona interesada en comprender el entorno construido en el que vivimos.',
      },
    },
  ],
};

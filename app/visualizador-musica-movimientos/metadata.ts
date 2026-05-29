import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movimientos Musicales — Cronología Interactiva | meskeIA',
  description: 'Explora 14 movimientos musicales desde el Canto Gregoriano hasta la música electrónica. Línea del tiempo interactiva con compositores, obras icónicas y contexto histórico.',
  keywords: ['historia música', 'movimientos musicales', 'cronología música', 'barroco musical', 'romanticismo', 'jazz', 'música electrónica', 'clasicismo'],
  openGraph: {
    title: 'Movimientos Musicales — Cronología Interactiva',
    description: 'Del canto gregoriano al techno: 14 períodos musicales con compositores, obras icónicas y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-musica-movimientos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-musica-movimientos/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Movimientos Musicales',
  description: 'Herramienta educativa sobre historia de la música y movimientos musicales',
  url: 'https://meskeia.com/visualizador-musica-movimientos/',
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
      name: '¿Cuántos movimientos musicales cubre la cronología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cronología abarca 14 movimientos musicales, desde el Canto Gregoriano (siglo IX) hasta la música electrónica y contemporánea del siglo XX-XXI. Cada período incluye compositores representativos, obras icónicas y el contexto histórico que lo originó.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el Barroco, el Clasicismo y el Romanticismo musical?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Barroco (1600-1750) se caracteriza por la ornamentación, el bajo continuo y figuras como Bach y Vivaldi. El Clasicismo (1750-1820) busca la claridad formal, la simetría y el equilibrio, con Haydn, Mozart y el joven Beethoven. El Romanticismo (1820-1900) da prioridad a la expresión emocional, los grandes frescos orquestales y la música programática, con Schubert, Brahms o Tchaikovsky.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo es útil esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es adecuada para estudiantes de secundaria y bachillerato que estudien historia de la música o humanidades, así como para aficionados a la música clásica y el jazz que quieran contextualizar los estilos que escuchan. No requiere conocimientos previos de teoría musical.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la línea del tiempo interactiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La línea del tiempo muestra los 14 períodos ordenados cronológicamente. Al hacer clic en cualquier movimiento se despliega un panel con los rasgos estilísticos, los compositores más relevantes, una obra icónica de referencia y el contexto histórico-social que explica su surgimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo surgió el jazz y qué lo distingue de la música clásica occidental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El jazz emergió a finales del siglo XIX y principios del XX en Nueva Orleans, como fusión de la música afroamericana (blues, spirituals), el ragtime y las tradiciones europeas. A diferencia de la música clásica escrita, el jazz otorga un papel central a la improvisación, el swing y la interacción rítmica entre los músicos.',
      },
    },
  ],
};

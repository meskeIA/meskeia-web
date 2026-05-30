import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movimientos Literarios — Cronología Interactiva | meskeIA',
  description: 'Explora 15 movimientos literarios desde la épica griega hasta el posmodernismo. Autores, obras icónicas y contexto histórico de la literatura occidental.',
  keywords: ['historia literatura', 'movimientos literarios', 'realismo', 'romanticismo literario', 'boom latinoamericano', 'vanguardias', 'cronología literatura'],
  openGraph: {
    title: 'Movimientos Literarios — Cronología Interactiva',
    description: 'De Homero a García Márquez: 15 movimientos con autores, obras icónicas y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-literatura-movimientos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-literatura-movimientos/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Movimientos Literarios',
  description: 'Herramienta educativa sobre historia de la literatura y movimientos literarios de la cultura occidental',
  url: 'https://meskeia.com/visualizador-literatura-movimientos/',
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
      name: '¿Cuáles son los principales movimientos literarios de la historia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los movimientos literarios más influyentes incluyen la épica clásica griega y latina, el Renacimiento (siglos XV-XVI), el Barroco, el Romanticismo (principios del siglo XIX), el Realismo y Naturalismo, las vanguardias del siglo XX (Modernismo, Surrealismo) y el Boom Latinoamericano. Cada corriente responde a un contexto histórico y cultural específico y define un conjunto de temas, estilos y autores representativos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo surgió el Realismo literario y qué autores lo representan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Realismo literario se desarrolló principalmente entre 1830 y 1900, como reacción al idealismo romántico. Busca retratar la sociedad con precisión y objetividad. Entre sus máximos representantes destacan Honoré de Balzac y Gustave Flaubert en Francia, Charles Dickens en Inglaterra, León Tolstói y Fiódor Dostoyevski en Rusia, y Benito Pérez Galdós en España.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Boom Latinoamericano y cuáles son sus obras clave?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Boom Latinoamericano fue un movimiento literario de las décadas de 1960 y 1970 que llevó la narrativa hispanoamericana a reconocimiento mundial. Se caracteriza por el realismo mágico, estructuras narrativas experimentales y un fuerte compromiso político y social. Sus obras más emblemáticas son Cien años de soledad de Gabriel García Márquez, Rayuela de Julio Cortázar, La ciudad y los perros de Mario Vargas Llosa y El obsceno pájaro de la noche de José Donoso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el Romanticismo del Modernismo literario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Romanticismo (circa 1800-1850) exalta los sentimientos, la naturaleza, el individuo y lo sublime, con autores como Byron, Keats y Víctor Hugo. El Modernismo literario hispanoamericano (1880-1920), encabezado por Rubén Darío, es una corriente de renovación del lenguaje poético que busca la musicalidad, el exotismo y la belleza formal, alejándose del utilitarismo burgués. Ambos comparten el rechazo al racionalismo, pero difieren en época, geografía y recursos estéticos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve una cronología interactiva de movimientos literarios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una cronología interactiva permite visualizar de forma simultánea el orden temporal de los movimientos, sus solapamientos y las influencias cruzadas entre corrientes. Es especialmente útil para estudiantes de Bachillerato, Literatura y Filología, para preparar exámenes de acceso a la universidad o simplemente para situar una obra o autor en su contexto histórico-cultural sin necesidad de manejar múltiples fuentes.',
      },
    },
  ],
};

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estructuras de Mercado | meskeIA',
  description: 'Visualiza competencia perfecta, monopolio, oligopolio y competencia monopolística. Curvas de oferta y demanda, pérdida de bienestar y dilema del prisionero.',
  keywords: ['estructuras de mercado', 'monopolio', 'oligopolio', 'competencia perfecta', 'economía', 'microeconomía'],
  openGraph: {
    title: 'Estructuras de Mercado — meskeIA',
    description: 'Competencia perfecta, monopolio, oligopolio y su impacto en precios y bienestar.',
    url: 'https://meskeia.com/visualizador-estructuras-mercado/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Estructuras de Mercado',
  description: 'Herramienta educativa interactiva sobre estructuras de mercado en microeconomía',
  url: 'https://meskeia.com/visualizador-estructuras-mercado/',
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
      name: '¿Cuáles son las principales estructuras de mercado en economía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cuatro estructuras de mercado principales son: competencia perfecta (muchos compradores y vendedores, producto homogéneo, precio igual al coste marginal), monopolio (un único vendedor fija el precio por encima del coste marginal generando pérdida de bienestar), oligopolio (pocas empresas interdependientes con poder de mercado) y competencia monopolística (muchas empresas con productos diferenciados que compiten por precio y calidad).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la pérdida de bienestar o peso muerto en un monopolio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pérdida de bienestar (deadweight loss) es la reducción en el excedente total del mercado causada por que el monopolista produce menos cantidad a un precio más alto que el competitivo. En el gráfico de oferta y demanda, corresponde al triángulo entre la curva de demanda, el coste marginal y la cantidad producida por el monopolista. Esta pérdida representa transacciones que habrían sido beneficiosas para compradores y vendedores pero no ocurren.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el dilema del prisionero y cómo se relaciona con el oligopolio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El dilema del prisionero es un modelo de teoría de juegos en el que dos jugadores obtienen peores resultados si actúan por interés propio que si cooperan. En oligopolios, las empresas enfrentan un dilema similar: si todas mantienen precios altos (colusión) maximizan beneficios conjuntos, pero cada una tiene incentivo individual para bajar su precio y capturar más cuota, lo que lleva a equilibrios menos eficientes como en las guerras de precios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se diferencia la competencia monopolística del monopolio puro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la competencia monopolística hay muchas empresas compitiendo, libre entrada y salida del mercado, y cada empresa tiene cierto poder de fijación de precios gracias a la diferenciación de producto (marca, calidad, ubicación). En el largo plazo los beneficios económicos se anulan por la entrada de nuevos competidores. En el monopolio puro existe una sola empresa con barreras de entrada que mantiene beneficios positivos de forma sostenida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué asignaturas o cursos es útil este visualizador de estructuras de mercado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de economía o administración de empresas en asignaturas de Microeconomía, Economía Industrial u Organización Industrial. Las curvas interactivas de oferta, demanda e ingreso marginal permiten intuir los conceptos antes de abordarlos formalmente. También sirve como repaso para oposiciones o exámenes de acceso a másters con prueba de economía.',
      },
    },
  ],
};

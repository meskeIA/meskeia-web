import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Varietales de Vino - Uvas, sabores y maridaje | meskeIA',
  description: '45 varietales de vino del mundo: tintos, blancos, espumosos y generosos. Origen, notas de sabor, cuerpo, taninos, acidez, temperatura de servicio y maridaje. Incluye uvas LATAM (Malbec, Torrontés, Carménère, País).',
  keywords: 'varietales vino, uvas vino, tempranillo, cabernet sauvignon, pinot noir, chardonnay, malbec, torrontes, carmenere, rioja, borgoña, maridaje vino, cata vino, vino tinto blanco espumoso, vino generoso, jerez',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Varietales de Vino | meskeIA',
    description: '45 varietales del mundo: tintos, blancos, espumosos y generosos. Notas de sabor, taninos, acidez y maridaje. Incluye uvas LATAM.',
    url: 'https://meskeia.com/guia-varietales-vino/',
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
    title: 'Guía de Varietales de Vino | meskeIA',
    description: '45 varietales del mundo: notas de sabor, cuerpo, taninos y maridaje perfecto. Incluye uvas LATAM.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Varietales de Vino meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Varietales de Vino',
  description: 'Directorio de 45 varietales de vino del mundo con tipo de uva, origen, zonas principales, notas de sabor, cuerpo, taninos, acidez, temperatura de servicio, maridaje y curiosidades enológicas. Filtros por tipo (Tinto, Blanco, Espumoso, Generoso) y buscador. Incluye uvas latinoamericanas (Malbec, Torrontés, Carménère, Tannat, País, Bonarda) y varietales mediterráneos.',
  url: 'https://meskeia.com/guia-varietales-vino/',
  features: [
    '45 varietales de vino con perfil enológico completo',
    'Filtros por tipo: Tinto, Blanco, Espumoso, Generoso',
    'Cobertura LATAM: Malbec, Torrontés, Carménère, Tannat, País, Bonarda',
    'Buscador por nombre, origen o nota de sabor',
    'Indicadores visuales de cuerpo, taninos y acidez',
    'Temperatura de servicio y maridaje para cada varietal',
    'Curiosidades históricas y enológicas de cada uva',
    'Denominaciones de Origen destacadas por varietal',
    'Funciona 100% en el navegador, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un varietal de vino y en qué se diferencia de un vino de denominación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un varietal es un vino elaborado principalmente con una única variedad de uva, cuyo nombre suele aparecer en la etiqueta (Cabernet Sauvignon, Chardonnay, Malbec…). Un vino de denominación de origen, en cambio, puede ser un ensamblaje de varias uvas autorizadas en esa región y se identifica por su procedencia geográfica. En muchos países se exige que el varietal contenga al menos un 75-85% de la uva indicada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los varietales de vino tinto más populares del mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre los tintos más extendidos globalmente destacan el Cabernet Sauvignon (potente, con taninos firmes, originario de Burdeos), el Merlot (suave y afrutado), el Pinot Noir (elegante, de cuerpo medio, referencia en Borgoña), el Syrah/Shiraz (especiado e intenso) y el Malbec (célebre en Argentina por su perfil frutal y aterciopelado). El Tempranillo lidera en España, especialmente en Rioja y Ribera del Duero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué temperatura es la adecuada para servir el vino tinto y el vino blanco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los vinos tintos con cuerpo (Cabernet Sauvignon, Syrah, Tempranillo) se sirven entre 16 °C y 18 °C. Los tintos ligeros como el Pinot Noir y el Gamay se disfrutan mejor un poco más frescos, entre 12 °C y 14 °C. Los blancos secos (Chardonnay, Sauvignon Blanc) se sirven entre 8 °C y 11 °C, y los espumosos como el Cava o el Champán entre 6 °C y 9 °C. Servir el vino demasiado caliente potencia el alcohol y difumina los aromas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre taninos, cuerpo y acidez en el vino?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los taninos son compuestos polifenólicos que proceden del hollejo y las semillas de la uva; producen esa sensación de sequedad y aspereza en la boca. El cuerpo es la sensación de peso o densidad del vino en el paladar, ligado principalmente al alcohol y a la concentración de extracto seco. La acidez es la viveza o frescura del vino, responsable de su capacidad de envejecimiento y de que limpie el paladar entre bocados. Un vino equilibrado armoniza los tres elementos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los varietales de uva más representativos de América Latina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Malbec argentino es el más conocido internacionalmente, con Mendoza como epicentro. El Carménère chileno, prácticamente desaparecido de Europa, encontró en el Valle Central de Chile su segunda patria. El Torrontés argentino es la uva blanca más característica de la región, con aromas florales intensos. En Uruguay el Tannat produce vinos robustos. La uva País (o Misión / Criolla Chica), introducida por los colonizadores, es la más antigua de América del Sur y vive un renacimiento artesanal.',
      },
    },
  ],
};

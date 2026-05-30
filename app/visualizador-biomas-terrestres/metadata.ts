import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-biomas-terrestres';
const TITLE = 'Biomas Terrestres: Clima, Biodiversidad y Amenazas - meskeIA';
const DESCRIPTION =
  'Explora los 7 biomas terrestres principales: temperatura, precipitación, biodiversidad característica, suelo, fauna representativa y amenazas ambientales de cada ecosistema.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    'biomas terrestres, ecosistemas, biodiversidad, bosque tropical, tundra, taiga, desierto, sabana, mediterráneo, bosque templado, cambio climático, conservación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
    type: 'website',
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
    title: TITLE,
    description: DESCRIPTION,
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Biomas meskeIA' },
};

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    features: [
      'Explorador interactivo de los 7 biomas terrestres principales',
      'Climograma de Walter-Lieth con temperatura y precipitación mensual',
      'Distribución latitudinal de biomas en mapa conceptual',
      'Tabla de conservación con superficie protegida por bioma',
      'Amenazas globales: deforestación, cambio climático, fragmentación',
      'Fauna y flora representativa de cada ecosistema',
      'Gratuito, en español, sin registro',
    ],
    category: 'EducationalApplication',
  });
}

export const jsonLd = generateWebAppSchema({
  name: "Biomas Terrestres: Clima, Fauna y Conservación",
  description: "Visualizador interactivo de biomas terrestres. Selector de 7 biomas (tropical, templado, taiga, tundra, desierto, sabana, mediterráneo) con datos completos, climograma Walter-Lieth con barras de preci",
  url: "https://meskeia.com/visualizador-biomas-terrestres/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos biomas terrestres existen y cuáles son los principales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El número varía según la clasificación empleada, pero los sistemas más usados reconocen entre 7 y 14 biomas terrestres principales. Los grandes grupos son: bosque tropical húmedo, bosque templado caducifolio, taiga o bosque boreal, tundra ártica, desiertos calientes y fríos, sabana tropical y matorral mediterráneo. Cada uno se define por su combinación característica de temperatura y precipitación anual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un climograma de Walter-Lieth y cómo se interpreta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El climograma de Walter-Lieth representa en un mismo gráfico la temperatura media mensual (línea) y la precipitación mensual (barras) a lo largo del año. Cuando la línea de temperatura supera a las barras de precipitación se producen períodos secos (estrés hídrico); cuando las barras superan a la línea, hay exceso de humedad. Esta representación permite identificar el tipo de clima y el bioma correspondiente de forma inmediata.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el bioma más biodiverso del planeta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El bosque tropical húmedo es el bioma más biodiverso: alberga entre el 50 y el 75% de todas las especies terrestres conocidas, pese a cubrir solo el 6% de la superficie terrestre. La cuenca amazónica, los bosques del Congo y el sudeste asiático son los núcleos principales. Su alta biodiversidad se debe a la estabilidad climática durante millones de años, la elevada productividad y la gran heterogeneidad de hábitats en vertical.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el cambio climático a los biomas terrestres?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cambio climático está desplazando los límites de los biomas hacia los polos y mayor altitud, fragmentando hábitats e interrumpiendo los ciclos fenológicos (floraciones, migraciones). La tundra ártica es especialmente vulnerable: el permafrost deshelado libera CO₂ y metano, creando un bucle de retroalimentación positiva. Se estima que entre el 30 y el 50% de los hábitats actuales podrían quedar fuera del rango climático óptimo de sus especies si el calentamiento supera 2 °C.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia al bioma mediterráneo de los otros matorrales y praderas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El bioma mediterráneo se caracteriza por veranos secos y calurosos e inviernos suaves y lluviosos, con precipitaciones anuales entre 250 y 500 mm. Su vegetación adaptada (esclerofila) presenta hojas duras y coriáceas para reducir la pérdida de agua. Aunque ocupa solo el 2% de la superficie terrestre, alberga el 20% de la diversidad vegetal mundial. Existen cinco regiones mediterráneas disjuntas: cuenca mediterránea, California, Chile central, sudoeste australiano y El Cabo (Sudáfrica).',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Capas de la Tierra - Del Suelo al Nucleo de Fuego | meskeIA',
  description: 'Descubre la estructura interna de la Tierra: corteza, manto, nucleo externo y nucleo interno. Ondas sismicas, campo magnetico y datos fascinantes.',
  keywords: 'capas de la Tierra, corteza, manto, nucleo, estructura interna, ondas sismicas, campo magnetico, Mohorovicic, geologia visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Capas de la Tierra - Del Suelo al Nucleo de Fuego',
    description: 'Corteza, manto y nucleo: viaje al interior de la Tierra explicado visualmente.',
    url: 'https://meskeia.com/visualizador-capas-tierra/',
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
    title: 'Capas de la Tierra - Explicador Visual',
    description: '6.371 km hasta el centro: 5.400 grados C de hierro solido que nadie ha visto jamas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Capas Tierra meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Capas de la Tierra - Del Suelo al Nucleo de Fuego',
  description: 'Explicador visual interactivo sobre la estructura interna de la Tierra: 4 capas con datos, ondas sismicas, campo magnetico y comparativa planetaria.',
  url: 'https://meskeia.com/visualizador-capas-tierra/',
  category: 'EducationalApplication',
  features: [
    'Seccion transversal interactiva con 4 capas clickables',
    'Ondas sismicas P y S: como sabemos lo que hay dentro',
    'Campo magnetico y efecto dinamo',
    'Comparativa Tierra vs Marte',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas capas tiene la Tierra y cuáles son?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Tierra tiene 4 capas principales: la corteza (0-70 km), el manto (70-2.900 km), el núcleo externo (2.900-5.150 km, líquido) y el núcleo interno (5.150-6.371 km, sólido). Cada capa tiene composición, temperatura y presión muy distintas entre sí.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sabemos cómo es el interior de la Tierra si nadie ha llegado allí?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El conocimiento del interior terrestre proviene principalmente del análisis de las ondas sísmicas generadas por terremotos. Las ondas P (compresión) viajan por sólidos y líquidos, mientras que las ondas S (cizalla) solo lo hacen por sólidos. La velocidad y trayectoria de estas ondas varía según la densidad y estado de cada capa, permitiendo deducir su composición y profundidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura está el núcleo de la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El núcleo interno de la Tierra alcanza temperaturas de entre 5.000 y 6.000 °C, similares a la superficie del Sol. A pesar de esa temperatura extrema, permanece sólido debido a la enorme presión (unas 3,6 millones de atmósferas) ejercida por el peso de todas las capas superiores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué genera el campo magnético de la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El campo magnético terrestre se genera por el efecto dinamo: el núcleo externo, compuesto de hierro y níquel en estado líquido, circula en corrientes convectivas que, combinadas con la rotación del planeta, producen corrientes eléctricas y generan el campo magnético. Este campo nos protege del viento solar y de la radiación cósmica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre corteza continental y oceánica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La corteza continental tiene entre 30 y 70 km de grosor y está compuesta principalmente de granito (roca rica en sílice y aluminio). La corteza oceánica es mucho más delgada (5-10 km) y está formada por basalto, una roca volcánica más densa. Por eso, cuando las placas colisionan, la oceánica se hunde bajo la continental en el proceso llamado subducción.',
      },
    },
  ],
};

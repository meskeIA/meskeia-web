import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tipos de Rocas - El Ciclo que Nunca se Detiene | meskeIA',
  description: 'Descubre los 3 tipos de rocas (ígneas, sedimentarias, metamórficas), el ciclo de las rocas y sus usos cotidianos. Explicador visual interactivo con ejemplos.',
  keywords: 'tipos de rocas, ígneas, sedimentarias, metamórficas, ciclo de las rocas, granito, mármol, basalto, geología, minerales, escala de Mohs',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tipos de Rocas - El Ciclo que Nunca se Detiene',
    description: 'Ígneas, sedimentarias y metamórficas: las rocas del planeta explicadas visualmente con el ciclo que las transforma.',
    url: 'https://meskeia.com/visualizador-tipos-rocas/',
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
    title: 'Tipos de Rocas - Explicador Visual',
    description: 'Del magma al mármol: los 3 tipos de rocas y el ciclo que nunca se detiene, con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Tipos Rocas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tipos de Rocas - El Ciclo que Nunca se Detiene',
  description: 'Explicador visual interactivo sobre los 3 tipos de rocas, el ciclo de las rocas, usos cotidianos y datos fascinantes de geología.',
  url: 'https://meskeia.com/visualizador-tipos-rocas/',
  category: 'EducationalApplication',
  features: [
    '3 tipos de rocas con subtipos y ejemplos clickables',
    'Ciclo de las rocas con diagrama SVG animado',
    'Rocas en la vida cotidiana con usos reales',
    'Escala de Mohs simplificada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los 3 tipos de rocas y en qué se diferencian?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tres tipos de rocas son: ígneas (formadas por enfriamiento del magma, como el granito o el basalto), sedimentarias (formadas por acumulación y compactación de sedimentos, como la caliza o la arenisca) y metamórficas (originadas por transformación de otras rocas bajo calor y presión, como el mármol o la pizarra). Cada tipo tiene origen, textura y composición distintos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el ciclo de las rocas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo de las rocas es el conjunto de procesos geológicos por los que cualquier tipo de roca puede transformarse en otro a lo largo del tiempo. El magma se enfría y forma rocas ígneas; estas se erosionan y forman sedimentos que dan lugar a rocas sedimentarias; bajo calor y presión se convierten en metamórficas; y si se funden, el ciclo empieza de nuevo. Este ciclo se desarrolla a lo largo de millones de años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre roca ígnea intrusiva y extrusiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las rocas ígneas intrusivas (o plutónicas) se forman cuando el magma se enfría lentamente bajo la superficie terrestre, lo que permite que los cristales crezcan grandes (como en el granito). Las extrusivas (o volcánicas) se forman cuando la lava se enfría rápidamente en la superficie, resultando en cristales muy pequeños o incluso una textura vítrea (como en el basalto o la obsidiana).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usan las rocas en la vida cotidiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las rocas están presentes en numerosos aspectos del día a día. El granito se usa en encimeras y pavimentos; la caliza es la base del cemento y el hormigón; la pizarra se emplea en tejados y revestimientos; el mármol en decoración y escultura; y el sílex fue fundamental como herramienta en la prehistoria. El yeso, la sal gema y el carbón también son rocas o minerales con usos industriales y domésticos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la escala de Mohs y cómo se usa para identificar rocas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala de Mohs es una escala del 1 al 10 que mide la dureza de los minerales según cuáles rayan a cuáles. El talco (1) es el más blando y el diamante (10) el más duro. Se usa para identificar minerales mediante pruebas simples: si una moneda de cobre (dureza ~3) raya el mineral, este tiene dureza inferior a 3. Es una herramienta básica en geología de campo.',
      },
    },
  ],
};

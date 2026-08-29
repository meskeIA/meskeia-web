import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-embriogenesis';
const TITLE = 'Embriogénesis: Del Cigoto al Embrión Trilaminar - meskeIA';
const DESCRIPTION =
  'Visualiza la fecundación, segmentación celular, formación de mórula/blástula/gástrula, las 3 capas germinales y la diferenciación de órganos en el desarrollo embrionario humano.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: TITLE,
  description: DESCRIPTION,
  url: URL,
  features: [
    'Animación SVG de la fecundación paso a paso',
    'Segmentación celular del día 1 al día 14',
    'Capas germinales: ectodermo, mesodermo y endodermo',
    'Señalización por morfógenos y organogénesis',
  ],
  category: 'EducationalApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la embriogénesis y cuánto tiempo dura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La embriogénesis es el proceso de desarrollo desde el óvulo fecundado (cigoto) hasta un organismo con los tejidos y órganos básicos formados. En humanos, el período embrionario abarca desde la fecundación hasta la semana 8 de gestación; a partir de entonces se denomina feto. En las primeras dos semanas ocurren la segmentación, la implantación y la gastrulación, etapas críticas para el desarrollo posterior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las capas germinales y qué órganos forma cada una?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tres capas germinales se forman durante la gastrulación (días 14-21). El ectodermo origina la piel, el sistema nervioso y los órganos sensoriales. El mesodermo da lugar a músculos, huesos, corazón, riñones y sistema circulatorio. El endodermo forma el revestimiento del tubo digestivo, los pulmones, el hígado y el páncreas. Esta organización trilaminar es común a todos los vertebrados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre durante la segmentación celular en las primeras semanas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tras la fecundación, el cigoto sufre divisiones mitóticas rápidas sin crecimiento celular: primero forma una mórula (sólida, ~16 células en el día 3-4), luego una blástula o blastocisto con una cavidad interna. Alrededor del día 6-7 el blastocisto se implanta en el endometrio uterino. Las células de la masa celular interna del blastocisto son pluripotentes y darán lugar al embrión propiamente dicho.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se diferencia la embriogénesis humana de la de otros animales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El patrón básico (cigoto → mórula → blástula → gástrula → neurulación) es conservado en todos los vertebrados, reflejo de un origen evolutivo común. Las diferencias principales en humanos son la placenta hemocorial (sangre materna en contacto directo con trofoblasto), la larga duración del desarrollo fetal (9 meses) y la neotenia cerebral: el cerebro humano continúa madurando hasta los 25 años, mucho más que en otros primates.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los morfógenos y qué papel tienen en el desarrollo embrionario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los morfógenos son moléculas de señalización que se difunden desde una fuente y crean gradientes de concentración. Las células responden de forma diferente según la concentración que reciben, activando distintos genes y adquiriendo identidades distintas. Ejemplos clave son Sonic Hedgehog (SHH), que dirige la formación del eje dorsoventral, y las proteínas BMP, que controlan la especificación de la placa neural. Los defectos en estas vías causan malformaciones congénitas.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fosiles y Tiempo Geologico - 4.500 Millones de Anos en un Vistazo | meskeIA',
  description: 'Explora las eras geologicas, las 5 grandes extinciones y como se datan los fosiles. Timeline interactivo de 4.500 Ma, analogia del reloj de 24h y metodos de datacion.',
  keywords: 'fosiles, tiempo geologico, eras geologicas, extinciones masivas, datacion fosiles, Cambrico, Mesozoico, Cenozoico, carbono 14, estratigrafia, paleontologia visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Fosiles y Tiempo Geologico - 4.500 Ma en un Vistazo',
    description: 'Timeline interactivo de las eras geologicas, 5 grandes extinciones y metodos de datacion de fosiles.',
    url: 'https://meskeia.com/visualizador-fosiles-tiempo-geologico/',
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
    title: 'Fosiles y Tiempo Geologico - Explicador Visual',
    description: 'Si la Tierra fuera un dia de 24h, los humanos aparecemos en los ultimos 4 segundos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Fosiles Geologico meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Fosiles y Tiempo Geologico - 4.500 Millones de Anos en un Vistazo',
  description: 'Explicador visual interactivo sobre las eras geologicas, fosiles representativos, las 5 grandes extinciones masivas y metodos de datacion como carbono-14 y estratigrafia.',
  url: 'https://meskeia.com/visualizador-fosiles-tiempo-geologico/',
  category: 'EducationalApplication',
  features: [
    'Timeline interactivo de 4.500 millones de anos con eras y periodos clickables',
    'Analogia visual: si la Tierra fuera un dia de 24 horas',
    'Las 5 grandes extinciones masivas con barras de impacto',
    'Metodos de datacion: carbono-14, potasio-argon, estratigrafia, fosiles guia',
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
      name: '¿Cuántos años tiene la Tierra y cómo se divide ese tiempo en eras geológicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Tierra tiene aproximadamente 4.500 millones de años. Los geólogos dividen ese tiempo en eones, eras, períodos y épocas. Los dos grandes eones son el Precámbrico (que abarca el 88% del tiempo geológico, hasta hace 541 Ma) y el Fanerozoico, que comprende las tres eras más conocidas: Paleozoico, Mesozoico y Cenozoico. El Cenozoico, donde vivimos, comenzó hace solo 66 millones de años tras la extinción de los dinosaurios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las 5 grandes extinciones masivas y cuál fue la más devastadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cinco grandes extinciones masivas del Fanerozoico son: Ordovícico-Silúrico (hace 443 Ma, ~85% especies), Devónico tardío (hace 375 Ma, ~75%), Pérmico-Triásico (hace 252 Ma, ~96% — la más devastadora de todas), Triásico-Jurásico (hace 201 Ma, ~80%) y Cretácico-Paleógeno (hace 66 Ma, ~76%, incluye dinosaurios). La extinción del Pérmico fue tan catastrófica que casi acabó con toda la vida compleja en los océanos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se data la edad de un fósil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen varios métodos complementarios. La datación por carbono-14 funciona para fósiles de menos de 50.000 años, ya que este isótopo radiactivo tiene una vida media de 5.730 años. Para fósiles más antiguos se usa potasio-argón (hasta 4.500 Ma) o uranio-plomo. La estratigrafía ubica el fósil en una capa de roca cuya edad se conoce. Los fósiles guía son especies de vida breve y amplia distribución que permiten correlacionar capas de distintos lugares del mundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que si la Tierra fuera un día de 24 horas los humanos aparecemos en los últimos segundos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una analogía para visualizar la inmensidad del tiempo geológico. Si los 4.500 millones de años de la Tierra se comprimieran en un solo día de 24 horas, los primeros organismos multicelulares aparecerían pasadas las 20:00 h, los dinosaurios llegarían a las 22:56 h y se extinguirían a las 23:39 h. El Homo sapiens aparecería aproximadamente a las 23:59:56, es decir, solo 4 segundos antes de medianoche. Toda la historia registrada humana equivaldría a menos de medio segundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia paleontología de geología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La geología estudia la composición, estructura y procesos de la Tierra: formación de rocas, placas tectónicas, volcanes, erosión. La paleontología es una subdisciplina que estudia específicamente los fósiles —restos o huellas de organismos del pasado preservados en rocas sedimentarias— para reconstruir la historia de la vida. Ambas disciplinas se complementan estrechamente: la geología proporciona el contexto temporal y ambiental, y la paleontología aporta información sobre los seres vivos que habitaron esos ambientes.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Electroquímica: Pilas, Electrólisis y Baterías | meskeIA',
  description: 'Visualizador interactivo de electroquímica: pila galvánica de Daniell, serie electroquímica, electrólisis del agua y baterías Li-ion. Reacciones redox animadas.',
  keywords: 'electroquímica, pila galvánica, daniell, electrólisis, batería litio, reacciones redox, oxidación reducción, serie electroquímica, potencial estándar, FEM',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Electroquímica: Pilas, Electrólisis y Baterías',
    description: 'Cómo la química genera electricidad y viceversa — pilas galvánicas, electrólisis y baterías Li-ion con animaciones interactivas.',
    url: 'https://meskeia.com/visualizador-electroquimica/',
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
    title: 'Electroquímica - Explicador Visual',
    description: 'Pilas, electrólisis y baterías: la química que mueve el mundo moderno, con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Electroquímica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Electroquímica: Pilas, Electrólisis y Baterías',
  description: 'Visualizador interactivo de electroquímica: pila galvánica de Daniell animada, serie electroquímica con calculadora de FEM, electrólisis del agua y mecanismo de baterías Li-ion.',
  url: 'https://meskeia.com/visualizador-electroquimica/',
  category: 'EducationalApplication',
  features: [
    'Pila galvánica de Daniell con animación de electrones e iones',
    'Serie electroquímica con 12 pares redox y calculadora de FEM',
    'Electrólisis del agua: burbujas animadas y relación 2:1 H₂/O₂',
    'Mecanismo de batería Li-ion con toggle carga/descarga',
    'Comparativa de tecnologías de baterías',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una pila galvánica y cómo genera electricidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una pila galvánica convierte energía química en energía eléctrica mediante reacciones redox espontáneas. En la pila de Daniell, el zinc se oxida en el ánodo (pierde electrones) y el cobre se reduce en el cátodo (gana electrones). Los electrones viajan por el circuito externo generando corriente, mientras que los iones migran a través de un puente salino para mantener la neutralidad de carga. La diferencia de potencial estándar de la pila de Daniell es +1,10 V.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la serie electroquímica y cómo se usa para calcular la FEM de una pila?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La serie electroquímica ordena los pares redox según su potencial de reducción estándar (E°) medido respecto al electrodo estándar de hidrógeno. Para calcular la fuerza electromotriz (FEM) de una pila se resta el potencial del ánodo al del cátodo: FEM = E°cátodo − E°ánodo. Si la FEM es positiva, la reacción es espontánea. Por ejemplo, Ag⁺/Ag (E°=+0,80 V) y Zn²⁺/Zn (E°=−0,76 V) dan una FEM de +1,56 V.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la electrólisis del agua y qué gases produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La electrólisis del agua aplica corriente eléctrica continua para descomponer el agua en sus elementos. En el cátodo (polo negativo) se produce hidrógeno (2H⁺ + 2e⁻ → H₂) y en el ánodo (polo positivo) se produce oxígeno (2H₂O → O₂ + 4H⁺ + 4e⁻). La relación de volúmenes es siempre 2:1 (H₂:O₂). Se necesita al menos 1,23 V teóricos, aunque en la práctica se requieren unos 1,8-2,0 V por sobretensión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona una batería de iones de litio (Li-ion)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una batería Li-ion, los iones de litio (Li⁺) se desplazan entre el ánodo de grafito y el cátodo de óxido de litio-metal (como LiCoO₂) a través de un electrolito líquido orgánico. Al cargar, los iones Li⁺ migran del cátodo al ánodo; al descargar, regresan al cátodo liberando electrones al circuito externo. Este proceso de intercalación es reversible y permite miles de ciclos de carga. La tensión nominal es ~3,6-3,7 V por celda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una pila galvánica y una batería recargable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una pila galvánica (primaria), las reacciones redox son irreversibles: los reactivos se consumen y la pila se agota definitivamente. En una batería recargable (secundaria), como las Li-ion o plomo-ácido, las reacciones son reversibles: aplicando corriente eléctrica se invierte la reacción y se regeneran los reactivos. La ventaja de las recargables es económica y ambiental, pero tienen una vida útil limitada por degradación de los electrodos tras cientos o miles de ciclos.',
      },
    },
  ],
};

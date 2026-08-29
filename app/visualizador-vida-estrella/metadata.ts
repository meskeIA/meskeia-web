import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Vida de una Estrella - De la Nebulosa al Agujero Negro | meskeIA',
  description: 'Entiende cómo nacen, viven y mueren las estrellas: nebulosas, fusión nuclear, supernovas, enanas blancas, estrellas de neutrones y agujeros negros. Explicador visual interactivo.',
  keywords: 'vida estrella, evolución estelar, supernova, agujero negro, enana blanca, nebulosa, fusión nuclear, diagrama HR, polvo de estrellas, nucleosíntesis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Vida de una Estrella - De la Nebulosa al Agujero Negro',
    description: 'Cómo nacen, viven y mueren las estrellas. Fusión nuclear, supernovas y agujeros negros explicados visualmente.',
    url: 'https://meskeia.com/visualizador-vida-estrella/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Vida de una Estrella - Explicador Visual',
    description: 'El ciclo de vida estelar explicado: del hidrógeno al agujero negro.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: { 'application-name': 'Vida Estrella meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Vida de una Estrella - De la Nebulosa al Agujero Negro',
  description: 'Explicador visual interactivo sobre la evolución estelar: cómo nacen las estrellas en nebulosas, viven fusionando hidrógeno, y mueren como enanas blancas, estrellas de neutrones o agujeros negros según su masa.',
  url: 'https://meskeia.com/visualizador-vida-estrella/',
  category: 'EducationalApplication',
  features: [
    'Ciclo completo de vida estelar: nacimiento, vida adulta y muerte',
    'Slider de masa estelar (0,5x a 20x Sol) con efectos visuales',
    'Camino de muerte bifurcado según masa: enana blanca vs agujero negro',
    'Tabla periódica coloreada por origen estelar (Big Bang, estrellas, supernovas)',
    'Diagrama Hertzsprung-Russell simplificado',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo nace una estrella?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las estrellas nacen en nebulosas, nubes de gas (principalmente hidrógeno) y polvo interestelar. Cuando una región de la nebulosa alcanza suficiente densidad por su propia gravedad, el gas colapsa formando una protoestrella. Al aumentar la temperatura y presión en el núcleo hasta unos 10 millones de kelvin, se desencadena la fusión nuclear del hidrógeno en helio, y la estrella entra en la secuencia principal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué determina el destino final de una estrella?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La masa inicial es el factor decisivo. Las estrellas de baja y media masa (como el Sol) terminan como gigantes rojas y luego como enanas blancas rodeadas de una nebulosa planetaria. Las estrellas muy masivas (más de 8 masas solares) mueren en una supernova y dejan como remanente una estrella de neutrones o, si la masa residual supera unas 3 masas solares, un agujero negro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una supernova y por qué ocurre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una supernova es una explosión estelar catastrófica que ocurre cuando una estrella masiva agota el combustible de su núcleo. Sin la presión de la fusión nuclear, el núcleo colapsa en milisegundos bajo su propia gravedad; la energía liberada expulsa las capas exteriores a miles de kilómetros por segundo, con una luminosidad que puede superar la de toda una galaxia durante semanas. En ese proceso se forjan elementos pesados como el hierro, el oro o el uranio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo vive una estrella como el Sol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sol tiene una vida estimada de unos 10.000 millones de años en la secuencia principal, de los cuales lleva unos 4.600 millones transcurridos. En general, cuanto más masiva es una estrella, más corta es su vida: una estrella de 20 masas solares puede agotar su combustible en apenas unos pocos millones de años, mientras que una estrella de muy poca masa (enana roja) puede vivir billones de años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿De dónde vienen los elementos químicos del cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de los elementos que componen el cuerpo humano se fabricaron en el interior de estrellas o en explosiones de supernovas. El hidrógeno proviene del Big Bang; el carbono, nitrógeno, oxígeno y hierro se forjaron en núcleos estelares; y elementos más pesados como el yodo o el zinc se originaron en supernovas o colisiones de estrellas de neutrones. Somos, literalmente, polvo de estrellas reciclado.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las Fuerzas Invisibles del Día a Día - Física para Bachillerato | meskeIA',
  description: 'Descubre las 5 fuerzas físicas que gobiernan tu vida cotidiana: gravedad, fricción, inercia, presión atmosférica y tensión superficial. Explicadas con ejemplos reales.',
  keywords: 'fuerzas físicas cotidianas, gravedad, fricción, inercia, presión atmosférica, tensión superficial, física bachillerato, explicador visual, física cotidiana',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las Fuerzas Invisibles del Día a Día',
    description: 'Por qué no flotas, no resbalas, te lanzas al frenar, te duelen los oídos en el avión y los insectos flotan en el agua. Física explicada para todos.',
    url: 'https://meskeia.com/visualizador-fuerzas-invisibles/',
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
    title: 'Las Fuerzas Invisibles del Día a Día',
    description: 'Gravedad, fricción, inercia, presión atmosférica y tensión superficial. Las fuerzas que mueven tu vida sin que las veas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Fuerzas Invisibles meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Las Fuerzas Invisibles del Día a Día',
  description: 'Explicador visual de las 5 fuerzas físicas cotidianas: gravedad, fricción, inercia, presión atmosférica y tensión superficial. Cada fuerza con ejemplo cotidiano, explicación simple y dato sorprendente. Ideal para Bachillerato y curiosos.',
  url: 'https://meskeia.com/visualizador-fuerzas-invisibles/',
  features: [
    '5 fuerzas físicas explicadas con ejemplos de la vida cotidiana',
    'Bloques clickables que despliegan explicación detallada',
    'Datos sorprendentes para cada fuerza',
    'Sección educativa con física profunda y aplicaciones prácticas',
    'Ideal para preparar Bachillerato y selectividad',
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
      name: '¿Qué son las fuerzas invisibles que actúan en el día a día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son fuerzas físicas que actúan constantemente sobre los objetos y las personas aunque no podamos verlas: la gravedad (que nos mantiene pegados al suelo), la fricción (que impide que nos resbalemos), la inercia (que nos empuja hacia adelante al frenar), la presión atmosférica (que sentimos al subir en avión) y la tensión superficial (que permite a los insectos caminar sobre el agua). Todas ellas son descritas por las leyes de la física clásica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la tensión superficial a los insectos que caminan sobre el agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tensión superficial es la tendencia de la superficie del agua a comportarse como una membrana elástica, fruto de las fuerzas de cohesión entre moléculas. Insectos como el zapatero (Gerris lacustris) pesan tan poco y distribuyen su peso en una superficie tan grande que no rompen esa membrana. Si su peso por unidad de área supera la tensión superficial del agua (≈0,073 N/m a 20 °C), se hundirían.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué duelen los oídos al subir en avión y cómo lo explica la presión atmosférica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al aumentar la altitud, la presión atmosférica exterior disminuye mientras el oído medio mantiene momentáneamente la presión interna más alta. Esta diferencia de presión deforma el tímpano y provoca dolor o sensación de taponamiento. Bostezar o tragar saliva abre la trompa de Eustaquio y equilibra las presiones a ambos lados del tímpano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este explicador de física?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El explicador está orientado principalmente a estudiantes de educación secundaria y bachillerato que estudian física, aunque cualquier persona curiosa puede aprovecharlo sin conocimientos previos. Los contenidos cubren los conceptos del currículo de física de bachillerato relativos a fuerzas y leyes de Newton, con ejemplos cotidianos que facilitan la comprensión intuitiva antes de abordar las fórmulas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre inercia y fricción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inercia es la tendencia de un objeto a mantener su estado de reposo o movimiento uniforme; no es una fuerza en sí misma sino una propiedad de la materia descrita por la primera ley de Newton. La fricción, en cambio, sí es una fuerza de contacto que se opone al movimiento relativo entre dos superficies. Cuando frenamos en el coche, la inercia nos "lanza" hacia adelante, mientras que la fricción de los frenos es la fuerza que detiene las ruedas.',
      },
    },
  ],
};

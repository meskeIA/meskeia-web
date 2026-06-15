import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Músculos y Movimiento - Contracción, Articulaciones y ATP | meskeIA',
  description: 'Sarcómero, actina/miosina, tipos de músculo (esquelético, liso, cardíaco), articulaciones y palancas. Explicador visual interactivo.',
  keywords: 'musculos, contraccion muscular, sarcomero, actina, miosina, articulaciones, ATP, musculo esqueletico, musculo liso, musculo cardiaco',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Músculos y Movimiento - Contracción, Articulaciones y ATP',
    description: 'Tipos de músculo, sarcómero, modelo de filamentos deslizantes y articulaciones del cuerpo humano explicados visualmente.',
    url: 'https://meskeia.com/visualizador-musculos-movimiento/',
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
    title: 'Músculos y Movimiento - Explicador Visual',
    description: 'Del sarcómero a las articulaciones: cómo se mueve el cuerpo humano.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Músculos y Movimiento meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Músculos y Movimiento - Contracción, Articulaciones y ATP',
  description: 'Explicador visual interactivo de músculos: tipos de tejido muscular, contracción del sarcómero (actina/miosina), articulaciones y palancas, datos y curiosidades.',
  url: 'https://meskeia.com/visualizador-musculos-movimiento/',
  category: 'EducationalApplication',
  features: [
    'Tipos de músculo con SVG de fibras',
    'Sarcómero y modelo de filamentos deslizantes',
    'Articulaciones y sistema de palancas',
    'Datos y curiosidades musculares',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos tipos de músculo hay en el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen tres tipos de tejido muscular: el músculo esquelético, voluntario y estriado, que mueve el esqueleto y representa el 40-50% de la masa corporal; el músculo liso, involuntario, presente en órganos internos como el estómago, los intestinos y los vasos sanguíneos; y el músculo cardíaco, involuntario y estriado de forma especial, que constituye el corazón y se contrae de forma autónoma sin fatigarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se contrae un músculo a nivel molecular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La contracción muscular sigue el modelo de filamentos deslizantes: en el sarcómero (unidad funcional del músculo), las cabezas de miosina se unen a los filamentos de actina y los deslizan hacia el centro usando energía procedente del ATP. Este ciclo de unión, tracción y liberación se repite miles de veces por segundo, acortando el sarcómero y, en cascada, todo el músculo. El calcio liberado por el retículo sarcoplasmático actúa como señal desencadenante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el ATP y por qué es imprescindible para el movimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ATP (adenosín trifosfato) es la molécula energética universal de las células. En la contracción muscular, la hidrólisis de ATP a ADP proporciona la energía que permite a las cabezas de miosina realizar el golpe de potencia sobre la actina. Sin ATP, las cabezas quedan unidas irreversiblemente a la actina, lo que explica la rigidez muscular post-mortem (rigor mortis). El músculo obtiene ATP de la fosfocreatina, la glucólisis y la fosforilación oxidativa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipos de articulaciones existen y cómo condicionan el movimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las articulaciones se clasifican por su movilidad: las sinartrosis son fijas (como las suturas del cráneo); las anfiartrosis permiten movimientos mínimos (como los discos intervertebrales); y las diartrosis son las más móviles, con cartílago y líquido sinovial. Dentro de las diartrosis hay subtipos según su geometría: esféricas (hombro, cadera, 3 ejes), bisagras (codo, rodilla, 1 eje), pivote (cúbito-radio, rotación), silla de montar (pulgar) y planas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las palancas musculares y cómo afectan a la fuerza y la velocidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema músculo-hueso funciona como palancas de primer, segundo o tercer género según la posición relativa del fulcro (articulación), la fuerza (músculo) y la resistencia (carga). La mayoría de los movimientos humanos usan palancas de tercer género, donde el músculo se inserta cerca de la articulación: esto reduce la fuerza mecánica pero multiplica la velocidad y el rango de movimiento. Es el compromiso evolutivo que permite movimientos rápidos y precisos a costa de requerir más fuerza muscular bruta.',
      },
    },
  ],
};

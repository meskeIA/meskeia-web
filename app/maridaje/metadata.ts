import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Maridaje: qué vino o cerveza con cada plato | meskeIA',
  description:
    'Descubre qué vino y qué cerveza maridan mejor con cada plato: carnes, pescado, marisco, pasta, picante, quesos o postres, y por qué. Bebe con responsabilidad. Gratis y en español.',
  keywords:
    'maridaje vino comida, que vino con carne, que cerveza con pescado, maridaje queso, vino para pasta, maridaje postres, que beber con cada plato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Maridaje: vino y cerveza para cada plato', description: 'Qué vino y qué cerveza maridan mejor con cada plato, y por qué.', url: 'https://meskeia.com/maridaje', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Maridaje de comida', description: 'Qué vino o cerveza elegir según el plato.' },
  other: { 'application-name': 'Maridaje meskeIA' },
  alternates: { canonical: 'https://meskeia.com/maridaje/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Maridaje de comida con vino y cerveza',
  description:
    'Sugerencias de maridaje de vino y cerveza según el tipo de plato (carnes rojas, aves, pescado, marisco, pasta, comida picante, quesos, postres y verduras), con una explicación de por qué combinan, como orientación para acompañar tus comidas.',
  url: 'https://meskeia.com/maridaje/',
  features: [
    'Vino y cerveza recomendados por tipo de plato',
    'Explicación del porqué de cada maridaje',
    'Carnes, pescados, pasta, quesos, postres y más',
    'Orientación para acompañar tus comidas',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué vino va con la carne roja?', acceptedAnswer: { '@type': 'Answer', text: 'Las carnes rojas y los asados piden tintos con cuerpo y taninos, como un Rioja, un Ribera del Duero o un Malbec. Los taninos del vino cortan la grasa de la carne y aguantan sus sabores intensos. Si prefieres cerveza, una tostada o negra (brown ale, stout) acompaña muy bien.' } },
    { '@type': 'Question', name: '¿Qué beber con el pescado?', acceptedAnswer: { '@type': 'Answer', text: 'El pescado blanco marida con vinos blancos secos y frescos como un Albariño o un Verdejo, que limpian el paladar sin tapar su sabor delicado. En cerveza, una rubia ligera o una pilsner funcionan bien. Para el marisco, un blanco fresco o un cava brut realzan su yodo y dulzor.' } },
    { '@type': 'Question', name: '¿Qué se bebe con comida picante?', acceptedAnswer: { '@type': 'Answer', text: 'Con el picante van mejor las bebidas con un toque dulce y muy frías: un vino blanco semidulce o un rosado afrutado, o una cerveza rubia muy fría. El dulzor y el frío calman la sensación de picor mucho mejor que un tinto potente, que la intensifica.' } },
    { '@type': 'Question', name: '¿El maridaje es una regla fija?', acceptedAnswer: { '@type': 'Answer', text: 'No: el maridaje es una orientación, no una norma. La idea es que la bebida y el plato se realcen, pero el mejor maridaje es siempre el que te gusta. Las sugerencias sirven de punto de partida; a partir de ahí, experimenta y quédate con lo que más disfrutes.' } },
    { '@type': 'Question', name: '¿Hay maridajes para el postre?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. La idea clásica es acompañar dulce con dulce: un vino dulce o espumoso semiseco (moscatel, cava semi) o una cerveza negra dulce o de frutas. Así el postre no apaga la bebida. Un vino seco junto a un postre muy dulce suele quedar áspero y desequilibrado.' } },
  ],
};

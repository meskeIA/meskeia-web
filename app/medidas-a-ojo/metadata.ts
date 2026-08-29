import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Medidas "a ojo": cuánto es una pizca, un chorro, un vaso | meskeIA',
  description:
    'Cuánto es realmente una pizca, un chorro, un vaso, un puñado o una nuez de mantequilla. Traduce las medidas imprecisas de las recetas a cantidades aproximadas. Gratis y en español.',
  keywords:
    'cuanto es una pizca, cuanto es un chorro, medidas a ojo cocina, un vaso cuantos ml, un puñado gramos, nuez de mantequilla, equivalencias medidas recetas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Medidas "a ojo" de las recetas', description: 'Cuánto es una pizca, un chorro, un vaso o un puñado en cantidades aproximadas.', url: 'https://meskeia.com/medidas-a-ojo', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Medidas a ojo de las recetas', description: 'Pizca, chorro, vaso, puñado… en cantidades aproximadas.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Medidas a ojo meskeIA' },
  alternates: { canonical: 'https://meskeia.com/medidas-a-ojo/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Medidas "a ojo" de las recetas',
  description:
    'Tabla de equivalencias de las medidas imprecisas que usan las recetas —una pizca, un chorro, un vaso, un puñado, una nuez de mantequilla, un diente de ajo— traducidas a cantidades aproximadas en gramos o mililitros para poder medirlas o pesarlas.',
  url: 'https://meskeia.com/medidas-a-ojo/',
  features: [
    'Equivalencias de medidas imprecisas a gramos/ml',
    'Pizca, chorro, vaso, puñado y más',
    'Para interpretar recetas "a ojo"',
    'Notas de uso de cada medida',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánto es una pizca?', acceptedAnswer: { '@type': 'Answer', text: 'Una pizca es aproximadamente lo que cogen dos o tres dedos, alrededor de 0,3 gramos. Se usa sobre todo para la sal, las especias y la levadura. Un "pellizco" es algo más, entre medio gramo y un gramo. Son cantidades pequeñas pensadas para ajustar al gusto, no para ser exactas.' } },
    { '@type': 'Question', name: '¿Cuántos mililitros tiene un vaso?', acceptedAnswer: { '@type': 'Answer', text: 'Un vaso de agua "normal" ronda los 200-250 ml, aunque varía según el vaso. Un vaso de vino es más pequeño, unos 100-125 ml. Como las recetas antiguas suelen medir en vasos, conviene saber a qué vaso se refieren; ante la duda, 200 ml para el de agua es una buena referencia.' } },
    { '@type': 'Question', name: '¿Qué diferencia hay entre un chorro y un chorrito?', acceptedAnswer: { '@type': 'Answer', text: 'Un chorrito es una cantidad muy pequeña, alrededor de una cucharadita (5 ml), para vinagre, esencias o salsa de soja. Un chorro es algo más generoso, en torno a una cucharada (15 ml), como el golpe de aceite que se añade a una sartén. Son medidas al gusto y aproximadas.' } },
    { '@type': 'Question', name: '¿Cuánto es un puñado?', acceptedAnswer: { '@type': 'Answer', text: 'Un puñado es lo que cabe en una mano cerrada, que para frutos secos u hojas ronda los 30 gramos. Como depende del tamaño de la mano, es una medida orientativa: úsala para cosas donde la cantidad exacta no es crítica, como un puñado de pasta, de espinacas o de almendras.' } },
    { '@type': 'Question', name: '¿Por qué las recetas usan medidas imprecisas?', acceptedAnswer: { '@type': 'Answer', text: 'Porque muchas recetas vienen de la tradición oral, donde se cocinaba con la mano y el gusto más que con báscula. Esas medidas funcionan para platos flexibles (un guiso, un sofrito), pero no para repostería, donde las proporciones importan. Para esos casos, traducir la medida a gramos o ml ayuda a que salga igual cada vez.' } },
  ],
};

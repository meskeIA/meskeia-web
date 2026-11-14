import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Ganache — Proporciones de Chocolate y Nata según Textura | meskeIA',
  description: 'Calcula las proporciones exactas de chocolate y nata para ganache según el tipo de chocolate y la textura deseada: glaseado, trufa o firme. Ratios profesionales al instante.',
  keywords: 'calculadora ganache, proporciones ganache, chocolate nata ratio, ganache trufa, ganache glaseado, ganache firme, repostería, chocolate negro blanco con leche',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-ganache/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Ganache - Proporciones de Chocolate y Nata',
    description: 'Calcula las proporciones exactas de chocolate y nata para ganache según el tipo de chocolate y la textura deseada.',
    url: 'https://meskeia.com/calculadora-ganache/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Ganache | meskeIA',
    description: 'Ratios profesionales de ganache: chocolate negro, con leche o blanco para glaseado, trufa o bombones.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Ganache meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Ganache',
  description: 'Calculadora de proporciones de ganache para repostería: selecciona el tipo de chocolate (negro extra, negro, semi-fondant, con leche o blanco) y la textura deseada (glaseado, trufa o firme) para obtener las cantidades exactas de chocolate y nata.',
  url: 'https://meskeia.com/calculadora-ganache/',
  category: 'UtilityApplication',
  features: [
    'Ratios de ganache para 5 tipos de chocolate',
    'Tres texturas: glaseado, trufa y firme',
    'Cantidades exactas de chocolate y nata en gramos',
    'Temperatura de trabajo recomendada para cada textura',
    'Usos típicos de cada combinación de ganache',
    'En español',
  ],
  keywords: ['ganache', 'proporciones chocolate', 'nata ganache', 'repostería', 'trufas chocolate'],
});

// ❓ FAQ — FUENTE ÚNICA: la pinta page.tsx (FAQ visible) y de aquí sale el FAQPage (§1.ter).
// Hallazgo 4599 (14/11/2026): el FAQPage daba otros ratios y otra temperatura de la trufa que el
// motor (RATIOS_GANACHE y TEMPERATURA_TRABAJO de lib/calculadoras/cocina.ts) y no se veía en la
// página. Las cifras de aquí son las del motor: si cambian allí, cambian aquí.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué es el ganache y para qué se usa en repostería?',
    answer: 'El ganache es una mezcla emulsionada de chocolate y nata caliente que, según la proporción y el tipo de chocolate, resulta en una textura fluida, cremosa o firme. Se usa como glaseado para tartas, relleno de bombones y trufas, cobertura de pasteles o base para mousses.',
  },
  {
    question: '¿Cuál es la proporción de chocolate y nata para hacer ganache?',
    answer: 'Depende del chocolate y del uso. Con chocolate negro (55–69 % de cacao), la calculadora usa 1,2:1 para glaseado, 2,2:1 para trufa y 3:1 para firme; con negro extra (70 % o más), 1:1, 2:1 y 3:1. El chocolate con leche y el blanco necesitan más chocolate por cada parte de nata para la misma textura: con leche, 2:1, 3:1 y 4:1; blanco, 3:1, 4:1 y 5:1.',
  },
  {
    question: '¿Por qué el ganache de chocolate blanco necesita más chocolate que el negro?',
    answer: 'El chocolate blanco no lleva pasta de cacao: se hace con manteca de cacao (al menos un 20 %, según la normativa española), leche y azúcar. Esa composición lo hace más blando a temperatura ambiente y con menor capacidad de cuajar. Para lograr una textura equivalente a la del chocolate negro hay que subir la proporción de chocolate respecto a la nata.',
  },
  {
    question: '¿A qué temperatura se trabaja el ganache según su uso?',
    answer: 'Para glasear tartas se usa a 30–32 °C, cuando está fluido pero empieza a espesar. Para trufas se refrigera 2–4 horas y se trabaja a 17–20 °C para bolearlas. El ganache firme se refrigera 4–6 horas y se deja unos 5 minutos a temperatura ambiente antes de manipularlo.',
  },
  {
    question: '¿Por qué el ganache se corta o queda grumoso y cómo se arregla?',
    answer: 'El ganache se corta cuando la emulsión entre la grasa del chocolate y el agua de la nata se rompe, generalmente por una diferencia de temperatura brusca o por un ratio incorrecto. Para recuperarlo, calienta ligeramente la mezcla a 40–45 °C y bate con un batidor de mano o túrmix hasta que vuelva a emulsionar. Añadir una cucharada de nata tibia también puede ayudar.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

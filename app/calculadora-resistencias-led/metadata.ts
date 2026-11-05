import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

// Desde el 05/11/2026 (S0251) el decodificador del código de colores vive en su propia app,
// /codigo-colores-resistencias/: aquí, bajo un título de LED, Google no la enseñaba para esa
// búsqueda. Esta se queda con el cálculo de la resistencia limitadora y da los colores del valor
// E12 que recomienda, con el motor compartido de lib/calculadoras/codigoColoresResistencias.ts.
export const metadata: Metadata = {
  title: 'Calculadora de Resistencia para LED: Valor, Potencia y Colores | meskeIA',
  description:
    'Calcula la resistencia limitadora de un LED con la ley de Ohm: valor exacto, valor comercial E12 más cercano con sus colores y potencia que disipa la resistencia.',
  keywords:
    'resistencia para led, calculadora resistencia led, resistencia led 5v, resistencia led 12v, que resistencia lleva un led, resistencia limitadora, ley de ohm led, resistencia led arduino, e12',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Resistencia para LED',
    description:
      'Valor exacto, valor comercial E12 con sus colores y potencia disipada de la resistencia de un LED.',
    url: 'https://meskeia.com/calculadora-resistencias-led',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Resistencia para LED',
    description: 'Qué resistencia lleva tu LED, su valor comercial, sus colores y su potencia.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora Resistencias LED meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Resistencia para LED',
  description:
    'Calcula la resistencia limitadora de un LED a partir de la tensión de alimentación, la tensión directa del LED y la corriente deseada, con el valor comercial E12 más cercano, sus colores y la potencia que disipa la resistencia.',
  url: 'https://meskeia.com/calculadora-resistencias-led/',
  category: 'UtilityApplication',
  features: [
    'Resistencia limitadora exacta por la ley de Ohm: R = (Vcc − Vf) / I',
    'Valor comercial E12 más cercano, también cuando está en la década siguiente',
    'Colores de las bandas del valor E12 recomendado',
    'Potencia disipada en la resistencia, con aviso por encima de ¼ W',
    'Tensión directa típica de LED rojo, naranja, amarillo, verde, azul, blanco e infrarrojo',
  ],
});

// FAQ: fuente única de la FAQ visible (page.tsx) y del FAQPage JSON-LD. Texto plano.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo calculo la resistencia limitadora para un LED?',
    answer:
      'Con la ley de Ohm: R = (Vcc − Vf) / I, donde Vcc es la tensión de alimentación, Vf la tensión directa del LED (de 1,8 a 2,2 V en un LED rojo, de 3 a 3,4 V en uno azul o blanco) e I la corriente que quieres que pase, normalmente de 10 a 20 mA. Con 5 V, un LED rojo de 2 V y 20 mA salen 150 Ω.',
  },
  {
    question: '¿Qué pasa si no pongo resistencia con un LED?',
    answer:
      'La corriente solo queda limitada por la fuente, y el LED se quema en poco tiempo, a veces en el acto. La resistencia limitadora es imprescindible siempre que el LED no vaya con un driver de corriente constante.',
  },
  {
    question: '¿Puedo usar una resistencia de más valor que la calculada?',
    answer:
      'Sí: pasará algo menos de corriente y el LED brillará un poco menos, pero durará más. Por debajo del valor calculado, en cambio, la corriente supera la prevista. Si el valor comercial más cercano queda por debajo, conviene tomar el siguiente hacia arriba.',
  },
  {
    question: '¿Qué es la serie E12 y por qué la recomiendan?',
    answer:
      'Es la serie normalizada de 12 valores por década en que se fabrican las resistencias más comunes: 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68 y 82, con sus múltiplos. Son los valores que se encuentran en cualquier tienda o surtido. La calculadora da el más cercano al exacto y los colores de sus bandas.',
  },
  {
    question: '¿Cómo sé la tensión directa (Vf) de mi LED?',
    answer:
      'Viene en la hoja de datos del fabricante. Como orientación: rojo, naranja y amarillo rondan los 2 V, verde de 2 a 3 V según la tecnología, y azul y blanco de 3 a 3,4 V. Si no la conoces, medir el LED con la función de diodo del multímetro da una primera idea.',
  },
  {
    question: '¿Qué potencia de resistencia debo usar?',
    answer:
      'La potencia que disipa es P = (Vcc − Vf) × I. Elige una resistencia que aguante al menos el doble: las de ¼ W (250 mW) sirven para casi todos los LED de 20 mA con alimentaciones de hasta 12 V. Si la calculadora avisa de que se superan los 250 mW, usa una de ½ W o más.',
  },
  {
    question: '¿Sirve para LED de alta potencia o tiras LED?',
    answer:
      'Está pensada para LED de indicación de 3 a 20 mA. Los LED de 1 W o más usan drivers de corriente constante y disipadores, y las tiras LED ya llevan sus resistencias y se alimentan a su tensión nominal (12 o 24 V), así que no necesitan este cálculo.',
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

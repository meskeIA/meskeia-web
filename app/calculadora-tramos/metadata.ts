import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora por Tramos: Progresiva o Escalonada, Tramo a Tramo - meskeIA',
  description:
    'Define tus propios tramos y calcula cualquier escala: impuesto progresivo, comisiones, tarifas por bloques o descuentos por volumen. Resultado de cada tramo, total, tipo medio y marginal.',
  keywords:
    'calculadora por tramos, escala progresiva, cálculo por tramos, tarifa escalonada, comisión escalonada, tarifa por bloques, descuento por volumen, tipo marginal, tipo medio, impuesto progresivo, función a trozos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora por Tramos: Progresiva o Escalonada',
    description:
      'Tus tramos, tu cantidad: el resultado de cada tramo, el total y la comparación entre cobrar por tramos o al tramo alcanzado.',
    url: 'https://meskeia.com/calculadora-tramos/',
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
    title: 'Calculadora por Tramos: Progresiva o Escalonada',
    description: 'Define tus tramos y mira cuánto sale en cada uno, por tramos o al tramo alcanzado.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora por Tramos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora por Tramos: Progresiva o Escalonada',
  description:
    'Calculadora genérica de escalas por tramos para cualquier país: el usuario define los límites y el tipo de cada tramo (porcentaje o precio por unidad) y obtiene el importe de cada tramo, el total, el tipo medio y el marginal, comparando el cálculo por tramos con el cálculo al tramo alcanzado.',
  url: 'https://meskeia.com/calculadora-tramos/',
  category: 'FinanceApplication',
  features: [
    'Tramos editables: límites y tipo de cada uno, sin tablas oficiales precargadas',
    'Tipo en porcentaje o en precio por unidad (tarifas por bloques, descuentos por volumen)',
    'Desglose tramo a tramo con la base que cae en cada uno y su importe',
    'Comparación entre cálculo por tramos (progresivo) y al tramo alcanzado (escalonado)',
    'Tipo medio y tipo marginal de la cantidad calculada',
    'Gráfica de las dos curvas con las zonas donde más base da peor resultado',
    'Símbolo de moneda y unidad configurables, válido para cualquier país',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

// FAQ — fuente única de la FAQ visible (page.tsx la importa y la pinta) y del FAQPage JSON-LD.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué diferencia hay entre calcular por tramos y al tramo alcanzado?',
    answer:
      'Por tramos (progresivo) cada parte de la cantidad paga el tipo de su propio tramo: con 0 % hasta 10.000 y 15 % después, 12.000 pagan 15 % solo sobre los 2.000 que pasan del límite, es decir 300. Al tramo alcanzado (escalonado) toda la cantidad paga el tipo del tramo al que llega: 12.000 al 15 % son 1.800. El primero no da saltos al cruzar un límite; el segundo sí.',
  },
  {
    question: '¿Es verdad que subir de tramo puede hacer que me quede menos dinero?',
    answer:
      'Con una escala por tramos, no: el tipo más alto se aplica solo a la parte que supera el límite, así que ganar 1 más nunca deja menos neto. Con una escala al tramo alcanzado, sí puede pasar: si al cruzar el límite toda la cantidad pasa a pagar el tipo mayor, hay una zona justo por encima donde queda menos que en el propio límite. La calculadora marca esa zona en la gráfica y te dice hasta dónde llega.',
  },
  {
    question: '¿Qué son el tipo medio y el tipo marginal?',
    answer:
      'El tipo marginal es el del tramo en el que cae la cantidad: lo que pagaría la siguiente unidad. El tipo medio es el importe total dividido entre la cantidad: lo que se paga de verdad en proporción. Con 35.000 y una escala de 0 %, 15 %, 25 % y 35 %, el marginal es el 25 % pero el medio es alrededor del 12,1 %.',
  },
  {
    question: '¿Sirve para el impuesto sobre la renta de mi país?',
    answer:
      'Sirve para cualquier escala que se pueda escribir como límites y tipos, así que puedes copiar la tabla de tu país y ver el resultado tramo a tramo. No trae tablas oficiales precargadas ni aplica deducciones, mínimos exentos o reglas especiales de ningún país: solo aplica la escala que tú escribas.',
  },
  {
    question: '¿Qué pasa si una cantidad cae justo en el límite de un tramo?',
    answer:
      'Pertenece al tramo de abajo. Un tramo que dice hasta 10.000 incluye el 10.000, y el siguiente empieza a contar a partir de ahí. Es la convención habitual de las escalas fiscales y de tarifas.',
  },
  {
    question: '¿Puedo usarla para tarifas de agua, luz o descuentos por volumen?',
    answer:
      'Sí. Cambia el tipo a precio por unidad y escribe el precio de cada bloque, por ejemplo 0,50 por m³ hasta 10 m³ y 1,00 a partir de ahí. Si el precio baja al comprar más, como en un descuento por volumen, la calculadora te avisa de la zona donde comprar algo más sale más barato que quedarse en el límite.',
  },
  {
    question: '¿Cómo se calcula el importe de cada tramo?',
    answer:
      'Para cada tramo se toma la parte de la cantidad que cae entre su inicio y su límite, y se multiplica por su tipo. La suma de todas esas partes es el total por tramos. Por ejemplo, 35.000 con tramos hasta 10.000, 30.000 y 60.000 se reparte en 10.000, 20.000 y 5.000.',
  },
  {
    question: '¿Qué relación tiene esto con las funciones definidas a trozos?',
    answer:
      'El importe por tramos es una función lineal a trozos y continua: su pendiente en cada tramo es el tipo marginal, y la pendiente de la recta que une el origen con un punto es el tipo medio. El importe al tramo alcanzado también es lineal a trozos, pero discontinuo: salta en cada límite. Ver las dos curvas juntas es un buen ejemplo de continuidad y discontinuidad.',
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

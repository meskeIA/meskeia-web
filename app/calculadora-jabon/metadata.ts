import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { formatNumber } from '@/lib';
import { ACEITES } from './aceites';

// Cifras de la FAQ calculadas desde la tabla, para que no se separen de lo que calcula la app
const SAP_OLIVA = ACEITES.find((a) => a.id === 'oliva')?.sapNaOH ?? 0;
const SAP_COCO = ACEITES.find((a) => a.id === 'coco')?.sapNaOH ?? 0;
const SOSA_KILO_OLIVA = 1000 * SAP_OLIVA;
const SOSA_KILO_OLIVA_SE5 = SOSA_KILO_OLIVA * 0.95;
const AGUA_33 = (SOSA_KILO_OLIVA_SE5 * 67) / 33;

export const metadata: Metadata = {
  title: 'Calculadora de Jabón Casero: Sosa (Soda Cáustica), Potasa y Agua - meskeIA',
  description:
    'Calcula la sosa o soda cáustica (NaOH) o la potasa (KOH) y el agua para tu mezcla de aceites, con sobreengrase, y la dureza, limpieza y espuma del jabón. 22 aceites.',
  keywords:
    'calculadora de jabón, calculadora de sosa, soda cáustica jabón, calculadora de lejía jabón, jabón casero, jabón potásico, potasa, sobreengrase, índice de saponificación, jabón de Castilla, jabón líquido casero',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Jabón Casero: Sosa, Potasa y Agua',
    description:
      'Tu mezcla de aceites → cuánta sosa o potasa y cuánta agua, con el sobreengrase que elijas y cómo saldrá el jabón.',
    url: 'https://meskeia.com/calculadora-jabon/',
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
    title: 'Calculadora de Jabón Casero: Sosa, Potasa y Agua',
    description: 'Cuánta sosa o potasa y cuánta agua para tu mezcla de aceites, con su sobreengrase.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Jabón meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Jabón Casero: Sosa, Potasa y Agua',
  description:
    'Calculadora de saponificación para jabón casero: a partir de la mezcla de aceites calcula la sosa cáustica (NaOH) o la potasa (KOH) que hay que pesar, el agua y la masa total, con sobreengrase y pureza del álcali, y estima la dureza, limpieza, acondicionamiento y espuma del jabón con el método de SoapCalc.',
  url: 'https://meskeia.com/calculadora-jabon/',
  category: 'UtilityApplication',
  features: [
    'Sosa cáustica (NaOH) para jabón en pastilla o potasa (KOH) para jabón blando y líquido',
    '22 aceites y mantecas con su índice de saponificación y perfil de ácidos grasos',
    'Sobreengrase y pureza del álcali configurables',
    'Agua por concentración de la lejía o por proporción agua:álcali',
    'Dureza, limpieza, acondicionamiento, burbuja, cremosidad, yodo e INS con sus rangos orientativos',
    'Escalar la receta a otro peso total manteniendo los porcentajes',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

// FAQ — fuente única de la FAQ visible (page.tsx la importa y la pinta) y del FAQPage JSON-LD.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuánta sosa cáustica necesito para hacer jabón con 1 kg de aceite de oliva?',
    answer:
      `El aceite de oliva tiene un índice de saponificación de ${formatNumber(SAP_OLIVA, 3)} g de sosa por gramo, así que 1000 g necesitan ${formatNumber(SOSA_KILO_OLIVA, 0)} g para saponificarse por completo. Con el sobreengrase habitual del 5 % se pesan ${formatNumber(SOSA_KILO_OLIVA_SE5, 2)} g de sosa. El agua depende de la concentración de lejía que elijas: al 33 % serían unos ${formatNumber(AGUA_33, 0)} g.`,
  },
  {
    question: '¿Qué es el sobreengrase y cuánto conviene?',
    answer:
      'Es el porcentaje de aceite que se deja sin saponificar a propósito, echando algo menos de álcali del que harían falta. Sirve de margen de seguridad, porque el índice de cada aceite es un promedio, y hace el jabón menos agresivo con la piel. En jabón en pastilla se suele usar entre el 5 y el 8 %; en jabón líquido de potasa, entre el 0 y el 3 %, porque un exceso de aceite lo enturbia.',
  },
  {
    question: '¿Qué diferencia hay entre usar sosa (NaOH) y potasa (KOH)?',
    answer:
      'La sosa o soda cáustica (hidróxido de sodio) da jabón duro en pastilla. La potasa (hidróxido de potasio) da jabón blando o una pasta que se diluye para hacer jabón líquido, el llamado jabón potásico. Cada aceite necesita unas 1,4 veces más potasa que sosa, porque el potasio pesa más, y la potasa comercial suele tener alrededor del 90 % de pureza.',
  },
  {
    question: '¿Cómo se calcula el agua de la lejía?',
    answer:
      'Hay dos maneras equivalentes. Por concentración: una lejía al 33 % lleva 33 partes de álcali por 67 de agua. Por proporción: 2 partes de agua por 1 de álcali da una concentración del 33,3 %. Menos agua acorta el curado pero acelera la traza; más agua hace la mezcla más manejable pero el jabón tarda más en secar.',
  },
  {
    question: '¿Qué significan la dureza, la limpieza y la cremosidad?',
    answer:
      'Son estimaciones del método de SoapCalc a partir de los ácidos grasos de cada aceite. La dureza suma los ácidos saturados; la limpieza, el láurico y el mirístico, que abundan en el coco y pueden resecar; el acondicionamiento, los insaturados como el oleico del aceite de oliva. Son orientativas: sirven para comparar recetas, no para predecir el jabón con exactitud.',
  },
  {
    question: '¿Puedo cambiar un aceite por otro sin recalcular?',
    answer:
      `No. Cada aceite necesita una cantidad distinta de álcali: el coco necesita ${formatNumber(SAP_COCO, 3)} g de sosa por gramo y el oliva ${formatNumber(SAP_OLIVA, 3)}, así que sustituir uno por otro sin recalcular puede dejar sosa libre en el jabón. Cada vez que cambies un aceite o su peso, vuelve a calcular.`,
  },
  {
    question: '¿Por qué los índices de saponificación no coinciden exactamente con otras tablas?',
    answer:
      'Porque el índice real de un aceite varía con su origen, la cosecha y el refinado, y cada tabla publica un promedio distinto. Esta calculadora usa los valores de SoapCalc, la referencia más extendida entre quienes hacen jabón. El sobreengrase está precisamente para absorber esas diferencias.',
  },
  {
    question: '¿Cuánto tiempo hay que curar el jabón casero?',
    answer:
      'El jabón en pastilla hecho en frío se suele curar entre 4 y 6 semanas en un lugar seco y ventilado, para que pierda agua y termine de saponificarse. El jabón de Castilla, con mucho aceite de oliva, mejora con curados más largos. La calculadora no estima el tiempo de curado: depende del agua, la temperatura y la humedad.',
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

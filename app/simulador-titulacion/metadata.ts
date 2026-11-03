import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Titulación Ácido-Base | meskeIA',
  description: 'Titula gota a gota ácidos fuertes/débiles con bases fuertes/débiles. Curva de pH en tiempo real, punto de equivalencia, pKa, indicadores y zona tampón. Química de secundaria.',
  keywords: 'titulación ácido base, valoración ácido base, curva de pH, punto de equivalencia, indicador fenolftaleína, pKa, Henderson-Hasselbalch, química secundaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-titulacion/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Titulación Ácido-Base | meskeIA',
    description: 'Titula gota a gota con curva de pH en tiempo real',
    url: 'https://meskeia.com/simulador-titulacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Titulación Ácido-Base | meskeIA',
    description: 'Aprende valoraciones con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Simulador de Titulación Ácido-Base',
  description: 'Simulador interactivo de valoración ácido-base. Configura ácido y base fuertes o débiles, titula gota a gota, observa la curva de pH en tiempo real, el punto de equivalencia y el viraje del indicador.',
  url: 'https://meskeia.com/simulador-titulacion/',
  category: 'EducationalApplication',
  features: [
    '4 tipos de titulación: AF+BF, AD+BF, AF+BD, AD+BD',
    'Bureta animada con goteo controlado',
    'Curva de pH en tiempo real',
    '4 indicadores con su rango de viraje',
    'Cálculo automático del punto de equivalencia',
    'En español',
  ],
  keywords: ['titulación', 'valoración', 'pH', 'química secundaria'],
});

export const jsonLd = webAppSchema;

/** Pregunta de la FAQ; `consejo` se pinta aparte en la FAQ visible y va detrás de la respuesta en el JSON-LD. */
export interface PreguntaFrecuente {
  question: string;
  answer: string;
  consejo?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// UNA sola FAQ (cabo C0593, la forma del hallazgo 3948 de calculadora-movimiento): la página
// emitía DOS FAQPage, uno dentro del @graph de jsonLd (una copia de la FAQ visible con frases
// de más) y otro, faqJsonLd, con cinco preguntas redactadas otra vez, tres de ellas que la
// página no muestra. Ahora la FAQ visible y el único FAQPage salen de esta lista: lo que dice
// el FAQPage es lo que dice la página.
// ─────────────────────────────────────────────────────────────────────────
export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    question: '¿Cuál es la diferencia entre punto de equivalencia y punto final?',
    answer: 'El punto de equivalencia es el punto teórico donde los moles de ácido y base son iguales. El punto final es el punto experimental donde el indicador cambia de color.',
    consejo: 'Tip: elige un indicador cuyo rango de viraje coincida con el pH del punto de equivalencia para minimizar el error.',
  },
  {
    question: '¿Por qué el punto de equivalencia no es pH=7 en ácido débil + base fuerte?',
    answer: 'Porque la sal formada (ej. acetato de sodio) sufre hidrólisis: el ion acetato es básico y eleva el pH por encima de 7.',
  },
  {
    question: '¿Qué es la zona tampón en una titulación?',
    answer: 'Es la región plana antes de la equivalencia (en titulaciones de ácido débil) donde coexisten ácido y su base conjugada. El pH cambia poco al añadir titulante; en el punto medio, pH = pKa.',
  },
  {
    question: '¿Cómo elijo el indicador correcto?',
    answer: 'El rango de viraje del indicador debe quedar dentro del salto vertical de la curva. Si la curva tiene salto entre pH 4 y 10 (AF+BF), casi cualquier indicador funciona; si el salto es estrecho (AD+BD), la elección es crítica. El simulador marca un indicador como «apto aquí» cuando todo su viraje ocurre entre el 98 % y el 102 % del volumen de equivalencia.',
  },
  {
    question: '¿Por qué la curva tiene un salto brusco?',
    answer: 'Cerca de la equivalencia hay muy poco ácido o base sin reaccionar, por lo que añadir una gota más cambia drásticamente el pH. El salto es mayor cuando ambos reactivos son fuertes y concentrados.',
  },
  {
    question: '¿Por qué se sigue añadiendo titulante después de la equivalencia?',
    answer: 'Para confirmar que hemos pasado el punto final y observar el plateau característico. En la práctica, basta con detectar el cambio de color y registrar el volumen.',
  },
];

export const faqJsonLd = generateFAQSchema({
  url: 'https://meskeia.com/simulador-titulacion/',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    question: f.question,
    answer: f.consejo ? `${f.answer} ${f.consejo}` : f.answer,
  })),
});

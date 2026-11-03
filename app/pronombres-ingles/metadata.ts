import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { EJERCICIOS } from './motor';

/** Ejercicios del banco: la cifra sale del banco, no se escribe a mano. */
const N = EJERCICIOS.length;

export const metadata: Metadata = {
  title: 'Pronombres en Inglés: Personales, Posesivos y Reflexivos con Ejercicios | meskeIA',
  description: `Tabla de pronombres en inglés (I, me, my, mine, myself) con traducción y ejemplos, y ${N} ejercicios numerados corregidos con su regla: its o it's, his o her.`,
  keywords: 'pronombres en inglés, pronombres personales en inglés, pronombres posesivos en inglés, pronombres de objeto en inglés, pronombres reflexivos en inglés, adjetivos posesivos en inglés, tabla de pronombres en inglés, ejercicios de pronombres en inglés, its o it\'s, their there they\'re',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Pronombres en Inglés: tabla y ejercicios numerados',
    description: `Personales, posesivos y reflexivos en una tabla interactiva, y ${N} ejercicios con la regla de cada respuesta.`,
    url: 'https://meskeia.com/pronombres-ingles/',
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
    title: 'Pronombres en Inglés: tabla y ejercicios',
    description: `I, me, my, mine, myself: tabla interactiva y ${N} ejercicios numerados corregidos con su regla.`,
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Pronombres en Inglés meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Pronombres en Inglés: tabla y ejercicios',
  description: `Tabla interactiva de los pronombres en inglés —personales de sujeto y de objeto, adjetivos y pronombres posesivos y reflexivos— con traducción y ejemplo de cada forma, y ${N} ejercicios numerados de completar huecos que se corrigen explicando la regla aplicada a cada caso.`,
  url: 'https://meskeia.com/pronombres-ingles/',
  category: 'EducationalApplication',
  features: [
    'Tabla de los cinco tipos de pronombres para las siete personas, con traducción y ejemplo',
    'Resaltado de una persona o de un tipo de pronombre para estudiarlo aparte',
    `${N} ejercicios numerados de completar huecos, por tipo de pronombre`,
    'Trampas típicas de hispanohablantes: its o it\'s, their, there o they\'re, his o her',
    'Modo elegir entre cuatro opciones o modo escribir la respuesta',
    'Selección de ejercicios por número (3, 7, 11 o 5-9) para asignarlos en clase',
    'Corrección con la regla aplicada a cada frase',
  ],
});

/**
 * FAQ — fuente única de la FAQ visible de page.tsx y del FAQPage JSON-LD de abajo.
 * Texto plano: el JSON-LD no admite marcado.
 */
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuáles son los pronombres en inglés?',
    answer: 'Hay cinco tipos, y cada uno tiene una forma para cada persona (I, you, he, she, it, we, they): los personales de sujeto (I, you, he, she, it, we, they), los de objeto (me, you, him, her, it, us, them), los adjetivos posesivos (my, your, his, her, its, our, their), los pronombres posesivos (mine, yours, his, hers, ours, theirs) y los reflexivos (myself, yourself o yourselves, himself, herself, itself, ourselves, themselves).',
  },
  {
    question: '¿Qué diferencia hay entre my y mine en inglés?',
    answer: 'My es un adjetivo posesivo y va siempre delante de un sustantivo: my book. Mine es un pronombre posesivo y lo sustituye, así que va sin sustantivo detrás: the book is mine. Pasa lo mismo con your y yours, her y hers, our y ours, their y theirs. His es igual en los dos usos.',
  },
  {
    question: '¿Cuándo se escribe its y cuándo it\'s?',
    answer: 'Its, sin apóstrofo, es el posesivo de una cosa o un animal: the tree is losing its leaves. It\'s es la contracción de it is o it has: it\'s raining. Un truco: si puedes cambiarlo por it is sin que la frase pierda sentido, se escribe it\'s.',
  },
  {
    question: '¿Por qué se dice his mother si la madre es una mujer?',
    answer: 'Porque en inglés el posesivo de tercera persona concuerda con quien posee, no con lo poseído. La madre de Tomás es his mother y el hermano de María es her brother. En español «su» no distingue, y por eso es uno de los errores más frecuentes de los hispanohablantes.',
  },
  {
    question: '¿Hay que poner siempre el sujeto en inglés?',
    answer: 'Sí. Al contrario que en español, el inglés no omite el sujeto: se dice I am tired y no «am tired». Con el tiempo, la hora o la distancia, donde en español no hay sujeto, se usa un it vacío: it is raining, it is seven o\'clock.',
  },
  {
    question: '¿Cuándo se usa yourself y cuándo yourselves?',
    answer: 'You sirve para una persona y para varias, pero el reflexivo distingue: yourself cuando se habla a una sola persona (did you make it yourself, Paula?) y yourselves cuando son varias (children, help yourselves). Es el único pronombre de la tabla que cambia así.',
  },
  {
    question: '¿Cómo puede un profesor asignar ejercicios concretos?',
    answer: `Los ${N} ejercicios tienen un número fijo que se ve en pantalla. En el campo «Ejercicios por número» se escribe una lista como 3, 7, 11 o un rango como 5-9, y se juegan exactamente esos y en ese orden. Al terminar, el resultado dice por número qué ejercicios se fallaron.`,
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

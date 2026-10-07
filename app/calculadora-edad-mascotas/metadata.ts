import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import {
  EDAD_HUMANA_ANIO_1,
  EDAD_HUMANA_ANIO_2,
  FACTOR_GATO,
  FACTOR_POR_ANIO,
  UMBRALES_GATO,
  UMBRALES_PERRO,
  calcularEdadHumana,
} from './motor';

const DESCRIPCION =
  'Calcula la edad de tu perro o gato en años humanos según su tamaño, con la regla convencional orientativa: 15 años el primero, 9 más el segundo y de 4 a 7 por año después. Gratis.';

export const metadata: Metadata = {
  title: 'Calculadora de Edad de Mascotas - Perros y Gatos en Años Humanos | meskeIA',
  description: DESCRIPCION,
  keywords: 'calculadora edad perro, edad gato años humanos, años perro, conversión edad mascota, cuántos años tiene mi perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Edad de Mascotas - meskeIA',
    description: 'Calcula la edad de tu perro o gato en años humanos',
    url: 'https://meskeia.com/calculadora-edad-mascotas/',
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
    title: 'Calculadora de Edad de Mascotas - meskeIA',
    description: 'Calcula la edad de tu perro o gato en años humanos',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Edad Mascotas",
  description: DESCRIPCION,
  url: "https://meskeia.com/calculadora-edad-mascotas/",
  category: 'UtilityApplication',
  features: [
    'Edad humana equivalente de perros según su tamaño (pequeño, mediano, grande y gigante)',
    'Edad humana equivalente de gatos',
    'Admite edades con decimales, también de cachorros de pocos meses',
    'Etapa vital orientativa según el tamaño del perro',
  ],
});

// ─── FAQ — FUENTE ÚNICA de las dos bocas ─────────────────────────────────
// La FAQ visible de page.tsx pinta este array y el FAQPage de abajo se deriva de él: antes la
// misma pregunta tenía dos respuestas distintas (hallazgos 3011 y 3012, 07/10/2026). Las cifras
// salen del motor, para que no vuelvan a citar un modelo que la app no usa.

const perro = (tamano: keyof typeof FACTOR_POR_ANIO, edad: number): number =>
  calcularEdadHumana('perro', tamano, edad);

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuántos años humanos equivalen a 1 año de perro?',
    answer: `Con la regla convencional que usa esta calculadora, un perro de 1 año equivale a ${EDAD_HUMANA_ANIO_1} años humanos y uno de 2 años a ${EDAD_HUMANA_ANIO_2}, sea del tamaño que sea. A partir del tercer año, cada año canino suma entre ${FACTOR_POR_ANIO.pequeno} y ${FACTOR_POR_ANIO.gigante} años humanos según el tamaño: los perros grandes envejecen más rápido que los pequeños. Hay otros modelos: un estudio de 2020 (Wang et al., Cell Systems) propuso uno basado en cambios epigenéticos, calibrado en labradores, que da cifras más altas en los primeros años; esta calculadora no lo usa.`,
  },
  {
    question: '¿Es correcta la regla de multiplicar por 7 la edad del perro?',
    answer: `Es una simplificación. El envejecimiento no es lineal: el primer año de vida equivale a ${EDAD_HUMANA_ANIO_1} años humanos por el rapidísimo desarrollo, y a partir del tercero el ritmo depende del tamaño. Con esta regla, un perro gigante suma ${FACTOR_POR_ANIO.gigante} años humanos por año y uno pequeño ${FACTOR_POR_ANIO.pequeno}: envejece unas ${(FACTOR_POR_ANIO.gigante / FACTOR_POR_ANIO.pequeno).toLocaleString('es-ES')} veces más deprisa a partir del segundo año.`,
  },
  {
    question: '¿A qué edad humana equivale un perro de 2 años?',
    answer: `Independientemente del tamaño, un perro de 2 años equivale aproximadamente a ${EDAD_HUMANA_ANIO_2} años humanos: el segundo año suma ${EDAD_HUMANA_ANIO_2 - EDAD_HUMANA_ANIO_1} a los ${EDAD_HUMANA_ANIO_1} del primero. A partir del tercer año, los factores de tamaño empiezan a divergir.`,
  },
  {
    question: '¿A qué edad se considera viejo un perro?',
    answer: `Depende del tamaño, y no hay un umbral oficial único: es orientativo y lo ajusta el veterinario. En esta calculadora un perro entra en la etapa senior a los ${UMBRALES_PERRO.gigante.senior} años si es gigante, a los ${UMBRALES_PERRO.grande.senior} si es grande, a los ${UMBRALES_PERRO.mediano.senior} si es mediano y a los ${UMBRALES_PERRO.pequeno.senior} si es pequeño. En esa etapa suele necesitar revisiones veterinarias más frecuentes, ajustar la dieta y bajar la intensidad del ejercicio.`,
  },
  {
    question: '¿Cómo varía la esperanza de vida según el tamaño del perro?',
    answer: 'De forma marcada: por lo general, los perros pequeños viven más años que los grandes y los gigantes, aunque la cifra concreta varía mucho según la raza, la genética y los cuidados. La causa no está del todo aclarada; una de las hipótesis es que los perros grandes crecen y envejecen más deprisa.',
  },
  {
    question: '¿Cuándo cambiar al pienso de "senior"?',
    answer: `Suele valorarse al entrar en la etapa madura, que llega antes cuanto más grande es el perro (en esta calculadora, a los ${UMBRALES_PERRO.gigante.maduro} años en los gigantes, a los ${UMBRALES_PERRO.grande.maduro} en los grandes, a los ${UMBRALES_PERRO.mediano.maduro} en los medianos y a los ${UMBRALES_PERRO.pequeno.maduro} en los pequeños). Consulta siempre con tu veterinario antes de cambiar la dieta.`,
  },
  {
    question: '¿Los gatos envejecen igual que los perros?',
    answer: `No exactamente. Los dos primeros años siguen la misma curva (1 año = ${EDAD_HUMANA_ANIO_1} años humanos; 2 años = ${EDAD_HUMANA_ANIO_2}), pero a partir de ahí cada año de gato suma ${FACTOR_GATO} años humanos, sin depender del peso. Así, un gato de 12 años equivale a ${calcularEdadHumana('gato', 'mediano', 12)} años humanos. En esta calculadora un gato es senior a partir de los ${UMBRALES_GATO.senior} años y geriátrico a partir de los ${UMBRALES_GATO.geriatrico}.`,
  },
  {
    question: '¿Qué cambios físicos esperar en un perro de 10 años?',
    answer: `A los 10 años, un perro mediano equivale a ${perro('mediano', 10)} años humanos. Es habitual observar menor tolerancia al ejercicio intenso, encanecimiento del hocico, cierta rigidez al levantarse, visión y audición algo reducidas y más horas de sueño. Los controles veterinarios periódicos ayudan a detectar a tiempo patologías como la artritis, la insuficiencia renal o los tumores.`,
  },
  {
    question: '¿Cómo calcular la edad si el perro fue rescatado sin historial?',
    answer: 'El veterinario puede estimar la edad por varios indicadores: estado dental (desgaste y sarro), opacidad del cristalino, canas en el hocico, desarrollo muscular y radiografías. Con esa estimación, introduce la edad media del rango en la calculadora para obtener la equivalencia humana orientativa.',
  },
  {
    question: '¿Para qué sirve saber la edad equivalente en humanos de mi mascota?',
    answer: 'Ayuda a entender las necesidades de tu mascota en cada etapa de su vida: alimentación, nivel de actividad, frecuencia de visitas veterinarias y señales de envejecimiento a las que prestar atención. También facilita hablar con el veterinario de las enfermedades asociadas a la edad.',
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

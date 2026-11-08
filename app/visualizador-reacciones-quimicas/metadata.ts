import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

// ⚠️ 2026-11-08 (hallazgo 4241): el title, la description y el featureList prometían «átomos
//    animados» y los átomos de la ficha son un dibujo estático (solo late la flecha). Se baja la
//    promesa a lo que la app hace: el diagrama de átomos antes y después.
export const metadata: Metadata = {
  title: 'Tipos de Reacciones Químicas: Ejemplos con Átomos | meskeIA',
  description: 'Los tipos de reacciones químicas explicados con diagramas de átomos: síntesis, descomposición, desplazamiento simple y doble, y combustión, con ejemplos reales de la cocina, el motor y las baterías.',
  keywords: 'reacciones químicas, balanceo ecuaciones, tipos reacción, síntesis, combustión, átomos, química visual, conservación masa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tipos de Reacciones Químicas con Ejemplos',
    description: 'Tipos de reacciones, balanceo de ecuaciones y química del día a día explicados visualmente.',
    url: 'https://meskeia.com/visualizador-reacciones-quimicas/',
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
    title: 'Tipos de Reacciones Químicas',
    description: 'Los átomos no se crean ni destruyen, solo cambian de pareja. Química visual e interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Reacciones Químicas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tipos de Reacciones Químicas con Ejemplos',
  description: 'Explicador visual interactivo sobre reacciones químicas: tipos (síntesis, descomposición, combustión), balanceo de ecuaciones con conteo atómico y reacciones cotidianas.',
  url: 'https://meskeia.com/visualizador-reacciones-quimicas/',
  category: 'EducationalApplication',
  features: [
    '5 tipos de reacciones con su diagrama de átomos antes y después',
    'Balanceo interactivo de ecuaciones químicas',
    'Conteo atómico visual en tiempo real',
    'Reacciones cotidianas: cocina, motor, batería',
  ],
});

// FAQ — FUENTE ÚNICA de la FAQ visible de page.tsx y del FAQPage (§1.ter). Antes solo existía en
// el JSON-LD y 4 de sus 5 preguntas no salían en la página (hallazgo 4248).
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué es una reacción química?',
    answer: 'Una reacción química es un proceso en el que unas sustancias (reactivos) se transforman en otras sustancias distintas (productos) reorganizando sus átomos. Los átomos no se crean ni se destruyen, solo cambian cómo están enlazados, principio conocido como ley de conservación de la masa, enunciada por Lavoisier en 1789.',
  },
  {
    question: '¿Cuáles son los principales tipos de reacciones químicas?',
    answer: 'Los tipos más comunes son: síntesis (dos sustancias se combinan en una), descomposición (una sustancia se divide en varias), desplazamiento simple (un elemento reemplaza a otro en un compuesto), doble desplazamiento (intercambio de iones entre dos compuestos) y combustión (reacción con oxígeno que libera energía en forma de calor y luz).',
  },
  {
    question: '¿Cómo se balancea una ecuación química?',
    answer: 'Balancear una ecuación química consiste en ajustar los coeficientes (números delante de cada fórmula) para que el número de átomos de cada elemento sea igual en reactivos y productos. No se pueden cambiar los subíndices de las fórmulas químicas, solo los coeficientes. Por ejemplo, 2H₂ + O₂ → 2H₂O indica que 4 hidrógenos y 2 oxígenos producen 2 moléculas de agua.',
  },
  {
    question: '¿Qué reacciones químicas ocurren en la vida cotidiana?',
    answer: 'Las reacciones químicas están en todas partes: la combustión de gasolina en los motores de los coches, la cocción de los alimentos que desnaturaliza proteínas, la oxidación que forma el óxido en el hierro, la fermentación que produce el pan y el yogur, y la fotosíntesis de las plantas que convierte CO₂ y agua en glucosa usando energía solar.',
  },
  {
    question: '¿Qué diferencia hay entre una reacción química y un cambio físico?',
    answer: 'En un cambio físico (como fundir hielo o cortar papel) la sustancia conserva su composición química, solo cambia su forma o estado. En una reacción química se forman nuevas sustancias con propiedades diferentes a las originales. Señales de que ocurrió una reacción química incluyen cambio de color, desprendimiento de gas, formación de precipitado o liberación de calor o luz.',
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

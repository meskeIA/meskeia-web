import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Media Ponderada (Promedio Ponderado) - Notas por Créditos ECTS',
  description: 'Calculadora de notas: media ponderada o promedio ponderado por créditos ECTS, simulador EvAU, conversor de escalas Latam y «¿qué nota necesito para aprobar?». Gratis.',
  keywords: 'calculadora notas, media ponderada, promedio ponderado, calcular promedio, ECTS, EvAU, selectividad, examen de admisión universitaria, GPA, conversor notas, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-notas/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Media Ponderada y Promedio Ponderado - Créditos ECTS',
    description: 'Calcula tu media ponderada (promedio ponderado) del expediente con créditos ECTS. Simulador EvAU y conversor de escalas Latam. Gratis.',
    url: 'https://meskeia.com/calculadora-notas/',
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
    title: 'Calculadora de Media Ponderada Universidad',
    description: 'Notas por créditos ECTS, simulador EvAU y conversor de escalas Latam.',
    images: ['https://meskeia.com/og-image.png']
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Calculadora de Notas Académicas',
  description: 'Calculadora de notas académicas para estudiantes hispanohablantes. Calcula media ponderada por créditos, simulador EvAU (España), y conversiones entre escalas de calificación de México, Argentina, Chile, Colombia, Perú y Venezuela.',
  url: 'https://meskeia.com/calculadora-notas/',
  category: 'EducationalApplication',
  features: [
    'Calculadora de media ponderada con créditos ECTS',
    'Simulador de nota EvAU (selectividad España)',
    'Conversión entre 6+ escalas de calificación de Latam',
    'Calculadora de "qué nota necesitas para aprobar"',
    'Tabla de equivalencias entre sistemas educativos',
    'En español',
  ],
  keywords: ['calculadora notas', 'media ponderada', 'ECTS', 'EvAU', 'GPA', 'conversor notas', 'estudiantes'],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/calculadora-notas/',
  mainEntity: [
    {
      question: '¿Cómo se calcula la media ponderada?',
      answer: 'Se multiplica cada nota por su peso (créditos, horas o porcentaje), se suman todos los productos y se divide entre la suma total de los pesos. Por ejemplo: (7×6 + 5×3) / (6+3) = (42+15)/9 = 6,33. Es diferente a la media aritmética simple.',
    },
    {
      question: '¿Qué nota necesito en el examen final para aprobar la asignatura?',
      answer: 'Depende del sistema de evaluación del profesor. Si el examen final vale un 60% y tienes un 4 en la evaluación continua (40%), necesitas: (nota_final × 0,6 + 4 × 0,4) ≥ 5 → nota_final ≥ (5 - 1,6) / 0,6 = 5,67. La calculadora puede resolver este cálculo automáticamente.',
    },
    {
      question: '¿Qué es la Matrícula de Honor y cuándo se concede?',
      answer: 'Es la máxima calificación universitaria española, reservada a notas de 9,0 o superior. Tiene un límite cuantitativo: no puede concederse a más del 5% de los alumnos matriculados en la asignatura. Si el 5% da menos de 1 alumno, puede concederse a 1 como máximo.',
    },
    {
      question: '¿Cómo se convierte una nota española al sistema GPA americano?',
      answer: 'La conversión más usada: 9-10 → 4,0 (A), 7-8,9 → 3,0-3,9 (B), 5-6,9 → 2,0-2,9 (C), 3-4,9 → 1,0-1,9 (D), 0-2,9 → 0,0 (F). Sin embargo, no existe una fórmula oficial; cada institución americana puede aplicar su propia escala de conversión.',
    },
    {
      question: '¿Las asignaturas suspensas cuentan en la media del expediente universitario?',
      answer: 'Según el RD 1125/2003 (Espacio Europeo de Educación Superior), solo se incluyen las asignaturas superadas en el cálculo del expediente oficial. Sin embargo, algunas universidades calculan una "media bruta" que sí incluye los suspensos. Consulta el reglamento de tu universidad.',
    },
    {
      question: '¿Qué nota mínima exigen los másteres más competitivos en España?',
      answer: 'Los másteres de alta demanda (MBA de escuelas de negocios, másteres en IA, Derecho en universidades top) suelen pedir entre 7,0 y 8,0 de expediente. Los másteres habilitantes (Medicina, Arquitectura) pueden bajar a 6,5. Siempre consulta los requisitos específicos de cada programa.',
    },
    {
      question: '¿Cómo funciona la nota de acceso a la universidad (EVAU/Selectividad)?',
      answer: 'La nota de acceso = 0,6 × nota media de Bachillerato + 0,4 × nota de la EVAU. La nota de admisión puede subir hasta 14 puntos incluyendo las dos materias de fase específica (máximo +2 por materia con coeficiente ponderador). No todas las carreras usan las mismas materias de ponderación.',
    },
    {
      question: '¿Cuánto afecta una asignatura suspensa a la nota media final?',
      answer: 'En bachillerato, una asignatura suspensa (por ejemplo un 4) en una materia de 4 horas semanales, frente a una media de 7 en el resto, puede bajar la media total entre 0,3 y 0,6 puntos dependiendo del número de asignaturas. La ponderación y el número total de materias determinan el impacto real.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la media ponderada de notas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se multiplica cada nota por su peso (créditos ECTS, horas o porcentaje), se suman todos los productos y se divide entre la suma total de los pesos. Ejemplo: (7×6 + 5×3) / (6+3) = 57/9 = 6,33. Es diferente de la media aritmética simple, que solo suma y divide sin ponderar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué nota necesito en el examen final para aprobar la asignatura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del peso del examen final en la nota global. Si el examen vale un 60% y tienes un 4 en la evaluación continua (40%), necesitas: nota_final ≥ (5 − 1,6) / 0,6 = 5,67. La calculadora puede resolver este cálculo automáticamente según los porcentajes de tu asignatura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la nota de acceso a la universidad (EVAU / Selectividad)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La nota de acceso = 0,6 × media de Bachillerato + 0,4 × nota EVAU. Para la nota de admisión se pueden sumar hasta 4 puntos extra de la fase específica (dos materias × ponderador, máximo 2 puntos por materia). El máximo posible es 14 puntos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se convierte una nota española al sistema GPA americano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La conversión más usada: 9-10 → 4,0 (A), 7-8,9 → 3,0-3,9 (B), 5-6,9 → 2,0-2,9 (C), 3-4,9 → 1,0-1,9 (D), 0-2,9 → 0,0 (F). No existe una fórmula oficial; cada institución americana puede aplicar su propia escala de conversión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las asignaturas suspensas cuentan en la media del expediente universitario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según el RD 1125/2003 del Espacio Europeo de Educación Superior, solo se incluyen las asignaturas superadas en el cálculo del expediente oficial. Sin embargo, algunas universidades calculan una «media bruta» que sí incluye los suspensos. Consulta el reglamento de tu universidad.',
      },
    },
  ],
};

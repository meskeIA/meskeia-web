import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Normalización de Bases de Datos - 1FN, 2FN, 3FN y BCNF | meskeIA',
  description:
    'Analiza una relación a partir de sus dependencias funcionales: claves candidatas, atributos primos y en qué forma normal está (1FN, 2FN, 3FN o BCNF), con el motivo de cada violación y el cierre de atributos paso a paso.',
  keywords:
    'normalización de bases de datos, 1FN 2FN 3FN, forma normal de Boyce-Codd, BCNF, dependencias funcionales, claves candidatas, cierre de atributos, superclave, atributos primos, modelo relacional, anomalías de actualización, desnormalización',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Normalización de Bases de Datos: 1FN, 2FN, 3FN y BCNF | meskeIA',
    description:
      'Escribe los atributos y las dependencias funcionales de una tabla y averigua sus claves candidatas y hasta qué forma normal llega, con el porqué de cada fallo.',
    url: 'https://meskeia.com/normalizacion-bases-datos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Normalización de Bases de Datos | meskeIA',
    description:
      'Claves candidatas, formas normales (1FN, 2FN, 3FN, BCNF) y cierre de atributos calculados paso a paso.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Normalización de Bases de Datos (1FN, 2FN, 3FN, BCNF)',
  description:
    'Herramienta que analiza una relación a partir de sus dependencias funcionales: calcula claves candidatas, distingue atributos primos de no primos, determina la forma normal alcanzada y explica cada violación de 2FN, 3FN y BCNF.',
  url: 'https://meskeia.com/normalizacion-bases-datos/',
  category: 'EducationalApplication',
  features: [
    'Cálculo de todas las claves candidatas a partir de las dependencias funcionales',
    'Diagnóstico de la forma normal alcanzada: 1FN, 2FN, 3FN o BCNF',
    'Cada violación con la dependencia culpable y el motivo concreto',
    'Distinción entre atributos primos y no primos',
    'Calculadora de cierre de atributos con los pasos detallados y comprobación de superclave',
    'Ejemplos precargados de dependencia parcial, transitiva y del caso 3FN-no-BCNF',
    'Aviso explícito de las líneas de entrada que no se han podido interpretar',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la normalización de bases de datos y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La normalización es el proceso de organizar las columnas de una base de datos relacional para que cada dato viva en un solo sitio. Se aplica en pasos llamados formas normales (1FN, 2FN, 3FN, BCNF), y cada paso elimina un tipo de anomalía: de inserción (no poder registrar un hecho sin inventarse otro), de borrado (perder información al eliminar una fila) y de actualización (corregir un dato repetido a medias y dejar la base contradiciéndose).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la 3FN y la forma normal de Boyce-Codd?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La 3FN permite una excepción: una dependencia cuya parte izquierda no es superclave se tolera si su parte derecha es un atributo primo, es decir, si forma parte de alguna clave candidata. La BCNF elimina esa excepción y exige que toda dependencia no trivial arranque de una superclave. El caso típico que las separa es R(Estudiante, Asignatura, Profesor) con Estudiante,Asignatura → Profesor y Profesor → Asignatura: cumple 3FN porque los tres atributos son primos, pero rompe BCNF porque Profesor no es superclave.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calculan las claves candidatas de una relación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una clave candidata es un conjunto mínimo de atributos cuyo cierre da todos los atributos de la relación. El método consiste en observar que los atributos que no aparecen en ninguna parte derecha tienen que estar en todas las claves, mientras que los que no aparecen en ninguna parte izquierda no pueden aportar nada, y probar después los subconjuntos restantes por tamaño creciente. Una relación puede tener varias claves candidatas, y ahí es donde el análisis a ojo suele fallar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el cierre de un conjunto de atributos y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cierre de X, escrito X⁺, es todo lo que se deduce de X aplicando las dependencias funcionales una y otra vez hasta que el conjunto deja de crecer. Con R(A,B,C,D,E) y las dependencias A→B, B→C y C,D→E, el cierre de {A} es {A,B,C}: no llega a E porque falta D. El cierre sirve para dos cosas: comprobar si una dependencia se deduce de las demás y saber si un conjunto es superclave, lo que ocurre cuando su cierre contiene todos los atributos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hasta qué forma normal conviene normalizar en un proyecto real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El criterio habitual es llegar a 3FN o BCNF en el diseño transaccional, porque a partir de ahí la mejora en integridad es pequeña frente a la complejidad añadida. Después se desnormaliza de forma deliberada solo donde una medición demuestre que las uniones entre tablas cuestan demasiado: esquemas en estrella para informes, totales precalculados o valores históricos como el precio de venta de una factura. Desnormalizar antes de medir es duplicar datos a ciegas, y se pagan las anomalías sin cobrar el rendimiento.',
      },
    },
  ],
};

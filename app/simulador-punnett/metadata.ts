import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuadro de Punnett Online: Genética Mendeliana | meskeIA',
  description:
    'Cuadro (tabla) de Punnett online para cruces monohíbrido, dihíbrido y trihíbrido (3 genes). Calcula proporciones fenotípicas (3:1, 9:3:3:1) y genotípicas, y pasa de genotipo a fenotipo aplicando las leyes de Mendel.',
  keywords:
    'cuadro de Punnett, tabla de Punnett, cuadro de Punnett online, genética mendeliana, Mendel, genotipo, fenotipo, proporciones fenotípicas, cruce monohíbrido, cruce dihíbrido, trihíbrido, 3 genes, herencia, alelos, dominante, recesivo, leyes de Mendel, secundaria, preparatoria, educación media, biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-punnett/',
  },
  openGraph: {
    type: 'website',
    title: 'Cuadro de Punnett Online: Genética Mendeliana | meskeIA',
    description:
      'Tabla de Punnett online para cruces monohíbrido, dihíbrido y trihíbrido. Proporciones fenotípicas (3:1, 9:3:3:1) y genotípicas al instante.',
    url: 'https://meskeia.com/simulador-punnett/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuadro de Punnett | meskeIA',
    description: 'Aprende genética mendeliana con simulaciones interactivas de cruces',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuadro de Punnett Online — Genética Mendeliana',
  description:
    'Cuadro (tabla) de Punnett online para cruces monohíbrido, dihíbrido y trihíbrido (3 genes). Calcula proporciones fenotípicas (3:1, 9:3:3:1) y genotípicas, pasa de genotipo a fenotipo, visualiza los gametos y explora escenarios de las leyes de Mendel.',
  url: 'https://meskeia.com/simulador-punnett/',
  category: 'EducationalApplication',
  features: [
    'Cruce monohíbrido (4 celdas) y dihíbrido (16 celdas)',
    'Tabla de Punnett renderizada con colores por fenotipo',
    'Proporciones fenotípicas (3:1, 9:3:3:1) y genotípicas automáticas',
    'Conversión de genotipo a fenotipo con alelos dominante/recesivo',
    'Escenarios predefinidos: Mendel clásico, portador, puro × recesivo',
    'Botón de caso aleatorio para explorar combinaciones',
    'Interpretación en texto natural de los resultados',
    'En español',
  ],
  keywords: [
    'cuadro de Punnett',
    'tabla de Punnett',
    'cuadro de Punnett online',
    'genética mendeliana',
    'genotipo y fenotipo',
    'proporciones fenotípicas',
    'cruce monohíbrido',
    'cruce dihíbrido',
    'trihíbrido 3 genes',
    'leyes de Mendel',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el cuadro de Punnett y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cuadro de Punnett es una tabla cuadrada que permite predecir las proporciones de genotipos y fenotipos esperados en la descendencia de un cruce genético. Se coloca en las filas y columnas los gametos posibles de cada progenitor y en las celdas interiores se anotan las combinaciones. Es la herramienta estándar para aplicar las leyes de Mendel en genética de educación media —Bachillerato (España), preparatoria y secundaria (Latinoamérica)— y universidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre genotipo y fenotipo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El genotipo es la combinación de alelos que posee un organismo para un gen dado (por ejemplo, Aa o AA). El fenotipo es la característica observable resultante de ese genotipo en interacción con el ambiente (por ejemplo, color de ojos marrón). En herencia mendeliana simple, el alelo dominante determina el fenotipo tanto en homocigosis (AA) como en heterocigosis (Aa), mientras que el fenotipo recesivo solo aparece en homocigosis (aa).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un cruce monohíbrido y un dihíbrido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cruce monohíbrido estudia la herencia de un solo carácter con dos alelos, generando un cuadro de Punnett de 2×2 (4 celdas) y la proporción fenotípica clásica 3:1 en la F2. Un cruce dihíbrido analiza dos caracteres independientes simultáneamente, produciendo un cuadro de 4×4 (16 celdas) y la proporción fenotípica 9:3:3:1 en la F2, que ilustra la ley de segregación independiente de Mendel.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un individuo portador en genética mendeliana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un portador es un individuo heterocigoto (Aa) que presenta el fenotipo dominante pero lleva un alelo recesivo que puede transmitir a su descendencia. Si dos portadores se cruzan, hay un 25% de probabilidad de que un hijo presente el fenotipo recesivo (aa). Este concepto es clave para entender enfermedades hereditarias autosómicas recesivas como la fibrosis quística o la fenilcetonuria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calculan las proporciones genotípicas y fenotípicas en un cruce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se construye el cuadro de Punnett combinando los gametos de cada progenitor y se cuentan las frecuencias de cada genotipo resultante. Las proporciones genotípicas indican cuántos individuos tienen cada combinación de alelos (AA, Aa, aa). Las proporciones fenotípicas agrupan los genotipos que producen el mismo aspecto observable: en herencia dominante completa, AA y Aa tienen el mismo fenotipo, mientras que aa tiene el fenotipo recesivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se hace un cuadro de Punnett paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Primero determina el genotipo de cada progenitor (por ejemplo Aa × Aa) y escribe sus gametos posibles. En un monohíbrido, coloca los gametos de un progenitor en las filas (A, a) y los del otro en las columnas (A, a). Rellena cada celda combinando el gameto de su fila con el de su columna, ordenando la mayúscula primero (AA, Aa, aa). Por último cuenta los genotipos y agrúpalos por fenotipo para obtener las proporciones. Esta calculadora dibuja la tabla de Punnett online y hace el recuento automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué proporciones da un cruce monohíbrido (3:1) y uno dihíbrido (9:3:3:1)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cruce monohíbrido Aa × Aa da en la F2 una proporción fenotípica de 3:1 (3 dominantes por cada recesivo) y una proporción genotípica 1:2:1 (1 AA : 2 Aa : 1 aa). Un cruce dihíbrido AaBb × AaBb da la proporción fenotípica clásica 9:3:3:1 en sus 16 celdas: 9 doble dominante, 3 dominante-recesivo, 3 recesivo-dominante y 1 doble recesivo. Estas razones son la base de las leyes de Mendel.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede hacer un cuadro de Punnett de 3 genes (trihíbrido)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Un cruce trihíbrido AaBbCc × AaBbCc implica 3 genes: cada progenitor produce 2³ = 8 tipos de gametos, por lo que el cuadro de Punnett completo tiene 8 × 8 = 64 celdas. La proporción fenotípica resultante en la F2 es 27:9:9:9:3:3:3:1. Por su tamaño, en la práctica el trihíbrido suele resolverse por el método de la probabilidad (multiplicando las proporciones 3:1 de cada gen) en lugar de dibujar las 64 celdas a mano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se pasa de genotipo a fenotipo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El fenotipo se deduce del genotipo aplicando la relación de dominancia entre alelos. En dominancia completa, basta con que el genotipo tenga un alelo dominante para expresar el fenotipo dominante: AA y Aa muestran el mismo carácter, y solo el homocigoto recesivo aa muestra el fenotipo recesivo. Por eso la proporción genotípica 1:2:1 se convierte en una proporción fenotípica 3:1. En dominancia incompleta o codominancia, en cambio, el heterocigoto Aa presenta su propio fenotipo intermedio o mixto.',
      },
    },
  ],
};

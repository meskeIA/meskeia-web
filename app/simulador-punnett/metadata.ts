import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuadro de Punnett: Genética Mendeliana | meskeIA',
  description:
    'Simula cruces genéticos monohíbridos y dihíbridos con el cuadro de Punnett. Calcula proporciones genotípicas y fenotípicas. Herramienta interactiva para aprender las leyes de Mendel.',
  keywords:
    'cuadro de Punnett, genética, Mendel, genotipo, fenotipo, herencia, alelos, dominante, recesivo, monohíbrido, dihíbrido, EBAU, Bachillerato, biología, leyes de Mendel',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-punnett/',
  },
  openGraph: {
    type: 'website',
    title: 'Cuadro de Punnett: Genética Mendeliana | meskeIA',
    description:
      'Simula cruces genéticos monohíbridos y dihíbridos. Proporciones genotípicas y fenotípicas instantáneas.',
    url: 'https://meskeia.com/simulador-punnett/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuadro de Punnett | meskeIA',
    description: 'Aprende genética mendeliana con simulaciones interactivas de cruces',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Cuadro de Punnett — Genética Mendeliana',
  description:
    'Simulador interactivo del cuadro de Punnett para cruces monohíbridos y dihíbridos. Calcula proporciones genotípicas y fenotípicas, visualiza gametos y explora escenarios predefinidos de las leyes de Mendel.',
  url: 'https://meskeia.com/simulador-punnett/',
  category: 'EducationalApplication',
  features: [
    'Cruce monohíbrido (4 celdas) y dihíbrido (16 celdas)',
    'Cuadro de Punnett renderizado con colores por fenotipo',
    'Proporciones genotípicas y fenotípicas automáticas',
    'Escenarios predefinidos: Mendel clásico, portador, puro × recesivo',
    'Botón de caso aleatorio para explorar combinaciones',
    'Interpretación en texto natural de los resultados',
    'En español',
  ],
  keywords: [
    'cuadro de Punnett',
    'genética mendeliana',
    'genotipo fenotipo',
    'leyes de Mendel',
    'herencia biológica',
    'Bachillerato biología',
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
        text: 'El cuadro de Punnett es una tabla cuadrada que permite predecir las proporciones de genotipos y fenotipos esperados en la descendencia de un cruce genético. Se coloca en las filas y columnas los gametos posibles de cada progenitor y en las celdas interiores se anotan las combinaciones. Es la herramienta estándar para aplicar las leyes de Mendel en genética de Bachillerato y universidad.',
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
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Daltonismo - Visualiza cómo perciben tus diseños | meskeIA',
  description: 'Sube una imagen o paleta de colores y visualiza al instante cómo la perciben personas con protanopia, deuteranopia, tritanopia y otras formas de daltonismo. 100% local.',
  keywords: 'daltonismo, simulador daltonismo, protanopia, deuteranopia, tritanopia, acromatopsia, accesibilidad visual, diseño accesible, WCAG, color blindness',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-daltonismo/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Daltonismo | meskeIA',
    description: 'Visualiza cómo perciben tus diseños las personas con daltonismo. 8 tipos simulados con matrices oficiales.',
    url: 'https://meskeia.com/simulador-daltonismo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Daltonismo | meskeIA',
    description: 'Verifica la accesibilidad cromática de tus diseños en segundos.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Daltonismo',
  description: 'Herramienta gratuita para diseñadores y desarrolladores: sube una imagen y visualiza cómo se percibe en los 7 tipos principales de daltonismo (protanopia, deuteranopia, tritanopia y sus formas leves, además de acromatopsia). Procesamiento 100% local con matrices oficiales de Machado et al. (2009).',
  url: 'https://meskeia.com/simulador-daltonismo/',
  category: 'UtilityApplication',
  features: [
    'Simulación de 7 tipos de daltonismo + visión normal',
    'Matrices oficiales Machado et al. (2009)',
    'Sube tu imagen o usa la paleta de prueba incluida',
    'Descarga cada simulación en PNG',
    'Procesamiento 100% local (la imagen nunca sale del navegador)',
    'Funciona sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['daltonismo', 'accesibilidad', 'diseño', 'WCAG', 'color blindness', 'protanopia', 'deuteranopia', 'tritanopia'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el daltonismo y qué tipos existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El daltonismo es una alteración hereditaria en la percepción del color causada por la ausencia o mal funcionamiento de uno o más tipos de conos en la retina. Los tipos más frecuentes son la protanopia y la deuteranopia (dificultad para distinguir rojos y verdes), que afectan a alrededor del 8% de los hombres y el 0,5% de las mujeres. La tritanopia (azul-amarillo) y la acromatopsia (ausencia total de color) son mucho más raras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo simula una herramienta digital la visión de una persona con daltonismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se aplican matrices de transformación de color que modelan cómo cada tipo de daltonismo altera la señal visual. Las matrices más utilizadas son las de Machado, Oliveira y Fernandes (2009), derivadas de datos fisiológicos sobre la sensibilidad espectral de cada tipo de cono. El proceso transforma píxel a píxel los colores de la imagen original para reproducir la apariencia percibida por cada tipo de daltónico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué es importante considerar el daltonismo al diseñar interfaces o presentaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aproximadamente 1 de cada 12 hombres tiene algún grado de daltonismo. Si una interfaz, gráfico o presentación codifica información únicamente con color (por ejemplo, rojo = error, verde = correcto), una parte significativa del público no podrá interpretar ese mensaje. Los estándares WCAG recomiendan no usar el color como único medio de transmitir información, combinándolo siempre con iconos, texto o patrones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre protanopia, deuteranopia y tritanopia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La protanopia implica la ausencia de conos sensibles al rojo: los colores rojos aparecen más oscuros y pueden confundirse con marrones o negros. La deuteranopia supone la ausencia de conos verdes: rojos y verdes se confunden, aunque los rojos no se oscurecen tanto como en la protanopia. La tritanopia, mucho menos frecuente, afecta a los conos azules: azules y amarillos se perciben de forma similar, y los colores fríos pierden saturación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo hacer que mis diseños sean accesibles para personas con daltonismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales recomendaciones son: no codificar información solo con color, asegurarse de que el contraste entre texto y fondo cumple WCAG AA (ratio ≥ 4,5:1), usar iconos o patrones junto al color en gráficos y señales de estado, y evitar combinaciones problemáticas como rojo-verde o azul-morado. Simular el diseño en los distintos tipos de daltonismo antes de publicarlo ayuda a detectar problemas que serían difíciles de intuir sin la herramienta.',
      },
    },
  ],
};

import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Círculo de Quintas Interactivo — Acordes, Tonalidades y Armonía | meskeIA',
  description: 'Explora el círculo de quintas: haz clic en cualquier tonalidad y descubre sus acordes diatónicos, armadura de clave, relativa menor y tonalidades vecinas. Teoría musical visual.',
  keywords: [
    'círculo de quintas',
    'teoría musical',
    'acordes diatónicos',
    'armadura de clave',
    'tonalidades',
    'armonía musical',
    'relativa menor',
    'progresiones de acordes',
    'música',
    'composición musical',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Círculo de Quintas Interactivo — Acordes y Armonía',
    description: 'Haz clic en cualquier tonalidad y descubre sus acordes diatónicos, armadura de clave y relativa menor. Herramienta visual de teoría musical.',
    url: 'https://meskeia.com/visualizador-circulo-quintas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA — Círculo de Quintas Interactivo',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Círculo de Quintas Interactivo | meskeIA',
    description: 'Haz clic en cualquier tonalidad y descubre acordes diatónicos, armadura y relativa menor. Teoría musical visual.',
  },
  alternates: {
    canonical: 'https://meskeia.com/visualizador-circulo-quintas/',
  },
  other: {
    'application-name': 'Círculo de Quintas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Círculo de Quintas Interactivo',
  description: 'Visualizador interactivo del círculo de quintas. Haz clic en cualquier tonalidad para ver sus acordes diatónicos, armadura de clave, relativa menor y progresiones populares. Herramienta esencial de teoría musical.',
  url: 'https://meskeia.com/visualizador-circulo-quintas/',
  category: 'EducationalApplication',
  features: [
    'Círculo de quintas SVG interactivo con 12 tonalidades mayores y sus relativas menores',
    'Muestra los 7 acordes diatónicos al seleccionar cualquier tonalidad',
    'Armadura de clave con sostenidos y bemoles para cada tonalidad',
    'Identificación de tonalidades vecinas: dominante y subdominante',
    'Progresiones populares (I-IV-V, I-V-vi-IV, ii-V-I) para cada tonalidad',
    'Resaltado visual de enharmonías (F#/Gb, B/Cb, C#/Db)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Diseño responsivo optimizado para móvil y escritorio',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el círculo de quintas y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El círculo de quintas es una representación visual de las 12 tonalidades musicales ordenadas de forma que cada tonalidad vecina difiere en una sola nota. Sirve para entender las relaciones armónicas entre tonalidades, saber cuántos sostenidos o bemoles tiene la armadura de clave de cada una, identificar la relativa menor, y construir progresiones de acordes que suenen coherentes. Es una herramienta fundamental tanto para composición como para improvisación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué acordes pertenecen a la tonalidad de Do mayor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tonalidad de Do mayor (C mayor) contiene 7 acordes diatónicos construidos sobre cada grado de la escala: Do mayor (I), Re menor (ii), Mi menor (iii), Fa mayor (IV), Sol mayor (V), La menor (vi) y Si disminuido (vii°). No tiene ni sostenidos ni bemoles en su armadura, lo que la convierte en la tonalidad de referencia más sencilla para aprender teoría musical.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una tonalidad mayor y su relativa menor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una tonalidad mayor y su relativa menor comparten exactamente las mismas notas y la misma armadura de clave, pero el centro tonal es distinto. Por ejemplo, Do mayor y La menor usan las mismas 7 notas, pero Do mayor comienza y termina en Do, mientras que La menor gira en torno a La. La diferencia de sonoridad (alegre vs. melancólico) viene del punto de reposo y los grados que se enfatizan en cada escala.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se usa el círculo de quintas para elegir acordes que suenen bien juntos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tonalidades adyacentes en el círculo de quintas (vecinas a izquierda y derecha) comparten 6 de sus 7 notas, por lo que los acordes de esas tonalidades funcionan bien juntos. Las progresiones más usadas en música pop y clásica (I-IV-V, I-V-vi-IV, ii-V-I) se pueden leer directamente en el círculo. Selecciona una tonalidad en el visualizador y verás tanto sus acordes diatónicos como las progresiones más comunes con los nombres de acordes reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las enharmonías y por qué Fa# y Sol♭ son la misma tonalidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dos notas enarmónicas suenan igual pero se escriben de forma distinta según el contexto musical. Fa# mayor y Sol♭ mayor son el mismo conjunto de sonidos en un piano, pero se notan diferente: Fa# mayor tiene 6 sostenidos y Sol♭ mayor tiene 6 bemoles. Los compositores eligen una u otra notación según qué resulte más legible para los músicos en la partitura. En el círculo de quintas, estas tonalidades equivalentes aparecen en el mismo punto y se resaltan visualmente como enharmonías.',
      },
    },
  ],
};

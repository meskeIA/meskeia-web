import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Transpositor de Acordes — Cambia el Tono de tu Canción | meskeIA',
  description: 'Transpón los acordes de cualquier canción a otro tono al instante. Introduce tus acordes, elige el tono destino y obtén la versión transpuesta. Gratuito, sin registro.',
  keywords: 'transpositor acordes, cambiar tono canción, transponer guitarra, acordes transpuestos, cambio tonalidad, transposición musical, acordes guitarra, escala cromática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Transpositor de Acordes | meskeIA',
    description: 'Transpón los acordes de cualquier canción a otro tono al instante. Ideal para guitarristas y cantantes.',
    url: 'https://meskeia.com/transpositor-acordes/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transpositor de Acordes | meskeIA',
    description: 'Transpón acordes a cualquier tonalidad al instante. Gratuito y sin registro.',
  },
  other: {
    'application-name': 'Transpositor de Acordes meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Transpositor de Acordes',
  description: 'Herramienta para transponer acordes de guitarra y piano a cualquier tonalidad. Introduce los acordes de una canción, selecciona el tono original y destino, y obtén los acordes transpuestos al instante.',
  url: 'https://meskeia.com/transpositor-acordes/',
  category: 'UtilityApplication',
  features: [
    'Transposición instantánea de acordes a cualquier tonalidad',
    'Soporta acordes con sufijos: m, 7, m7, maj7, sus2, sus4, dim, aug y más',
    'Tabla de referencia con los 7 grados en ambas tonalidades',
    'Progresiones predefinidas populares (I-V-vi-IV, ii-V-I, etc.)',
    'Copia el resultado con un clic',
    'Selector de tono original y destino con las 12 notas de la escala cromática',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es transponer acordes y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Transponer acordes consiste en mover una canción completa hacia un tono más agudo o más grave manteniendo exactamente la misma progresión armónica. Se usa principalmente para adaptar una canción a un rango vocal cómodo o para tocarla en un instrumento con una afinación diferente. Por ejemplo, si una canción está en Do y resulta demasiado aguda, transponerla a La permite cantar sin esfuerzo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se transpone un acorde manualmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala cromática tiene 12 semitonos: Do, Do#, Re, Re#, Mi, Fa, Fa#, Sol, Sol#, La, La# y Si. Para transponer, cuenta los semitonos que hay entre el tono origen y el destino, y desplaza cada acorde ese mismo número de posiciones en la escala. El sufijo del acorde (m, 7, maj7, sus4…) permanece invariable; solo cambia la nota raíz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo transponer canciones con acordes complejos como m7b5 o add9?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La transposición solo afecta a la nota raíz del acorde; cualquier sufijo de extensión o alteración (m7, maj7, sus2, sus4, dim, aug, add9, b5…) se conserva exactamente igual. Esto permite transponer progresiones de jazz, pop avanzado o bossa nova sin perder ninguna de sus características armónicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué instrumentos es útil el transpositor de acordes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para guitarristas que quieren adaptar una canción a su voz, para pianistas que acompañan a cantantes con registros distintos, y para ukelele, bajo o cualquier instrumento de cuerda. También es habitual en ensayos con cantantes que no han estudiado solfeo y solo necesitan ver los acordes en el nuevo tono sin entender la teoría detrás.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre transponer y modular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Transponer significa trasladar toda una pieza a otro tono desde el principio hasta el final, manteniendo la relación entre los acordes. Modular, en cambio, es cambiar de tonalidad dentro de la propia canción, normalmente en el puente o el estribillo final, creando un efecto de subida de energía. Ambos procesos usan la misma aritmética de semitonos, pero la modulación es un recurso compositivo mientras que la transposición es una adaptación práctica.',
      },
    },
  ],
};

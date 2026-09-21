import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conjugador de Verbos Español - Todos los tiempos verbales | meskeIA',
  description: 'Conjugador completo de verbos en español. Todos los tiempos verbales: indicativo, subjuntivo, imperativo. Incluye verbos irregulares. Gratis y sin registro.',
  keywords: 'conjugador verbos, conjugación español, verbos irregulares, tiempos verbales, indicativo, subjuntivo, imperativo, gramática española',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conjugador de Verbos Español | meskeIA',
    description: 'Conjuga cualquier verbo en español. Todos los tiempos, incluidos irregulares.',
    url: 'https://meskeia.com/conjugador-verbos/',
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
    title: 'Conjugador de Verbos Español | meskeIA',
    description: 'Conjuga cualquier verbo en español con todos los tiempos verbales.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conjugador de Verbos Español",
  description: "Conjugador completo de verbos en español. Todos los tiempos verbales: indicativo, subjuntivo, imperativo. Incluye verbos irregulares. Gratis y sin registro.",
  url: "https://meskeia.com/conjugador-verbos/",
  category: 'EducationalApplication',
  features: [
    'Los 17 tiempos verbales de la RAE: 10 de indicativo, 6 de subjuntivo y el imperativo',
    'Tiempos compuestos completos, con el participio irregular de cada verbo (he dicho, hubiera vuelto)',
    'Futuro de subjuntivo, simple y compuesto (fuere, hubiere cantado), marcado como arcaico',
    'Pretérito anterior con su nota de uso: cuándo aparece y por qué casi no se ve',
    'Más de 70 verbos irregulares con conjugación verificada, y conjugación automática de los regulares',
    'Buscador con sugerencias a partir de dos letras',
    'Gerundio y participio de cada verbo',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos tiempos verbales tiene el español?',
      acceptedAnswer: { '@type': 'Answer', text: 'El español tiene 17 tiempos verbales según la RAE, repartidos en tres modos: indicativo (10), subjuntivo (6) e imperativo (1). De esos 17, nueve son simples y ocho son compuestos, formados siempre con el auxiliar "haber" más el participio (he comido, había llegado, habré terminado). El indicativo empareja cada tiempo simple con su compuesto: presente y pretérito perfecto compuesto, imperfecto y pluscuamperfecto, indefinido y pretérito anterior, futuro simple y futuro perfecto, condicional simple y condicional perfecto.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los verbos irregulares más comunes en español?',
      acceptedAnswer: { '@type': 'Answer', text: 'Los verbos irregulares más frecuentes en español son: ser, estar, tener, ir, hacer, poder, querer, saber, venir y decir. Son irregulares porque alteran su raíz o sus desinencias en algunos tiempos o personas (por ejemplo, "yo hago" en lugar de "yo haco", o "yo fui" como pasado de ir). Aprender su conjugación es fundamental para el dominio del idioma.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre pretérito indefinido e imperfecto?',
      acceptedAnswer: { '@type': 'Answer', text: 'El pretérito indefinido (comí, llegué, salió) expresa acciones pasadas completadas en un momento concreto o con un límite definido. El pretérito imperfecto (comía, llegaba, salía) describe acciones pasadas habituales, continuas o que servían de marco a otra acción. Por ejemplo: "Mientras leía (imperfecto) llegó (indefinido) mi amiga". Esta distinción es uno de los aspectos que más dificultad presenta a los hablantes no nativos.' },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se conjuga el subjuntivo y cuándo se usa?',
      acceptedAnswer: { '@type': 'Answer', text: 'El subjuntivo se forma generalmente con la raíz del presente de indicativo y desinencias específicas (-e/-a para la primera conjugación y -a/-e para la segunda y tercera). Se usa para expresar deseos, dudas, posibilidades, emociones y mandatos negativos: "Espero que vengas", "No creo que llueva", "Quiero que estudies". El presente de subjuntivo (hable, coma, viva) y el pretérito imperfecto de subjuntivo (hablara/hablase) son los tiempos más empleados.' },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un conjugador de verbos en línea?',
      acceptedAnswer: { '@type': 'Answer', text: 'Un conjugador de verbos en línea permite obtener de forma inmediata todas las formas conjugadas de cualquier verbo en español: regulares, irregulares, reflexivos y defectivos. Es útil para estudiantes de español como segunda lengua, para hablantes nativos que dudan de formas poco frecuentes (futuro de subjuntivo, pretérito anterior), y para escritores o traductores que necesitan confirmar la conjugación correcta sin consultar gramáticas extensas.' },
    },
  ],
};

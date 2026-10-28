import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Legibilidad INFLESZ y Flesch-Szigriszt | meskeIA',
  description: 'Analiza la legibilidad de tus textos en español con Flesch-Szigriszt, Fernández Huerta y la escala INFLESZ. Señala las frases largas y compara dos versiones.',
  keywords: 'legibilidad, flesch, szigriszt, fernandez huerta, inflesz, readability, texto, español, nivel lectura, seo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Legibilidad INFLESZ y Flesch-Szigriszt',
    description: 'Analiza la legibilidad de tus textos con fórmulas adaptadas al español',
    url: 'https://meskeia.com/calculadora-legibilidad/',
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
    title: 'Calculadora de Legibilidad',
    description: 'Mide la facilidad de lectura de tus textos en español',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Legibilidad",
  description: "Analiza la legibilidad de tus textos en español con Flesch-Szigriszt, Fernández Huerta y la escala INFLESZ. Señala las frases largas y compara dos versiones.",
  url: "https://meskeia.com/calculadora-legibilidad/",
  category: 'UtilityApplication',
  features: [
    'Puntuación Flesch-Szigriszt y Fernández Huerta calculadas en el navegador',
    'Grado de lectura con la escala INFLESZ de cinco tramos y el umbral de 55 para textos de salud',
    'Frases de más de 25 palabras resaltadas en el texto y ordenadas por cuánto subiría la puntuación al partirlas',
    'Palabras de cuatro sílabas o más señaladas en el propio texto',
    'Comparación de dos versiones del texto, guardada y actual, con el cambio de cada medida',
    'Recuento de palabras, frases, sílabas y palabras largas',
  ],
});

/**
 * FUENTE ÚNICA de la FAQ: page.tsx la pinta y faqJsonLd la publica (hallazgo 3605). Eran dos
 * textos distintos —8 preguntas en la página y 5 en el JSON-LD— que a la misma pregunta daban
 * otra cifra y otra escala. Texto plano. Las cifras por tipo de texto, el «mínimo de 60» y el
 * «más de 65 cumple WCAG» se retiraron por no tener fuente (hallazgos 3603 y 3606): lo que queda
 * con cifra sale de Barrio-Cantalejo y otros (2008), la fuente de la escala INFLESZ.
 */
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué mide exactamente la legibilidad?',
    answer:
      'La legibilidad estima la facilidad con la que un lector medio puede entender un texto escrito. Se calcula a partir de la longitud de las frases (palabras por oración) y de la de las palabras (sílabas por palabra). No mide la calidad del contenido ni su precisión, sino la accesibilidad lingüística.',
  },
  {
    question: '¿Cuál es la diferencia entre Flesch-Szigriszt y Fernández Huerta?',
    answer:
      'Ambas son adaptaciones al español de la fórmula original de Rudolf Flesch. Fernández Huerta publicó la suya en 1959 (206,84 − 60 × sílabas por palabra − 1,02 × palabras por frase) y Szigriszt la suya en 1992, con un coeficiente de 62,3 por sílaba. INFLESZ no es una tercera fórmula: es la escala de cinco tramos que Barrio-Cantalejo y otros validaron en 2008 para leer la puntuación Flesch-Szigriszt, y es la referencia habitual en el ámbito sanitario español.',
  },
  {
    question: '¿Qué puntuación conviene para cada tipo de texto?',
    answer:
      'No hay una cifra oficial por tipo de texto. La referencia publicada para español es la escala INFLESZ (Barrio-Cantalejo y otros, 2008): Muy difícil por debajo de 40, Algo difícil de 40 a 55, Normal de 55 a 65, Bastante fácil de 65 a 80 y Muy fácil por encima de 80. En el estudio que la validó, la prensa de quiosco puntuó de media 60, los libros escolares 67,4 y las revistas científicas 37,9, y los autores toman 55 como umbral para los textos de salud dirigidos a pacientes. Cuanto más amplio sea el público, más conviene acercarse a los tramos altos.',
  },
  {
    question: '¿Afecta la legibilidad al posicionamiento SEO?',
    answer:
      'Google no usa directamente los índices de legibilidad como factor de ranking, pero la legibilidad impacta métricas que sí influyen en el SEO: tiempo de permanencia, tasa de rebote y porcentaje de scroll. Textos más legibles generan mejores señales de experiencia de usuario, lo que indirectamente mejora el posicionamiento orgánico.',
  },
  {
    question: '¿Cómo mejorar la legibilidad sin perder rigor?',
    answer:
      'El rigor está en los datos y argumentos, no en la complejidad de las frases. Puedes usar frases cortas que expliquen una sola idea, definir los términos técnicos la primera vez que aparecen, usar listas para información enumerativa, incluir ejemplos concretos y evitar las nominalizaciones («analizar» en vez de «el análisis de»).',
  },
  {
    question: '¿Cuál es la longitud recomendable de frases y párrafos?',
    answer:
      'No hay una cifra única. Esta app señala las frases de más de 25 palabras y, al proponer partirlas, usa trozos de 20 como mucho: son criterios de la app, no una norma. Cada palabra de más en la frase media resta un punto entero a Flesch-Szigriszt. En pantalla ayudan los párrafos breves, sobre todo en el móvil, donde un bloque compacto ocupa toda la vista.',
  },
  {
    question: '¿Qué relación hay entre legibilidad y accesibilidad WCAG?',
    answer:
      'Las Pautas de Accesibilidad al Contenido Web (WCAG 2.1) incluyen el criterio 3.1.5, Nivel de lectura (AAA): cuando un texto exige una capacidad de lectura superior a la de la educación secundaria inferior, se ofrece contenido complementario o una versión que no la exija. Las WCAG no fijan una puntuación Flesch-Szigriszt equivalente, y la escala INFLESZ no da un nivel educativo, así que esta app no traduce su cifra a ese criterio.',
  },
  {
    question: '¿Qué herramientas complementan el análisis de legibilidad?',
    answer:
      'Para optimizar textos de forma integral: el Diccionario panhispánico de dudas (RAE y ASALE) para las dudas de norma, Hemingway App para detectar frases pasivas, LanguageTool para gramática, Google Search Console para medir el impacto en SEO y la función de lectura inmersiva de Microsoft Word para visualizar el texto como lo vería un lector con dislexia.',
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

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Contador de Sílabas, Rimas y Métrica de Versos - Analiza tu Poema',
  description: 'Cuenta sílabas, detecta la rima (consonante o asonante) y reconoce la estrofa: soneto, romance, redondilla, lira, cuarteto. Con sinalefas, esquema ABBA y tipo de verso. Gratis.',
  keywords: 'contador de rimas, esquema de rima, rima consonante y asonante, tipo de estrofa, analizar un poema, métrica de versos, sinalefas, escansión poética, contador sílabas poéticas, medida de versos, contador sílabas, separar sílabas, silabeador español, soneto romance redondilla lira',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/contador-silabas/',
  },
  openGraph: {
    type: 'website',
    title: 'Contador de Sílabas, Rimas y Métrica de Versos',
    description: 'Cuenta sílabas, detecta la rima y reconoce la estrofa: soneto, romance, redondilla, lira. Con sinalefas, esquema de rima y tipo de verso.',
    url: 'https://meskeia.com/contador-silabas/',
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
    title: 'Contador de Sílabas y Métrica de Versos',
    description: 'Cuenta sílabas y analiza la métrica de versos: sinalefas, tipos de verso, diptongos e hiatos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se separan las sílabas en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En español, cada sílaba debe contener al menos una vocal. Las reglas básicas son: una consonante entre vocales va con la vocal siguiente (ca-sa), dos consonantes entre vocales se separan (car-ta), salvo los grupos inseparables bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr y tl. Las vocales fuertes (a, e, o) siempre forman sílabas distintas entre sí.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un diptongo y cómo afecta al conteo de sílabas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un diptongo es la unión de dos vocales que se pronuncian en una sola sílaba. Se forma cuando una vocal fuerte (a, e, o) se combina con una vocal débil átona (i, u), o dos débiles juntas. Por ejemplo, "aire" tiene 2 sílabas (ai-re) por el diptongo "ai". El diptongo reduce el conteo de sílabas respecto a si las vocales fueran independientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un hiato y en qué se diferencia del diptongo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un hiato ocurre cuando dos vocales seguidas pertenecen a sílabas distintas y se pronuncian separadas. Se forma entre dos vocales fuertes (po-e-ta), o cuando una vocal débil lleva tilde (pa-ís, Ra-úl). El hiato aumenta el número de sílabas respecto al diptongo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se mide la métrica de un verso en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para medir un verso se cuentan las sílabas métricas: si la última palabra es aguda se añade una sílaba al total; si es esdrújula se resta una; si es llana no se modifica. También se aplica la sinalefa (fusión de la vocal final de una palabra con la vocal inicial de la siguiente). El resultado determina el tipo de verso: heptasílabo (7), endecasílabo (11), alejandrino (14), etc.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas sílabas tiene un verso endecasílabo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un verso endecasílabo tiene 11 sílabas métricas. Es el verso más usado en la poesía española clásica y renacentista, empleado por Garcilaso de la Vega y en los sonetos. Ejemplo: "En el principio de tus años tiernos" tiene 11 sílabas métricas contando la sinalefa entre palabras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se pueden contar las sílabas poéticas de un verso automáticamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Basta con escribir el verso (o pegar una estrofa con un verso por línea) para obtener las sílabas métricas ya calculadas: se detectan las sinalefas entre palabras, se aplica el ajuste por acento final (aguda +1, llana ±0, esdrújula −1) y se identifica el tipo de verso. Por ejemplo, "¿Qué es la vida? Un frenesí" tiene 9 sílabas fonéticas, pero 2 sinalefas y un final agudo lo dejan en 8 sílabas métricas: un octosílabo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre rima consonante y asonante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la rima consonante coinciden todos los sonidos a partir de la vocal acentuada de la última palabra: "cielo" rima con "pelo" o con "consuelo". En la asonante coinciden solo las vocales: "sombra" rima con "hoja" (o-a), aunque las consonantes sean distintas. La rima siempre empieza en la vocal tónica, no en la última sílaba: por eso "cantar" y "amar" riman en consonante, pero "cántaro" y "amar" no.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el esquema de rima y cómo se anota?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es la fórmula que resume qué versos riman entre sí: a cada rima distinta se le asigna una letra por orden de aparición. Se escribe en mayúscula cuando el verso es de arte mayor (nueve sílabas o más) y en minúscula si es de arte menor (ocho o menos); un guion marca un verso suelto, que no rima con ninguno. Así, un soneto se anota ABBA ABBA CDC DCD y una redondilla, abba.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se reconoce si un poema es un soneto, un romance o una redondilla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por la combinación de número de versos, medida y esquema de rima. El soneto son catorce endecasílabos en dos cuartetos y dos tercetos (ABBA ABBA y dos tercetos variables). El romance es una serie indefinida de octosílabos con rima asonante solo en los versos pares, quedando los impares sueltos. La redondilla son cuatro octosílabos abba, y la cuarteta, cuatro octosílabos abab. La lira combina heptasílabos y endecasílabos en el orden 7a 11B 7a 7b 11B.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Contador de Sílabas',
  description: 'Contador y separador de sílabas en español. Divide palabras y textos en sílabas siguiendo las reglas del español. Útil para métrica poética, ortografía y enseñanza del idioma.',
  url: 'https://meskeia.com/contador-silabas/',
  category: 'EducationalApplication',
  features: [
    'Separación silábica de palabras y textos',
    'Conteo automático de sílabas',
    'Escansión automática del verso: sílabas métricas',
    'Detección de sinalefas entre palabras',
    'Ajuste por acento final (aguda, llana, esdrújula)',
    'Identificación del tipo de verso (octosílabo, endecasílabo, alejandrino…)',
    'Análisis de rima consonante y asonante',
    'Esquema de rima con letras (ABBA, abab, -a-a)',
    'Reconocimiento de la estrofa: soneto, romance, redondilla, lira, cuarteto, décima',
    'Modo composición: mide el verso mientras lo escribes',
    'Identificación de diptongos, hiatos y triptongos',
    'En español',
  ],
  keywords: ['contador sílabas', 'separar sílabas', 'silabeador', 'métrica poesía', 'ortografía'],
});

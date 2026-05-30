import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Hashing y Colisiones | meskeIA',
  description:
    'Visualiza tablas hash, funciones hash (mod, polinómica, djb2) y colisiones. Encadenamiento vs sondeo lineal con factor de carga en tiempo real.',
  keywords:
    'tabla hash, hashing, función hash, colisiones, encadenamiento, sondeo lineal, factor de carga, djb2, estructuras de datos, informática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Hashing y Colisiones',
    description:
      'Visualiza tablas hash con funciones hash y resolución de colisiones por encadenamiento o sondeo lineal. Factor de carga α en tiempo real.',
    url: 'https://meskeia.com/simulador-hashing-colisiones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Hashing y Colisiones | meskeIA',
    description:
      'Tablas hash interactivas: encadenamiento vs sondeo lineal, funciones hash mod/polinómica/djb2, factor de carga α.',
  },
  other: {
    'application-name': 'Simulador Hashing meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Hashing y Colisiones',
  description:
    'Tablas hash interactivas con funciones hash y resolución de colisiones por encadenamiento o sondeo lineal.',
  url: 'https://meskeia.com/simulador-hashing-colisiones/',
  category: 'EducationalApplication',
  features: [
    'Tabla hash visual con CSS grid',
    'Funciones hash: suma ASCII mod m, polinómica mod m, djb2 mod m',
    'Encadenamiento separado vs sondeo lineal',
    'Factor de carga α = n/m en tiempo real con barra de progreso',
    '5 conjuntos de palabras predefinidas',
    'Cálculo paso a paso del índice hash',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una tabla hash y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una tabla hash es una estructura de datos que asocia claves con valores usando una función hash para calcular un índice de almacenamiento. Permite búsquedas, inserciones y eliminaciones en tiempo promedio O(1), lo que la hace ideal para implementar diccionarios, cachés y conjuntos en programas reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una colisión en hashing y cómo se resuelve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una colisión ocurre cuando dos claves distintas producen el mismo índice hash. Hay dos estrategias principales para resolverla: encadenamiento separado (cada posición guarda una lista enlazada de elementos colisionados) y sondeo lineal (se busca la siguiente posición libre en la misma tabla). El encadenamiento es más simple; el sondeo lineal usa menos memoria pero sufre agrupamiento primario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el factor de carga α en una tabla hash?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El factor de carga α = n/m, donde n es el número de elementos almacenados y m el tamaño de la tabla. Mide cuán llena está la tabla. Con encadenamiento, un α > 1 es posible pero degrada el rendimiento. Con sondeo lineal se recomienda mantener α < 0,7 para evitar largas cadenas de sondeo y colisiones en cascada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre las funciones hash mod, polinómica y djb2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La función mod (suma ASCII mod m) es simple pero genera muchas colisiones para palabras con las mismas letras. La función polinómica pondera cada carácter por una potencia de una constante, distribuye mejor. La djb2 usa operaciones bit a bit (XOR y desplazamiento) logrando muy buena distribución y es ampliamente usada en implementaciones reales como Python 2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este simulador de hashing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de informática, ingeniería de software o Bachillerato Tecnológico que estudian estructuras de datos. También sirve a desarrolladores que quieren entender por qué Python dict o Java HashMap se comportan de cierta manera, y a quienes preparan entrevistas técnicas donde las preguntas sobre tablas hash son frecuentes.',
      },
    },
  ],
};

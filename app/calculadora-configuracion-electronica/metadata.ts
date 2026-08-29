import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Configuración Electrónica de Elementos e Iones - Diagrama de Möller | meskeIA',
  description:
    'Calcula la configuración electrónica de cualquier elemento o ion: diagrama de Möller paso a paso, notación abreviada de gas noble, diagrama de cajas con la regla de Hund, electrones desapareados, números cuánticos y las veinte excepciones reales como el cromo y el cobre.',
  keywords:
    'configuración electrónica, diagrama de Möller, regla de las diagonales, principio de Aufbau, regla de Hund, principio de exclusión de Pauli, configuración electrónica abreviada, configuración electrónica de iones, electrones de valencia, electrones desapareados, números cuánticos, paramagnético, diamagnético, excepciones cromo cobre, diagrama de cajas, orbitales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-configuracion-electronica/',
  },
  openGraph: {
    type: 'website',
    title: 'Configuración Electrónica de Elementos e Iones - Diagrama de Möller',
    description:
      'La configuración de cualquier elemento o ion, con el diagrama de Möller paso a paso, las cajas de orbitales y las excepciones reales',
    url: 'https://meskeia.com/calculadora-configuracion-electronica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Configuración Electrónica de Elementos e Iones - meskeIA',
    description: 'Diagrama de Möller, cajas de orbitales, iones y las veinte excepciones reales',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Configuración Electrónica',
  description:
    'Calculadora de configuración electrónica para los 118 elementos y sus iones. Aplica el orden de Madelung del diagrama de Möller, la regla de Hund y el principio de exclusión de Pauli, y devuelve la configuración completa y la abreviada con gas noble, el diagrama de cajas con las flechas de espín, los electrones de valencia y desapareados, el carácter paramagnético o diamagnético, el bloque, periodo y grupo deducidos, y los cuatro números cuánticos del último electrón. Incorpora las veinte excepciones experimentales (cromo, cobre, paladio, plata, oro, lantánidos y actínidos) explicando en cada caso por qué la regla falla.',
  url: 'https://meskeia.com/calculadora-configuracion-electronica/',
  category: 'EducationalApplication',
  features: [
    'Configuración electrónica de los 118 elementos',
    'Configuración de iones, quitando electrones del nivel n más alto',
    'Notación abreviada con el gas noble entre corchetes',
    'Diagrama de Möller con el recorrido de las diagonales',
    'Diagrama de cajas con la regla de Hund y las flechas de espín',
    'Electrones de valencia y electrones desapareados',
    'Carácter paramagnético o diamagnético',
    'Bloque, periodo y grupo deducidos de la configuración',
    'Los cuatro números cuánticos del último electrón',
    'Las veinte excepciones reales explicadas una a una',
    'Tabla periódica clicable y buscador de elementos',
    'En español',
  ],
  keywords: [
    'configuración electrónica',
    'diagrama de Möller',
    'regla de Hund',
    'principio de Aufbau',
    'números cuánticos',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se hace la configuración electrónica de un elemento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se van llenando los subniveles de menor a mayor energía siguiendo el orden n+l: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p, 6s, 4f, 5d, 6p, 7s, 5f, 6d, 7p. Cada subnivel admite un número fijo de electrones (s: 2, p: 6, d: 10, f: 14) y se pasa al siguiente cuando se llena. Ese orden es el que dibuja el diagrama de Möller con sus diagonales, y se aplica hasta agotar los electrones del átomo, que en un átomo neutro son tantos como su número atómico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el 4s se llena antes que el 3d?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque la energía de un subnivel no depende solo de n, sino de la suma n+l: el 4s tiene n+l = 4+0 = 4 y el 3d tiene 3+2 = 5, así que el 4s está por debajo y se llena antes. Ahora bien, una vez llenos ambos el 3d queda por debajo del 4s, y por eso al ionizar un metal de transición los primeros electrones que salen son los del 4s. Es la razón de que el hierro pase de [Ar] 3d⁶ 4s² a [Ar] 3d⁶ como Fe²⁺, y no a [Ar] 3d⁴ 4s² como haría si se vaciara el último subnivel escrito.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la configuración electrónica del hierro y la del ion Fe³⁺?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hierro tiene 26 electrones y su configuración es 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶, que abreviada queda [Ar] 3d⁶ 4s². El ion Fe³⁺ pierde tres electrones, pero no los tres últimos escritos: salen primero los dos del 4s, que es el nivel más externo, y solo después uno del 3d. El resultado es [Ar] 3d⁵, una capa d semillena con cinco electrones desapareados, que es justamente lo que explica la estabilidad del Fe³⁺ y su fuerte carácter paramagnético.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el cromo y el cobre no siguen la regla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla predice [Ar] 4s² 3d⁴ para el cromo y [Ar] 4s² 3d⁹ para el cobre, pero lo que se mide es [Ar] 3d⁵ 4s¹ y [Ar] 3d¹⁰ 4s¹. En ambos casos un electrón del 4s asciende al 3d porque un subnivel d semilleno (d⁵) o completo (d¹⁰) es más estable, y esa ganancia compensa el coste del ascenso. No son los dos únicos casos: hay veinte excepciones experimentales, entre ellas el paladio, que es el único elemento que deja su capa más externa completamente vacía ([Kr] 4d¹⁰).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la configuración electrónica abreviada o de gas noble?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una forma corta de escribir la configuración sustituyendo los electrones internos por el símbolo del gas noble anterior entre corchetes. En vez de escribir 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶ para el hierro se escribe [Ar] 3d⁶ 4s², porque el argón tiene exactamente esos 18 electrones internos. Solo se abrevia con gases nobles, nunca con otros elementos, y lo que queda fuera del corchete es lo que determina las propiedades químicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se saben los electrones desapareados y si un átomo es paramagnético?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por la regla de Hund: dentro de un mismo subnivel los electrones ocupan primero orbitales distintos con el mismo espín, y solo se emparejan cuando ya no quedan orbitales libres. Un subnivel p con 3 electrones tiene tres desapareados, y con 4 tiene solo dos, porque el cuarto se empareja con uno de los anteriores. Si al terminar queda algún electrón desapareado la sustancia es paramagnética y es atraída por un imán; si todos están emparejados es diamagnética. Por eso el hierro, con cuatro desapareados, responde a un campo magnético y el cinc, con ninguno, no.',
      },
    },
  ],
};

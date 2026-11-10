import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

// La keyword núcleo es «ley de Coulomb», universal en todo el español: no hay par España/Latam
// que añadir. Los descriptores de audiencia (secundaria, preparatoria, bachillerato) van en
// keywords y en el cuerpo, no en el título.

const URL = 'https://meskeia.com/simulador-ley-coulomb/';

export const metadata: Metadata = {
  title: 'Ley de Coulomb: Simulador y Calculadora de la Fuerza entre Cargas | meskeIA',
  description:
    'Calcula la fuerza entre dos cargas con la ley de Coulomb: módulo, atracción o repulsión, en el vacío o en un medio. Despeja la distancia o una carga y ve la gráfica F frente a r.',
  keywords:
    'ley de coulomb, calculadora ley de coulomb, simulador ley de coulomb, fuerza entre cargas, fuerza eléctrica, constante de coulomb, fuerza electrostática, atracción y repulsión de cargas, permitividad relativa, ejercicios ley de coulomb, física secundaria, preparatoria, bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: URL,
  },
  openGraph: {
    type: 'website',
    title: 'Ley de Coulomb: simulador y calculadora | meskeIA',
    description: 'La fuerza entre dos cargas, con su sentido, el efecto del medio y la gráfica del inverso del cuadrado.',
    url: URL,
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ley de Coulomb: simulador y calculadora | meskeIA',
    description: 'Calcula la fuerza entre dos cargas, despeja la distancia o una carga y mira cómo cae con r².',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador y calculadora de la ley de Coulomb',
  description:
    'Calcula la fuerza eléctrica entre dos cargas puntuales con la ley de Coulomb, en el vacío o en un medio con su permitividad relativa. Despeja la distancia o la carga desconocida, dibuja las dos fuerzas iguales y opuestas y la gráfica de F frente a r, y trae 12 casos para clase con solución.',
  url: URL,
  category: 'EducationalApplication',
  features: [
    'Fuerza entre dos cargas con su módulo y si se atraen o se repelen',
    'Despeje de la distancia o de la carga desconocida a partir de la fuerza',
    'Cargas en C, mC, µC, nC o cargas elementales, y distancias de metros a picómetros',
    'Medios con su permitividad relativa: vacío, aire, aceite, vidrio, etanol, agua o un valor propio',
    'Gráfica de F frente a r con deslizador para acercar y alejar las cargas',
    'Desarrollo del cálculo paso a paso en notación científica',
    '12 casos numerados para clase con corrección y un modo de práctica aleatorio',
  ],
  keywords: ['ley de Coulomb', 'fuerza eléctrica', 'electrostática', 'constante de Coulomb'],
});

// FUENTE ÚNICA de las dos bocas: la FAQ visible de page.tsx pinta este mismo array y el FAQPage
// de abajo lo mapea. Texto plano, sin marcado.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué dice la ley de Coulomb?',
    answer:
      'La fuerza entre dos cargas puntuales es proporcional al producto de las cargas e inversamente proporcional al cuadrado de la distancia que las separa: F = k·|q₁·q₂| / r². Actúa a lo largo de la línea que une las cargas, es de repulsión si tienen el mismo signo y de atracción si tienen signos contrarios. Charles-Augustin de Coulomb la midió con una balanza de torsión en 1785.',
  },
  {
    question: '¿Cuánto vale la constante de Coulomb k?',
    answer:
      'En el vacío, k = 1/(4π·ε₀) ≈ 8,99·10⁹ N·m²/C², donde ε₀ ≈ 8,854·10⁻¹² C²/(N·m²) es la permitividad del vacío. Muchos libros redondean a 9·10⁹ N·m²/C²: la diferencia es del 0,11 % y no cambia las cifras de un ejercicio escolar. Esta calculadora usa 8,99·10⁹.',
  },
  {
    question: '¿Cómo se calcula la fuerza entre dos cargas paso a paso?',
    answer:
      'Primero se pasan los datos al Sistema Internacional: cargas en culombios (1 µC = 10⁻⁶ C, 1 nC = 10⁻⁹ C) y distancia en metros. Después se multiplica k por el producto de las cargas sin signo y se divide entre la distancia al cuadrado. Por ejemplo, +2 µC y +3 µC a 0,3 m dan 8,99·10⁹ · 6·10⁻¹² / 0,09 ≈ 0,60 N, de repulsión.',
  },
  {
    question: '¿Qué pasa con la fuerza si se duplica la distancia?',
    answer:
      'Se divide entre cuatro, porque la distancia está elevada al cuadrado: con el doble de distancia, r² es cuatro veces mayor. Con el triple, la fuerza se divide entre nueve. En cambio, duplicar una de las cargas solo duplica la fuerza, y duplicar las dos la multiplica por cuatro.',
  },
  {
    question: '¿Por qué la fuerza es menor dentro del agua o de un aceite?',
    answer:
      'Un medio material se polariza alrededor de las cargas y debilita su interacción. La fuerza del vacío queda dividida entre la permitividad relativa εr del medio: F = k·|q₁·q₂| / (εr·r²). El aire apenas cambia nada (εr ≈ 1,0006), pero el agua tiene εr ≈ 80, y por eso disuelve tan bien la sal: la atracción entre sus iones queda unas 80 veces más débil.',
  },
  {
    question: '¿En qué se parece la ley de Coulomb a la gravitación de Newton?',
    answer:
      'Las dos son fuerzas a distancia que disminuyen con el cuadrado de la distancia y van en la línea que une los dos cuerpos. Se diferencian en que la gravedad solo atrae y la fuerza eléctrica puede atraer o repeler, y en la intensidad: entre un protón y un electrón, la atracción eléctrica es unas 10³⁹ veces mayor que la gravitatoria.',
  },
  {
    question: '¿Para qué nivel educativo sirve esta calculadora?',
    answer:
      'La ley de Coulomb se estudia en la física de los últimos cursos de secundaria y en preparatoria o bachillerato, y vuelve en el primer curso de física universitaria. Los 12 casos para clase van de la aplicación directa de la fórmula a los despejes de distancia y carga, los problemas de proporcionalidad y situaciones como el átomo de hidrógeno o una esfera que levita.',
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

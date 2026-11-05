import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

// El decodificador vivía dentro de calculadora-resistencias-led, y Google no la enseñaba para
// «código de colores de resistencias»: en 90 días, 1 impresión con «colores» + «resistencia»,
// frente a ~1.500 en 6 meses de esa familia de búsquedas en Bing (S0251, 05/11/2026). Por eso
// el título nombra la búsqueda tal cual y añade «resistores», que es como se dice en buena parte
// de Latinoamérica.
export const metadata: Metadata = {
  title: 'Código de Colores de Resistencias: Calculadora de 4, 5 y 6 Bandas | meskeIA',
  description:
    'Calcula el valor de una resistencia por sus colores (3, 4, 5 y 6 bandas) o al revés, del valor a los colores. Con tolerancia, rango, serie E12/E24/E96 y lectura al revés.',
  keywords:
    'código de colores resistencias, calculadora de resistencias, colores de resistencias, tabla de colores resistencias, código de colores resistores, resistencia 4 bandas, resistencia 5 bandas, resistencia 6 bandas, valor resistencia colores, serie E12, serie E24, 4k7',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Código de Colores de Resistencias: 4, 5 y 6 Bandas',
    description:
      'De los colores al valor y del valor a los colores, con tolerancia, rango y valores normalizados E12, E24 y E96.',
    url: 'https://meskeia.com/codigo-colores-resistencias/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Código de Colores de Resistencias',
    description: 'Calculadora de 3, 4, 5 y 6 bandas, y del valor a los colores.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Código de Colores de Resistencias meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Código de Colores de Resistencias: Calculadora de 4, 5 y 6 Bandas',
  description:
    'Calculadora del código de colores de resistencias (IEC 60062): obtiene el valor, la tolerancia y el rango de una resistencia de 3, 4, 5 o 6 bandas, y hace el paso inverso, del valor a los colores, con el valor normalizado más cercano de las series E12, E24 y E96.',
  url: 'https://meskeia.com/codigo-colores-resistencias/',
  category: 'EducationalApplication',
  features: [
    'Lectura de resistencias de 3, 4, 5 y 6 bandas con dibujo de la resistencia',
    'Tolerancia, valor mínimo y máximo, y coeficiente de temperatura de la sexta banda',
    'Paso inverso: del valor (470, 4,7k, 4k7, 2M2, R47) a los colores',
    'Comprueba si el valor pertenece a las series normalizadas E6, E12, E24, E48 y E96',
    'Valor normalizado más cercano en E12, E24 y E96 con su diferencia en %',
    'Avisa cuando la resistencia puede estar leída desde el otro extremo',
  ],
});

// FAQ: fuente única de la FAQ visible (page.tsx) y del FAQPage JSON-LD. Texto plano.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo se lee el código de colores de una resistencia?',
    answer:
      'Se coloca la resistencia con la banda de tolerancia (dorada o plateada en las de 4 bandas) a la derecha y se lee de izquierda a derecha. Las primeras bandas son cifras: negro 0, marrón 1, rojo 2, naranja 3, amarillo 4, verde 5, azul 6, violeta 7, gris 8 y blanco 9. La siguiente es el multiplicador, que dice cuántos ceros añadir, y la última, la tolerancia. Amarillo, violeta, rojo y dorado es 47 seguido de dos ceros: 4.700 ohmios, 4,7 kΩ, con un 5 % de tolerancia.',
  },
  {
    question: '¿Qué diferencia hay entre una resistencia de 4, 5 y 6 bandas?',
    answer:
      'La de 4 bandas tiene dos cifras, multiplicador y tolerancia, y es la habitual en resistencias del 5 %. La de 5 bandas tiene tres cifras, lo que permite valores como 4,99 kΩ de las series de precisión, y suele ser del 1 %. La de 6 bandas añade al final el coeficiente de temperatura, en partes por millón por grado. La de 3 bandas no lleva tolerancia y se entiende que es del 20 %.',
  },
  {
    question: '¿Por qué lado se empieza a leer una resistencia?',
    answer:
      'Por el lado contrario a la banda de tolerancia, que suele estar algo más separada de las demás. En las de 4 bandas no hay duda: el dorado y el plateado no pueden ser la primera cifra. En las de 5 bandas de precisión, en cambio, hay resistencias que dan un valor posible en los dos sentidos, como marrón, negro, negro, marrón, marrón, que es 1 kΩ en un sentido y 110 Ω en el otro. La calculadora avisa de esos casos; si persiste la duda, se mide con un multímetro.',
  },
  {
    question: '¿Qué son las series E12, E24 y E96?',
    answer:
      'Son los valores normalizados en que se fabrican las resistencias, repartidos de forma que cada uno cubra a sus vecinos con su tolerancia. E12 tiene 12 valores por década (10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68 y 82) y va con el 10 %; E24 tiene 24 y va con el 5 %; E96 tiene 96 y va con el 1 %. Si al leer los colores sale un valor que no está en ninguna serie, lo más probable es que algún color se haya leído mal.',
  },
  {
    question: '¿Qué significa 4k7, 2M2 o R47 en un esquema?',
    answer:
      'Es la notación de esquemas de la norma IEC 60062: la letra indica el multiplicador y hace de coma, para que un punto o una coma que se borre al imprimir no cambie el valor. R es ohmios, k kiloohmios y M megaohmios: 4k7 es 4,7 kΩ, 2M2 es 2,2 MΩ y R47 es 0,47 Ω. La calculadora entiende esa notación al pasar del valor a los colores.',
  },
  {
    question: '¿Para qué sirve el paso del valor a los colores?',
    answer:
      'Para buscar en una caja de resistencias sueltas la que pide un esquema o una práctica, o para saber qué colores tiene que llevar la que vas a comprar. Si el valor no existe con esas cifras, por ejemplo 1.234 Ω con 4 bandas, la calculadora dice a qué valor se redondea y cuál es el normalizado más cercano de cada serie.',
  },
  {
    question: '¿Qué es el coeficiente de temperatura de la sexta banda?',
    answer:
      'Indica cuánto cambia el valor con la temperatura, en partes por millón por grado (ppm/K). Una resistencia de 10 kΩ con 50 ppm/K varía 0,5 ohmios por cada grado: entre 20 y 70 °C cambia 25 ohmios, un 0,25 %. Solo importa en circuitos de precisión, como instrumentos de medida.',
  },
  {
    question: '¿Sirve el código de colores para las resistencias SMD?',
    answer:
      'No. Las resistencias de montaje superficial (SMD) son demasiado pequeñas para llevar bandas y se marcan con números: tres o cuatro cifras en las que la última es el número de ceros (103 es 10 kΩ, 4701 es 4,7 kΩ) o un código de dos cifras y una letra en las de precisión. El código de colores es el de las resistencias de patillas, las que se usan en placas de prototipos y en las prácticas de tecnología.',
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

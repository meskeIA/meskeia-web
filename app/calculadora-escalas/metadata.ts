import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

/**
 * 🌎 Lenguaje Latam-friendly: el vocabulario de esta app —escala, plano, maqueta, plantilla,
 * dibujo técnico— se dice igual a los dos lados del Atlántico, así que no hay pares que
 * duplicar. Los ejemplos son medidas y unidades del sistema métrico, universales, y no se
 * nombra ninguna ciudad ni ningún país en los enunciados.
 */

export const metadata: Metadata = {
  title: 'Calculadora de Escalas 1:50, 1:100 y Maquetas - Planos - meskeIA',
  description:
    'Convierte medidas entre plano y realidad a cualquier escala: 1:50, 1:100, 1:87 H0 o la que necesites. Deduce la escala, cambia de escala e imprime una escala gráfica.',
  keywords:
    'calculadora de escalas, conversor de escalas, escala 1:50, escala 1:100, escala de plano, escala gráfica, escala 1:87, escalas de maquetas, dibujo técnico, pasar de plano a realidad, escala 1:20, escala 1:25',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Escalas 1:50, 1:100 y Maquetas',
    description:
      'Del plano a la realidad y al revés, a cualquier escala. Deduce la escala de un plano, cámbiala y crea una escala gráfica para imprimir.',
    url: 'https://meskeia.com/calculadora-escalas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    // Next NO hereda la imagen del layout raíz: el merge de metadata es *shallow*, así que
    // declarar `openGraph` aquí reemplaza entero el del padre. Sin esta línea la tarjeta se
    // degrada a la pequeña con icono de documento. Lo vigila `npm run check:og-image`.
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Calculadora de Escalas - meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Escalas 1:50, 1:100 y Maquetas',
    description:
      'Del plano a la realidad y al revés, a cualquier escala, con escala gráfica imprimible.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Escalas meskeIA',
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Calculadora de Escalas',
  description:
    'Calculadora de escalas para planos, mapas y maquetas. Convierte medidas del dibujo a la realidad y al revés en cualquier escala, deduce la escala a partir de dos medidas, calcula el factor para redibujar a otra escala, convierte superficies (que escalan con el cuadrado) y genera una escala gráfica para imprimir. Incluye 12 casos numerados para clase.',
  url: 'https://meskeia.com/calculadora-escalas/',
  category: 'EducationalApplication',
  features: [
    'Conversión en los dos sentidos: del plano a la realidad y de la realidad al plano',
    'Deduce la escala a partir de una medida del dibujo y su medida real',
    'Factor para redibujar un plano de una escala a otra',
    'Conversión de superficies, que escalan con el cuadrado del factor',
    'Escala gráfica imprimible para medir sobre el plano sin calcular',
    'Conversión de una lista entera de medidas de una vez',
    '25 escalas normalizadas de dibujo, cartografía y modelismo, incluida 1:87 H0',
    '12 casos numerados asignables en clase, con solución paso a paso',
  ],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/calculadora-escalas/',
  mainEntity: [
    {
      question: '¿Qué significa la escala 1:50 de un plano?',
      answer:
        'Significa que el dibujo es 50 veces más pequeño que la realidad: 1 centímetro sobre el papel equivale a 50 centímetros reales, es decir, medio metro. Para pasar del plano a la realidad se multiplica por 50, y de la realidad al plano se divide entre 50. Es la escala más habitual en la planta de una vivienda.',
    },
    {
      question: '¿Cómo se calcula la escala de un plano si no viene indicada?',
      answer:
        'Se mide sobre el dibujo un elemento del que se conozca la medida real y se dividen las dos cantidades expresadas en la misma unidad. Si una distancia de 3 cm en el papel corresponde a 6 metros reales, se pasan los 6 metros a 600 centímetros y la razón 3:600 se simplifica a 1:200. Esa es la escala del plano.',
    },
    {
      question: '¿Por qué una superficie no se convierte con el mismo número que una longitud?',
      answer:
        'Porque el área depende de dos dimensiones, así que escala con el cuadrado del factor. En un plano 1:50 las longitudes se dividen entre 50, pero las superficies entre 2.500, que es 50 al cuadrado. Un salón que ocupa 24 cm² sobre el papel mide 6 m² reales, no 0,48 m². Es el error más repetido del tema porque el resultado equivocado también parece plausible.',
    },
    {
      question: '¿Qué escala es la 1:87 y por qué es un número tan raro?',
      answer:
        'Es la escala H0, la más extendida en modelismo ferroviario. El número viene de que el ancho de vía H0 se definió como la mitad del de la escala 1, que es 1:43,5, y la mitad de 43,5 es 87. Un vagón real de 26,1 metros mide 30 centímetros en H0.',
    },
    {
      question: '¿Cómo se pasa un plano de una escala a otra?',
      answer:
        'Se dividen los dos factores entre sí, sin que intervenga ninguna medida real. Para redibujar un plano de 1:200 a 1:50 se calcula 200 dividido entre 50, que da 4: todas las medidas del dibujo se multiplican por 4. Si el resultado es menor que 1 el dibujo nuevo es más pequeño que el original.',
    },
    {
      question: '¿Para qué sirve una escala gráfica y cómo se usa?',
      answer:
        'Es una regla dibujada junto al plano que permite medir distancias reales directamente, sin calcular nada: se apoya la medida tomada del plano sobre la barra y se lee la cifra. Tiene una ventaja sobre la escala numérica y es que sigue siendo válida aunque el plano se amplíe o se reduzca al fotocopiarlo, porque la barra cambia de tamaño con él. Al imprimirla hay que hacerlo al 100 %, sin ajustar a la página.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);

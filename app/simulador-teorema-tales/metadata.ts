import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// Lenguaje Latam-friendly: la keyword núcleo («teorema de Tales», «semejanza de
// triángulos») es universal y no cambia de un país a otro, así que el H1 y el
// título van sin descriptor de audiencia. Los términos de nivel educativo
// —secundaria, preparatoria, educación media— van de forma ADITIVA en la
// descripción y las keywords, nunca «4º de ESO», «bachillerato» ni «selectividad».

export const metadata: Metadata = {
  title: 'Teorema de Tales y Semejanza de Triángulos - Simulador Interactivo | meskeIA',
  description:
    'Simulador del teorema de Tales y la semejanza: proporciones entre paralelas, razón k, área por k², altura por sombras y escalas de planos, con 12 casos numerados.',
  keywords:
    'teorema de tales, semejanza de triángulos, razón de semejanza, cuarto proporcional, segmentos proporcionales, criterios de semejanza AA LAL LLL, altura por sombras, escala de planos, escala de mapas, área y razón de semejanza, ejercicios resueltos de tales, geometría secundaria, matemáticas preparatoria, educación media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Teorema de Tales y Semejanza de Triángulos - Simulador Interactivo',
    description:
      'Mueve las paralelas y comprueba la proporción, ajusta la razón de semejanza y descubre por qué el área se multiplica por k². 12 casos numerados con solución paso a paso.',
    url: 'https://meskeia.com/simulador-teorema-tales',
    siteName: 'meskeIA',
    locale: 'es_ES',
    // OBLIGATORIO. Next NO hereda la imagen del layout raíz: el merge de metadata es
    // *shallow*, así que declarar `openGraph` aquí reemplaza entero el del padre.
    // ⚠️ Si esta app se registra en `STEMUM_APPS` (data/stemum.ts), las DOS imágenes
    // —openGraph y twitter— deben pasar a 'https://meskeia.com/stemum/og-image.png',
    // o `npm run check:og-image` rompe el build.
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Simulador del teorema de Tales y la semejanza de triángulos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teorema de Tales y Semejanza de Triángulos',
    description:
      'Paralelas y secantes, razón de semejanza, altura por sombras y escalas de planos. Con 12 casos numerados y solución paso a paso.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Simulador del Teorema de Tales meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Teorema de Tales y la Semejanza',
  description:
    'Simulador interactivo para trabajar el teorema de Tales y la semejanza de figuras: mover tres rectas paralelas cortadas por dos secantes y comprobar la proporción entre segmentos, ajustar la razón de semejanza k para ver qué ocurre con lados, ángulos, perímetro y área, calcular alturas por el método de las sombras y resolver escalas de planos y mapas. Incluye 12 casos numerados idénticos para toda la clase y un generador de ejercicios nuevos.',
  url: 'https://meskeia.com/simulador-teorema-tales/',
  category: 'EducationalApplication',
  features: [
    'Tres rectas paralelas cortadas por dos secantes, con las paralelas y la inclinación ajustables',
    'Cálculo del cuarto proporcional con el desarrollo paso a paso',
    'Razón de semejanza k entre 0,25 y 3 con el efecto sobre lados, ángulos, perímetro y área',
    'Demostración numérica de que el área se multiplica por k² y no por k',
    'Cálculo de alturas por el método de las sombras, con figura interactiva',
    'Conversión entre medidas del plano y medidas reales para escalas 1:50, 1:200 o 1:25.000',
    '12 casos numerados fijos, iguales para todo el grupo, con comprobación y solución razonada',
    'Generador de ejercicios nuevos con semilla reproducible',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué dice el teorema de Tales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El teorema de Tales afirma que, si varias rectas paralelas cortan a dos rectas secantes, los segmentos que determinan sobre una de ellas son proporcionales a los que determinan sobre la otra. Es decir, si en la primera secante los segmentos miden a y b, y en la segunda miden a′ y b′, se cumple a/b = a′/b′. La condición imprescindible es que las rectas sean realmente paralelas: si se cruzan, aunque sea con un ángulo mínimo, la proporción deja de cumplirse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué al ampliar una figura el área se multiplica por k² y no por k?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque un área es el producto de dos longitudes, y la semejanza multiplica las dos por la razón k a la vez. Si un rectángulo de 3 × 4 (área 12) se amplía con k = 2, pasa a medir 6 × 8, y su área es 48, que es 12 × 2² = 12 × 4. El perímetro, en cambio, sí se multiplica por k, porque es una suma de longitudes y no un producto. En volúmenes ocurre lo mismo un grado más arriba: se multiplican por k³.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la altura de un árbol o un edificio con su sombra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se clava una vara de altura conocida y se miden dos sombras a la misma hora: la de la vara y la del objeto. Como los rayos del Sol llegan casi paralelos, ambos forman triángulos rectángulos semejantes, así que la altura del objeto es igual a la altura de la vara multiplicada por la sombra del objeto y dividida entre la sombra de la vara. Con una vara de 1,5 m que da 2 m de sombra y un árbol que da 9,2 m, la altura es 1,5 × 9,2 / 2 = 6,9 m. Es el método que la tradición atribuye a Tales ante la pirámide.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la escala 1:50 de un plano y cómo se pasa a medidas reales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala 1:50 significa que una unidad medida sobre el plano equivale a 50 unidades en la realidad, con las dos medidas en la misma unidad. Para pasar del plano a la realidad se multiplica por el denominador: 7,4 cm en el plano son 7,4 × 50 = 370 cm, es decir 3,7 m. Para el camino inverso se divide: un mueble real de 4,5 m se dibuja en un plano 1:200 como 450 / 200 = 2,25 cm. En mapas los denominadores son mucho mayores, y 1:25.000 convierte cada centímetro del mapa en 250 metros de terreno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los criterios de semejanza de triángulos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son tres. AA: si dos triángulos tienen dos ángulos iguales, son semejantes, porque el tercero queda determinado al sumar 180°. LAL: si dos lados son proporcionales y el ángulo comprendido entre ellos es igual, también lo son. LLL: si los tres pares de lados son proporcionales, los triángulos son semejantes. Basta con que se cumpla uno de los tres para afirmar la semejanza, y de ahí se deduce que los ángulos coinciden y que todos los lados guardan la misma razón k.',
      },
    },
  ],
};

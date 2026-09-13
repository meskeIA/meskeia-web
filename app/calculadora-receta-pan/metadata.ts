import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

// Los tipos de pan van con su nombre de España Y de Latinoamérica en la misma línea (pan de
// molde / pan de caja / pan lactal), porque son el mismo pan y quien lo busca teclea el suyo.
// Las banderas del clúster lo respaldan: en 90 días, México, Argentina, Uruguay y Venezuela
// sumaban más visitas que España en /calculadora-masa-madre/.

export const metadata: Metadata = {
  title: 'Calculadora de pan casero: ingredientes por gramos de harina - meskeIA',
  description:
    'Dinos cuánta harina vas a pesar, qué pan quieres y si usas levadura o masa madre, y te damos los gramos de agua, sal y fermento. Con espelta, integral, centeno y trigo.',
  keywords:
    'calculadora de pan, calculadora pan casero, cuanta levadura para 500 gramos de harina, cuantos gramos de masa madre por kilo de harina, receta de pan casero gramos, calculadora panadera, pan de espelta proporciones, pan integral cuanta agua, hacer pan en casa medidas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de pan casero: los gramos de cada ingrediente',
    description:
      'Eliges harina, tipo de pan y fermento, y sale la lista con los gramos exactos. Levadura o masa madre, trigo, espelta, integral o centeno.',
    url: 'https://meskeia.com/calculadora-receta-pan',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/coquinum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de pan casero',
    description: 'Los gramos de cada ingrediente a partir de la harina que vas a pesar.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de pan casero meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/calculadora-receta-pan/' },
};

const webAppSchema = generateWebAppSchema({
  name: 'Calculadora de pan casero',
  description:
    'Calcula los gramos de agua, sal, levadura o masa madre de una receta de pan a partir de la harina que vas a pesar, el tipo de pan que quieres (molde, barra, hogaza, chapata, focaccia, bollos o pan dulce), el tipo de harina (trigo, fuerza, integral, espelta, centeno o sémola) y el tiempo del que dispones. Corrige la hidratación según la harina y descuenta el agua que aportan la leche, el huevo, la miel y la masa madre.',
  url: 'https://meskeia.com/calculadora-receta-pan/',
  category: 'UtilityApplication',
  features: [
    'Partes de los gramos de harina que vas a pesar, no de una fórmula que ya sepas',
    'Siete tipos de pan con sus nombres de España y Latinoamérica',
    'Siete harinas con corrección automática de la hidratación y aviso de proporción máxima',
    'Levadura seca, levadura fresca o masa madre, con la dosis ajustada al tiempo disponible',
    'Ingredientes adicionales que sí corrigen la fórmula: miel, leche, huevo, semillas o frutos secos',
    'Fórmula en porcentaje del panadero junto a los gramos',
    'Funciona 100 % en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y en español',
  ],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/calculadora-receta-pan/',
  mainEntity: [
    {
      question: '¿Cuánta levadura hace falta para 500 gramos de harina?',
      answer:
        'Depende del tiempo que vayas a dejar fermentar, no del peso solo. Para un pan de tarde (4-6 horas a 24 °C) son unos 3,5 g de levadura seca o 10,5 g de fresca. Si quieres pan en 2-3 horas, sube a 6 g de seca; si lo dejas toda la noche en la nevera, baja a 1 g. Menos levadura y más tiempo dan más sabor: la prisa se paga en gusto.',
    },
    {
      question: '¿Cuántos gramos de masa madre por kilo de harina?',
      answer:
        'Entre 20 y 250 g según el tiempo disponible, porque lo que gobierna la fermentación no son los gramos de masa madre sino la harina que lleva dentro. Para una fermentación de tarde con masa madre al 100 % de hidratación, unos 150 g por kilo. Esa masa madre aporta harina y agua a la receta, y hay que descontarlas del resto o la hidratación se dispara.',
    },
    {
      question: '¿Se puede hacer pan solo con harina de espelta?',
      answer:
        'Se puede, pero sube menos. La espelta absorbe unos cuatro puntos menos de agua que el trigo y su gluten es más frágil, así que se amasa poco, se vigila la fermentación de cerca y no se espera el mismo volumen. Por encima del 70 % de espelta conviene aceptar un pan más plano; mezclada al 50 % con harina panificable da un pan con su sabor y con estructura.',
    },
    {
      question: '¿Cuánta agua lleva el pan por cada kilo de harina?',
      answer:
        'Entre 550 y 800 g según el pan: un pan de molde va al 62 %, una barra al 66 %, una hogaza rústica al 72 % y una chapata al 78 %. La harina corrige esa cifra: la integral pide unos 6 puntos más y el centeno hasta 8, porque absorben más; la espelta, 4 menos. Por encima del 75 % la masa se pega y se trabaja con plegados en el bol, no sobre la mesa.',
    },
    {
      question: '¿Qué diferencia hay entre esta calculadora y la del porcentaje del panadero?',
      answer:
        'El punto de partida. El porcentaje del panadero sirve para normalizar o escalar una fórmula que ya tienes, y por eso te pide los ingredientes. Esta parte de que no tienes ninguna fórmula: dices cuánta harina vas a pesar, qué pan quieres y con qué fermento, y la fórmula sale de ahí. Cuando la tengas, puedes llevarla a la otra para afinarla.',
    },
    {
      question: '¿Qué pasa si le añado miel, frutos secos o semillas?',
      answer:
        'Cada familia se comporta distinto. Los frutos secos y el chocolate se suman al peso y no tocan la fórmula, aunque por encima del 30 % cortan la miga. Las semillas y las pasas hay que remojarlas aparte, con agua que no cuenta como hidratación: si no, se la roban a la masa y el pan sale seco. La miel, la leche, el huevo o los purés sí traen agua dentro y esa cantidad se descuenta del agua de la receta.',
    },
    {
      question: '¿Por qué la sal es siempre alrededor del 2 %?',
      answer:
        'Porque es el punto en el que sazona sin frenar la fermentación. Por debajo del 1,5 % el pan sabe soso y la masa queda floja; por encima del 2,5 % la sal deshidrata la levadura y el levado se alarga notablemente. Sobre un kilo de harina, ese 2 % son 20 g de sal, que es bastante más de lo que la gente calcula a ojo.',
    },
    {
      question: '¿La levadura fresca y la seca se usan en la misma cantidad?',
      answer:
        'No: hace falta el triple de fresca que de seca. Si una receta pide 7 g de levadura seca, son 21 g de fresca, y al revés, 20 g de fresca equivalen a unos 7 g de seca. La fresca se desmenuza en el líquido y la seca se mezcla directamente con la harina. La instantánea se usa en la misma proporción que la seca.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);

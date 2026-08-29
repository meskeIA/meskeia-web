import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz: Mitos y Realidades de la Ciencia - meskeIA',
  description: '25 afirmaciones científicas: ¿verdad o mito? Descubre si el cerebro se usa al 10%, si la sangre venosa es azul, si los rayos no caen dos veces... con explicación rigurosa en cada respuesta.',
  keywords: 'mitos ciencia, quiz ciencia verdad o mentira, mitos populares ciencia, curiosidades científicas, datos científicos falsos, test conocimiento científico',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Verdad o Mito? Quiz de Ciencia — 25 afirmaciones para poner a prueba lo que crees saber',
    description: 'La sangre venosa es azul. Los rayos nunca caen dos veces en el mismo lugar. Leer con poca luz daña la vista. ¿Cuántos de estos mitos te han engañado?',
    url: 'https://meskeia.com/quiz-mitos-ciencia/',
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
    title: '¿Verdad o Mito? Quiz de Ciencia — 25 afirmaciones',
    description: 'Pon a prueba lo que crees saber sobre ciencia. 25 afirmaciones con explicación rigurosa en cada respuesta.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Quiz Mitos y Realidades de la Ciencia - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Quiz: Mitos y Realidades de la Ciencia',
  description: 'Quiz interactivo de 25 afirmaciones científicas en formato Verdad o Mito. Cubre cuerpo humano, animales, física, historia y biología. Cada respuesta incluye una explicación rigurosa con el dato científico real. Ideal para curiosos, estudiantes y cualquiera que quiera separar la ciencia del mito popular.',
  url: 'https://meskeia.com/quiz-mitos-ciencia/',
  category: 'EducationalApplication',
  features: [
    '25 afirmaciones en formato Verdad o Mito con explicación científica detallada',
    '5 categorías: Cuerpo Humano, Animales, Física y Cosmos, Historia y Biología',
    'Puntuación final con nivel: Científico, Investigador, Curioso, Aprendiz',
    'Desglose de aciertos por categoría al finalizar',
    'Explicaciones rigurosas basadas en estudios y consenso científico',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Es verdad que los humanos usamos solo el 10% del cerebro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, es un mito completamente falso. Las técnicas de neuroimagen muestran que prácticamente todas las regiones cerebrales tienen actividad a lo largo del día. El cerebro consume el 20% de toda la energía del cuerpo pese a representar solo el 2% del peso corporal: un órgano tan costoso metabólicamente no podría haber evolucionado dejando el 90% sin usar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La sangre venosa es realmente de color azul?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La sangre siempre es roja, tanto arterial como venosa. La sangre venosa es rojo oscuro (burdeos), no azul. Las venas parecen azuladas a través de la piel porque el tejido subcutáneo absorbe la luz roja y refleja más la azul, creando esa ilusión óptica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas preguntas tiene el quiz de mitos científicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz tiene 25 afirmaciones en formato Verdad o Mito, organizadas en 5 categorías: Cuerpo Humano (7), Animales (8), Física y Cosmos (4), Historia (2) y Biología (4). Al finalizar recibes tu puntuación total, un nivel (Científico/Investigador/Curioso/Aprendiz/Principiante) y el desglose de aciertos por categoría.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es verdad que los peces tienen solo 3 segundos de memoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, es un mito. Los peces tienen memoria que dura semanas, meses e incluso años según la especie. Experimentos con carpas y peces koi demuestran que recuerdan rutas de alimentación durante meses, y los peces de acuario reconocen a sus cuidadores y aprenden comportamientos condicionados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El azúcar causa realmente hiperactividad en los niños?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Más de una docena de estudios controlados con doble ciego, incluyendo metaanálisis publicados en JAMA, han demostrado de forma consistente que el azúcar no causa hiperactividad. El efecto es puramente psicológico: los padres que creen que sus hijos consumieron azúcar los perciben como más activos aunque en realidad tomaron un placebo.',
      },
    },
  ],
};

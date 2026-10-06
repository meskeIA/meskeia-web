import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Condensadores: Capacidad, Dieléctrico y Circuito RC | meskeIA',
  description: 'Calcula la capacidad de un condensador (capacitor) de placas paralelas con dieléctrico, su carga, campo eléctrico y energía, y simula la carga y descarga de un circuito RC con su constante de tiempo τ = R·C.',
  keywords: 'condensador, capacitor, capacidad, capacitancia, dieléctrico, constante dieléctrica, circuito RC, constante de tiempo, carga y descarga, placas paralelas, simulador, física, secundaria, preparatoria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-condensadores/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Condensadores y Circuito RC | meskeIA',
    description: 'Capacidad, carga, campo y energía de un condensador de placas paralelas, el efecto del dieléctrico y la curva de carga y descarga RC.',
    url: 'https://meskeia.com/simulador-condensadores/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Condensadores | meskeIA',
    description: 'Condensador (capacitor) de placas paralelas, dieléctrico y circuito RC interactivo',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Condensadores: capacidad, dieléctrico y circuito RC',
  description: 'Simulador de un condensador (capacitor) de placas planas y paralelas: calcula la capacidad C = ε₀·εr·A/d, la carga, el campo eléctrico y la energía almacenada, muestra qué cambia al introducir un dieléctrico con la batería conectada o desconectada, y dibuja la carga y descarga de un circuito RC con su constante de tiempo.',
  url: 'https://meskeia.com/simulador-condensadores/',
  category: 'EducationalApplication',
  features: [
    'Capacidad, carga, campo eléctrico y energía de un condensador de placas paralelas',
    'Dieléctricos predefinidos (vacío, aire, teflón, papel, vidrio Pyrex, agua) o constante εr a medida',
    'Dibujo de las placas con separación proporcional, cargas y líneas de campo',
    'Comparativa al introducir el dieléctrico con la batería conectada o desconectada',
    'Gráfica de carga y descarga RC con el eje de tiempo en múltiplos de τ',
    'Tensión, corriente y porcentaje de carga en cualquier instante entre 0 y 5τ',
    'Cifras con prefijo del SI (pF, nF, µF) y en formato español',
  ],
  keywords: ['condensador', 'capacitor', 'capacidad', 'dieléctrico', 'circuito RC', 'constante de tiempo', 'simulador de física'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la capacidad de un condensador de placas paralelas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con C = ε₀·εr·A/d, donde ε₀ = 8,854·10⁻¹² F/m es la permitividad del vacío, εr la constante dieléctrica del material entre las placas, A el área de cada placa en m² y d la separación en metros. Por ejemplo, dos placas de 100 cm² (0,01 m²) separadas 1 mm en vacío tienen C = 88,54 pF. Duplicar el área duplica la capacidad; duplicar la separación la reduce a la mitad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Condensador y capacitor son lo mismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. «Condensador» es el término habitual en España y «capacitor» el más usado en buena parte de Latinoamérica y en inglés; nombran el mismo componente, dos conductores separados por un aislante que almacenan carga. De forma parecida, la magnitud se llama capacidad o capacitancia, y se mide en faradios (F).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa al introducir un dieléctrico con la batería conectada o desconectada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En los dos casos la capacidad se multiplica por εr. Con la batería conectada la tensión se mantiene, así que la carga y la energía también se multiplican por εr. Con la batería desconectada la carga no puede cambiar, de modo que la tensión, el campo y la energía se dividen por εr: con papel (εr = 3,7), 12 V bajan a 3,24 V.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la constante de tiempo τ de un circuito RC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es el producto τ = R·C, en segundos, y marca el ritmo de la carga y la descarga. Al cabo de un τ el condensador alcanza el 63,2 % de la tensión final al cargarse, o baja al 36,8 % al descargarse. Con R = 1 MΩ y C = 1 µF, τ = 1 s.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda en cargarse del todo un condensador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En teoría nunca llega al 100 %, porque la carga sigue V·(1 − e^(−t/τ)), que solo se acerca a V. En la práctica se toma 5τ como «cargado»: ahí está al 99,3 %. Por eso es un error frecuente pensar que en un τ ya está lleno, cuando solo va por el 63,2 %.',
      },
    },
  ],
};

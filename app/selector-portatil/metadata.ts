import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { RAM_MINIMA_GB, RAM_RECOMENDADA_GB, RAM_EXIGENTE_GB } from './motor';

/**
 * Lo que la app promete aquí es lo que el motor puede dar (hallazgos 1409, 1410 y 1412): formato
 * portátil, sobremesa o mini PC (el 2 en 1 no es un resultado, sino un consejo); Windows, macOS,
 * Linux o ChromeOS; y características técnicas que buscar, no modelos ni marcas. Nada anclado a un
 * año ya cerrado (1413).
 */
const FEATURES = [
  'Test de 10 preguntas sobre uso, movilidad, software y presupuesto',
  'Recomendación de formato: portátil, sobremesa o mini PC',
  'Recomendación de sistema operativo: Windows, macOS, Linux o ChromeOS',
  'Gama de rendimiento acotada al presupuesto declarado',
  'Características técnicas que buscar (procesador, memoria, almacenamiento, pantalla), sin marcas ni modelos',
  'Razones sacadas de tus respuestas y consejos de compra',
  '100% en el navegador, sin registro ni instalación',
];

const DESCRIPCION =
  'Test de 10 preguntas para saber qué computadora te conviene: portátil (laptop o notebook), sobremesa o mini PC, Windows, Mac, Linux o ChromeOS, gama de rendimiento según tu presupuesto y las características técnicas que buscar.';

export const metadata: Metadata = {
  title: 'Selector de Portátil, Laptop o Notebook — ¿Cuál me conviene? | meskeIA',
  description: DESCRIPCION,
  keywords: [
    'qué portátil comprar',
    'qué laptop comprar',
    'mejor notebook',
    'selector portátil',
    'Windows o Mac',
    'qué ordenador comprar',
    'qué computadora comprar',
    'portátil para trabajo',
    'laptop gaming',
    'portátil gaming',
    'Mac o PC',
    'cuál es el mejor portátil para mí',
    'qué computadora portátil comprar',
    'ordenador para diseño',
  ],
  openGraph: {
    title: '¿Qué portátil, laptop o notebook te conviene? Test en 10 preguntas | meskeIA',
    description:
      'Descubre la computadora ideal para tu perfil: portátil (laptop/notebook), sobremesa o mini PC, sistema operativo, gama y las características técnicas que buscar. Sin marcas ni modelos.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-portatil/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Windows, Mac o Linux? Test para elegir portátil o laptop | meskeIA',
    description:
      'Test de 10 preguntas para encontrar tu portátil (laptop o notebook) o PC ideal según uso, presupuesto y prioridades.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-portatil/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Portátil, Laptop o Notebook',
        description:
          'Test orientativo de 10 preguntas para descubrir qué computadora (portátil —laptop o notebook—, sobremesa o mini PC; Windows, Mac, Linux o ChromeOS; y gama de rendimiento) se adapta mejor a tu uso, presupuesto y prioridades, con las características técnicas que buscar.',
        url: 'https://meskeia.com/selector-portatil/',
        features: [...FEATURES, 'Gratuito y sin publicidad'],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Portátil, Laptop o Notebook",
  description: DESCRIPCION,
  url: "https://meskeia.com/selector-portatil/",
  category: 'UtilityApplication',
  features: FEATURES,
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sé si necesito un portátil o un ordenador de sobremesa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El portátil (también llamado laptop o notebook en Latinoamérica) es la opción más práctica si te mueves frecuentemente entre casa, la oficina u otros lugares. Si trabajas siempre en el mismo sitio y priorizas el rendimiento por el precio, un sobremesa ofrece más potencia por el mismo presupuesto; y si tu uso no pide una gráfica dedicada, un mini PC da lo mismo en mucho menos espacio. Los 2 en 1 (convertibles) son portátiles con pantalla táctil para quienes toman notas a mano o dibujan con lápiz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre Windows, Mac y Linux para uso cotidiano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Windows es el sistema más extendido, compatible con la mayoría de software empresarial y juegos. macOS es habitual en diseño y edición de vídeo, y está integrado con el ecosistema Apple; no hay ningún Mac nuevo por debajo de 600 € a precio general. Linux es gratuito, muy personalizable y habitual en programación y servidores, aunque tiene menos compatibilidad con software comercial. Para uso general o de oficina, Windows cubre prácticamente todos los casos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué procesador es suficiente para trabajar con documentos y videoconferencias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Para tareas ofimáticas, navegación web y videoconferencias es suficiente un procesador de gama media (serie 5) de una generación reciente, o el chip de gama base de Apple. Lo más importante es acompañarlo de al menos ${RAM_MINIMA_GB} GB de RAM (mejor ${RAM_RECOMENDADA_GB} GB) y un almacenamiento SSD para que el sistema responda con fluidez.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta RAM necesito en un ordenador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${RAM_MINIMA_GB} GB de RAM es el mínimo razonable para uso cotidiano. ${RAM_RECOMENDADA_GB} GB es lo recomendable si tienes muchas pestañas abiertas o usas aplicaciones de edición o desarrollo. ${RAM_EXIGENTE_GB} GB o más solo tiene sentido para edición de vídeo profesional, modelado 3D o máquinas virtuales. En portátiles con RAM soldada (como los Mac o muchos ultraligeros), elegir bien desde el inicio es crucial porque no se puede ampliar después.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de usuario está pensado un portátil gaming?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los portátiles gaming incorporan una tarjeta gráfica dedicada (GPU) que los hace adecuados no solo para jugar, sino también para edición de vídeo, renderizado 3D y ciertas tareas de inteligencia artificial. Su inconveniente es el peso, la menor autonomía y el precio más elevado respecto a portátiles sin GPU dedicada. Si no juegas ni editas vídeo, no merece la pena su sobrecoste.',
      },
    },
  ],
};

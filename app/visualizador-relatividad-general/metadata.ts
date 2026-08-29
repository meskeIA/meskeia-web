import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Relatividad General: La Curvatura del Espacio-Tiempo | meskeIA',
  description: 'La gravedad no es una fuerza — es curvatura del espacio-tiempo. Malla SVG interactiva, geodésicas, lentes gravitacionales, agujeros negros, ondas LIGO y corrección GPS.',
  keywords: [
    'relatividad general Einstein',
    'curvatura espacio tiempo',
    'agujeros negros horizonte sucesos',
    'ondas gravitacionales LIGO',
    'lentes gravitacionales',
    'GPS relatividad corrección',
    'geodésicas gravedad',
    'Schwarzschild radio',
  ],
  openGraph: {
    title: 'Relatividad General: La Curvatura del Espacio-Tiempo',
    description: 'La gravedad no es una fuerza: es la curvatura del espacio-tiempo. Visualiza la malla del universo deformada por una masa.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Relatividad General: La Curvatura del Espacio-Tiempo',
    description: 'La gravedad no es una fuerza: es la curvatura del espacio-tiempo. Visualiza la malla del universo deformada por una masa.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Relatividad General: Curvatura del Espacio-Tiempo",
  description: "La gravedad no es una fuerza — es curvatura del espacio-tiempo. Malla SVG interactiva, geodésicas, lentes gravitacionales, agujeros negros, ondas LIGO y corrección GPS.",
  url: "https://meskeia.com/visualizador-relatividad-general/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué dice la relatividad general de Einstein sobre la gravedad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La relatividad general, publicada por Einstein en 1915, redefine la gravedad: no es una fuerza a distancia como describía Newton, sino la curvatura del espacio-tiempo causada por la masa y la energía. Los objetos se mueven siguiendo geodésicas, las trayectorias más rectas posibles en ese espacio-tiempo curvado, lo que desde la perspectiva ordinaria parece una atracción gravitatoria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el radio de Schwarzschild y qué tiene que ver con los agujeros negros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El radio de Schwarzschild es el umbral crítico al que hay que comprimir una masa para que la curvatura del espacio-tiempo sea tan extrema que ni la luz pueda escapar: ese límite es el horizonte de sucesos de un agujero negro. Para el Sol equivale a unos 3 km; para la Tierra, a unos 9 mm. La fórmula es r_s = 2GM/c², donde G es la constante gravitacional, M la masa y c la velocidad de la luz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el GPS necesita corregir efectos relativistas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los satélites GPS orbitan a unos 20.200 km de altitud, donde la gravedad es menor y el tiempo transcurre ligeramente más rápido que en la superficie (relatividad general: +45,9 µs/día). A la vez, su velocidad orbital los hace ir más lentos respecto al observador en tierra (relatividad especial: −7,2 µs/día). El efecto neto es +38,4 µs/día, suficiente para acumular un error de posición de ~10 km al día si no se corrige en el software del sistema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las ondas gravitacionales y cómo se detectan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las ondas gravitacionales son perturbaciones en el espacio-tiempo, predichas por Einstein en 1916 y detectadas por primera vez en 2015 por los interferómetros LIGO (EE. UU.) y más tarde por Virgo (Italia). Son generadas por eventos catastróficos como la fusión de agujeros negros o estrellas de neutrones. LIGO detecta variaciones en la longitud de sus brazos de 4 km inferiores a 10⁻¹⁸ m, una fracción del diámetro de un protón.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una lente gravitacional y para qué sirve en astronomía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una lente gravitacional ocurre cuando una masa masiva (galaxia, cúmulo) curva la luz de un objeto situado detrás, distorsionando o amplificando su imagen. Eddington confirmó este efecto ya en 1919 durante un eclipse solar, verificando la relatividad general. Hoy las lentes gravitacionales son una herramienta clave en astronomía: permiten estudiar galaxias muy lejanas amplificadas por cúmulos intermedios y mapear la distribución de materia oscura.',
      },
    },
  ],
};

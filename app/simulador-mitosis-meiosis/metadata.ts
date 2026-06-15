import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Mitosis y Meiosis - División Celular Interactiva | meskeIA',
  description:
    'Simulador visual animado de mitosis (6 fases) y meiosis (8 fases). Observa cómo se dividen las células con cromosomas, huso acromático y crossing-over. Ideal para Bachillerato y biología universitaria.',
  keywords:
    'mitosis, meiosis, división celular, cromosomas, crossing-over, gametos, célula, fases mitosis, fases meiosis, EBAU, Bachillerato, biología, haploide, diploide',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-mitosis-meiosis/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Mitosis y Meiosis | meskeIA',
    description:
      'Visualiza las fases de mitosis y meiosis con animación interactiva: cromosomas, huso y crossing-over',
    url: 'https://meskeia.com/simulador-mitosis-meiosis/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Mitosis y Meiosis | meskeIA',
    description: 'Aprende la división celular con visualizaciones interactivas paso a paso',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Mitosis y Meiosis',
  description:
    'Simulador interactivo de división celular que muestra las 6 fases de la mitosis y las 8 fases de la meiosis. Visualiza cromosomas, huso acromático, crossing-over y formación de células hijas con canvas 2D animado.',
  url: 'https://meskeia.com/simulador-mitosis-meiosis/',
  category: 'EducationalApplication',
  features: [
    'Simulación animada de las 6 fases de la mitosis',
    'Simulación animada de las 8 fases de la meiosis',
    'Visualización de cromosomas, huso acromático y crossing-over',
    'Control de velocidad: lenta, media y rápida',
    'Navegación manual fase a fase o reproducción automática',
    'Contador de células resultado con ploidy (2n/n)',
    'Tabla comparativa mitosis vs meiosis: diferencias clave fase a fase',
    'Identificador de resultado con conteo de células hijas y ploidía (2n/n)',
  ],
  keywords: [
    'mitosis',
    'meiosis',
    'división celular',
    'cromosomas',
    'crossing-over',
    'biología bachillerato',
    'gametos',
    'célula',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre mitosis y meiosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mitosis produce dos células hijas idénticas a la célula madre, con el mismo número de cromosomas (2n), y sirve para el crecimiento y regeneración de tejidos. La meiosis, en cambio, produce cuatro células hijas con la mitad de cromosomas (n), llamadas gametos, y es exclusiva de la reproducción sexual. Además, la meiosis incluye el crossing-over, que genera variabilidad genética.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre en el crossing-over y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El crossing-over o sobrecruzamiento ocurre durante la profase I de la meiosis, cuando cromosomas homólogos intercambian segmentos de ADN en puntos llamados quiasmas. Este proceso mezcla material genético de ambos progenitores, generando nuevas combinaciones de alelos en los gametos. Es el principal mecanismo de variabilidad genética en los organismos de reproducción sexual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas fases tiene la mitosis y en qué consiste cada una?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mitosis tiene 6 etapas: interfase (duplicación del ADN), profase (condensación de cromosomas y formación del huso), metafase (alineación de cromosomas en el ecuador), anafase (separación de cromátidas hacia los polos), telofase (reconstitución de núcleos) y citocinesis (división del citoplasma). Al final se obtienen dos células hijas diploides (2n) genéticamente idénticas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve aprender mitosis y meiosis en el examen de acceso a la universidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La división celular es uno de los temas centrales de biología en los exámenes de acceso a la universidad (EBAU/Selectividad). Las preguntas suelen pedir identificar fases, explicar la formación de gametos, calcular el número de cromosomas resultantes o comparar ambos procesos. Dominar las diferencias entre mitosis y meiosis, y el papel del crossing-over, es fundamental para obtener buena puntuación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el huso acromático y qué función cumple en la división celular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El huso acromático es una estructura formada por microtúbulos proteicos que se ensambla durante la mitosis y la meiosis. Su función es capturar los cromosomas por sus centrómeros y arrastrarlos hacia los polos de la célula durante la anafase. Sin un huso funcional, los cromosomas no se distribuirían correctamente, provocando células con número anómalo de cromosomas (aneuploidía).',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Detector de Sesgos Cognitivos - ¿Qué sesgos afectan tus decisiones? | meskeIA',
  description: 'Descubre qué sesgos cognitivos pueden estar afectando tus decisiones. Test de 10 preguntas basado en Kahneman (Sistema 1 y 2). Evalúa automatismo y deliberación. Gratuito y sin registro.',
  keywords: 'sesgos cognitivos, Kahneman, Sistema 1 Sistema 2, pensamiento rápido lento, decisiones, heurísticas, sesgo confirmación, sesgo anclaje, pensamiento crítico, racionalidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Detector de Sesgos Cognitivos | meskeIA',
    description: '¿Qué sesgos afectan tus decisiones? Test basado en Kahneman (Sistema 1 y 2).',
    url: 'https://meskeia.com/detector-sesgos-cognitivos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Detector de Sesgos Cognitivos | meskeIA',
    description: '¿Decides bien o decides rápido? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Detector de Sesgos Cognitivos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Detector de Sesgos Cognitivos',
  description: 'Herramienta interactiva de reflexión para detectar sesgos cognitivos en tu proceso de decisión. Basado en el trabajo de Daniel Kahneman sobre Sistema 1 (rápido) y Sistema 2 (lento).',
  url: 'https://meskeia.com/detector-sesgos-cognitivos/',
  features: [
    'Test de 10 preguntas sobre automatismo y deliberación',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en Kahneman: Sistema 1 y Sistema 2',
    'Acciones concretas según tu resultado',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los sesgos cognitivos y cómo afectan mis decisiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los sesgos cognitivos son atajos mentales automáticos que el cerebro usa para procesar información con rapidez, pero que a veces producen juicios distorsionados o erróneos. Ejemplos comunes son el sesgo de confirmación (buscar solo lo que confirma nuestra opinión), el sesgo de anclaje (dar demasiado peso al primer dato recibido) o el efecto halo (juzgar todo de alguien por una sola característica positiva). Identificarlos es el primer paso para tomar decisiones más razonadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste la diferencia entre Sistema 1 y Sistema 2 de Kahneman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Daniel Kahneman describió dos modos de pensamiento en su trabajo sobre heurísticas y sesgos: el Sistema 1 opera de forma rápida, automática e intuitiva; el Sistema 2 es lento, deliberado y analítico. Ambos son necesarios: el Sistema 1 permite responder con agilidad en situaciones rutinarias, mientras que el Sistema 2 es más adecuado para decisiones complejas o de alto impacto. Los problemas surgen cuando usamos el Sistema 1 donde se requiere el Sistema 2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona este test de sesgos cognitivos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test plantea 10 situaciones de la vida cotidiana y laboral donde los sesgos cognitivos aparecen con más frecuencia. Para cada situación eliges cómo tiendes a reaccionar. Al terminar, el análisis cruza tus respuestas en dos ejes (automatismo vs. deliberación) y te asigna un perfil de cuadrante con una descripción de tus patrones de pensamiento y acciones recomendadas para mejorar tu toma de decisiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil identificar los propios sesgos cognitivos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cualquier persona que tome decisiones relevantes se beneficia de conocer sus sesgos: managers, emprendedores, profesionales de la salud, inversores, docentes o simplemente quien quiera mejorar su pensamiento crítico. No se requiere formación en psicología; el test está diseñado para ser comprensible y útil sin terminología técnica, y las recomendaciones son aplicables de forma inmediata en el día a día.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo reducir mis sesgos cognitivos una vez identificados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Aunque eliminarlos por completo no es posible, conocerlos reduce su impacto. Las estrategias más eficaces incluyen ralentizar deliberadamente el proceso de decisión ante situaciones importantes, buscar activamente perspectivas contrarias a la propia, establecer criterios antes de evaluar opciones y pedir opinión a personas con perfiles distintos. El test ofrece recomendaciones concretas adaptadas al perfil obtenido.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona la Probabilidad - Explicador Visual | meskeIA',
  description: 'Visualiza por qué tu intuición falla con la probabilidad: dados, monedas, cumpleaños y la ley de los grandes números. Simulaciones interactivas.',
  keywords: 'probabilidad, ley grandes números, paradoja cumpleaños, dados, monedas, estadística, bachillerato, matemáticas, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona la Probabilidad',
    description: 'Tu intuición falla con la probabilidad. Visualízalo con simulaciones interactivas.',
    url: 'https://meskeia.com/visualizador-probabilidad/',
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
    title: 'Cómo Funciona la Probabilidad',
    description: 'Dados, monedas y la paradoja del cumpleaños. Probabilidad visual.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Probabilidad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona la Probabilidad',
  description: 'Explicador visual de probabilidad: la falacia del jugador, la ley de los grandes números, la paradoja del cumpleaños y por qué las rachas no significan lo que crees. Simulaciones interactivas.',
  url: 'https://meskeia.com/visualizador-probabilidad/',
  features: [
    'Simulación de lanzamiento de monedas con ley de grandes números',
    'La falacia del jugador explicada visualmente',
    'Paradoja del cumpleaños interactiva',
    'Probabilidad en dados con distribución visual',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la falacia del jugador y por qué la cometemos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La falacia del jugador es la creencia errónea de que un evento pasado influye en la probabilidad de un evento futuro independiente. Por ejemplo, creer que si una moneda ha salido cara 5 veces seguidas, es "más probable" que salga cruz a continuación. Cada lanzamiento es independiente y la probabilidad sigue siendo del 50%, independientemente del historial. La cometemos porque nuestro cerebro busca patrones incluso donde no los hay.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la paradoja del cumpleaños en probabilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La paradoja del cumpleaños establece que en un grupo de solo 23 personas, la probabilidad de que dos compartan la misma fecha de cumpleaños supera el 50%. Con 70 personas, esa probabilidad asciende al 99,9%. Resulta contraintuitivo porque tendemos a comparar cada persona con nosotros mismos, cuando en realidad hay que contar todos los pares posibles entre los asistentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice la ley de los grandes números sobre el azar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley de los grandes números establece que cuanto mayor sea el número de repeticiones de un experimento aleatorio, más se acercará el promedio de resultados a la probabilidad teórica. Por ejemplo, lanzando una moneda 10 veces es normal obtener 7 caras; lanzándola 10.000 veces la proporción se aproximará muy cerca al 50%. Esto explica por qué los casinos siempre ganan a largo plazo aunque haya jugadores con buenas rachas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué nuestra intuición falla con la probabilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nuestra intuición sobre probabilidad falla porque el cerebro usa atajos cognitivos (heurísticas) que funcionan bien en situaciones cotidianas pero no en contextos aleatorios. Tendemos a sobrestimar eventos memorables o recientes (heurística de disponibilidad), a buscar patrones en secuencias aleatorias y a confundir correlación con causalidad. La visualización interactiva permite observar estos sesgos directamente en simulaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este explicador de probabilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El explicador está diseñado para ser accesible desde secundaria y bachillerato, pero también resulta útil para cualquier adulto curioso sin formación matemática. Los conceptos se presentan de forma visual e interactiva, sin fórmulas complejas como punto de entrada. Para estudiantes universitarios de estadística, sirve como complemento visual a la teoría formal.',
      },
    },
  ],
};

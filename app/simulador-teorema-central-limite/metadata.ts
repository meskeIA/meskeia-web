import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Teorema Central del Límite | meskeIA',
  description: 'Visualiza cómo la media muestral converge a una normal sea cual sea la distribución original. Simulación Monte Carlo en directo con 5 distribuciones (uniforme, exponencial, Bernoulli, bimodal).',
  keywords: 'teorema central del límite, TCL, CLT, distribución muestral, media muestral, Monte Carlo, estadística inferencial, ley de los grandes números, intervalo de confianza, EBAU, Bachillerato, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-teorema-central-limite/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Teorema Central del Límite | meskeIA',
    description: 'Lanza muestras de cualquier distribución y mira la magia: la media muestral converge a una normal. Visualiza el TCL en directo.',
    url: 'https://meskeia.com/simulador-teorema-central-limite/',
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
    title: 'Simulador del Teorema Central del Límite | meskeIA',
    description: 'Visualiza el TCL: cómo la media muestral converge a una normal sea cual sea la distribución original.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Teorema Central del Límite',
  description: 'Simulador Monte Carlo del Teorema Central del Límite (TCL). Genera muestras de cinco distribuciones poblacionales muy distintas (uniforme, exponencial, Bernoulli, Bernoulli sesgada, bimodal) y observa cómo la distribución de la media muestral converge siempre a una normal de media μ y desviación σ/√n. Permite ajustar el tamaño muestral n y el número de muestras, comparar con la curva normal teórica y ver estadísticos empíricos en tiempo real.',
  url: 'https://meskeia.com/simulador-teorema-central-limite/',
  category: 'EducationalApplication',
  features: [
    'Simulación Monte Carlo en directo de la distribución de la media muestral',
    '5 distribuciones poblacionales (uniforme, exponencial, Bernoulli p=0.5, Bernoulli p=0.9, bimodal)',
    'Tamaño muestral n configurable (1, 2, 5, 10, 30, 100)',
    'Comparación con la N(μ, σ/√n) teórica superpuesta',
    'Estadísticos empíricos: media, desviación, asimetría y curtosis',
    'Visualiza la velocidad de convergencia según la asimetría original',
  ],
  keywords: ['teorema central del límite', 'TCL', 'CLT', 'Monte Carlo', 'estadística', 'distribución muestral', 'EBAU', 'Bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué dice el Teorema Central del Límite?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Teorema Central del Límite (TCL) establece que, si se toman muestras aleatorias de tamaño n suficientemente grande de cualquier distribución con media μ y varianza finita σ², la distribución de la media muestral se aproxima a una distribución normal de media μ y desviación típica σ/√n. Este resultado es fundamental porque permite aplicar la inferencia estadística a poblaciones que no son normales, siempre que el tamaño de muestra sea suficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A partir de qué tamaño de muestra se puede aplicar el TCL en la práctica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla práctica más extendida es n ≥ 30 para distribuciones moderadamente asimétricas. Para distribuciones muy asimétricas o con colas pesadas (como la exponencial o la Bernoulli muy sesgada) puede necesitarse n ≥ 100 o más para que la aproximación normal sea razonable. Para distribuciones simétricas como la uniforme, incluso n = 5-10 puede ser suficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el TCL es tan importante en estadística e inferencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El TCL justifica el uso de la distribución normal en el cálculo de intervalos de confianza, contrastes de hipótesis y prácticamente toda la estadística clásica, independientemente de la forma de la distribución original. Sin este resultado, habría que conocer exactamente la distribución de la población para hacer inferencias — algo que en la práctica casi nunca es posible. Es el fundamento teórico de gran parte del análisis estadístico aplicado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el TCL y la Ley de los Grandes Números?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Ley de los Grandes Números dice que la media muestral converge al valor esperado μ cuando n crece — es decir, que la estimación se vuelve más precisa. El TCL va más allá: no solo dice que la media se acerca a μ, sino que describe la forma exacta (normal) y la escala (σ/√n) de la distribución de esa aproximación. La LGN responde al "qué pasa", el TCL responde al "cómo y con qué forma ocurre".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la simulación Monte Carlo en este simulador del TCL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La simulación extrae repetidamente muestras aleatorias de la distribución elegida (uniforme, exponencial, Bernoulli, bimodal) con el tamaño n configurado, calcula la media de cada muestra y acumula esas medias en un histograma. Al ejecutar cientos o miles de repeticiones, el histograma converge visualmente a la curva normal teórica N(μ, σ/√n). Es el mismo principio de Monte Carlo que se usa en finanzas, física y ciencias de datos para aproximar distribuciones analíticamente complejas.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cinética Química - Velocidad de Reacciones y Arrhenius | meskeIA',
  description: 'Visualiza qué controla la velocidad de las reacciones químicas. Energía de activación, ecuación de Arrhenius, órdenes de reacción y catalizadores con gráficos SVG interactivos.',
  keywords: 'cinética química, energía de activación, ecuación de Arrhenius, órdenes de reacción, catalizadores, vida media reacción, perfil de energía, estado de transición, velocidad reacción, Haber-Bosch',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cinética Química - Energía de Activación, Arrhenius y Órdenes de Reacción',
    description: 'Visualizador interactivo: perfil de energía con catalizador, gráfico de Arrhenius, órdenes de reacción 0/1/2 y factores que afectan la velocidad de reacción.',
    url: 'https://meskeia.com/visualizador-cinetica-quimica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cinética Química - Explicador Visual',
    description: 'k = A·e^(-Ea/RT): por qué algunos procesos termodinámicamente favorables no ocurren a temperatura ambiente. Con Arrhenius y órdenes de reacción.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: { 'application-name': 'Cinética Química meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cinética Química - Velocidad de Reacciones y Ecuación de Arrhenius',
  description: 'Visualizador interactivo de cinética química: perfil de energía potencial con slider de Ea y toggle de catalizador, calculadora visual de Arrhenius con gráfico ln(k) vs 1/T, comparativa de órdenes de reacción 0/1/2 y cards interactivas de factores que afectan la velocidad.',
  url: 'https://meskeia.com/visualizador-cinetica-quimica/',
  category: 'EducationalApplication',
  features: [
    'Perfil SVG interactivo de energía potencial con slider de Ea (50–250 kJ/mol)',
    'Toggle catalizador ON/OFF: segunda curva con Ea reducida',
    'Ejemplos preconfigurados: H₂/Pt, H₂O₂/MnO₂, NH₃ Haber-Bosch',
    'Calculadora visual de Arrhenius k = A·e^(-Ea/RT) con sliders de Ea y T',
    'Gráfico de Arrhenius: ln(k) vs 1/T (linealización)',
    'Comparativa de órdenes 0, 1 y 2: curvas [A] vs tiempo con ecuaciones integradas',
    'Calculadora de vida media t₁/₂ para cada orden',
    'Cards interactivas: temperatura, concentración, catalizadores, superficie, luz',
    'Gráfico interactivo ln(k) vs 1/T con linealización de Arrhenius',
    'Vida media t₁/₂ calculada automáticamente para cada orden de reacción',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la energía de activación y por qué determina la velocidad de reacción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La energía de activación (Ea) es la barrera energética mínima que los reactivos deben superar para transformarse en productos. Cuanto mayor sea Ea, menos moléculas tendrán suficiente energía cinética para reaccionar en un instante dado, y la reacción será más lenta. La ecuación de Arrhenius, k = A·e^(−Ea/RT), muestra que la constante de velocidad k decrece exponencialmente con Ea y aumenta con la temperatura T.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la ecuación de Arrhenius y qué significa su gráfico linealizado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ecuación de Arrhenius k = A·e^(−Ea/RT) relaciona la constante de velocidad con la temperatura. Tomando logaritmos: ln(k) = ln(A) − Ea/(R·T). Al graficar ln(k) frente a 1/T se obtiene una recta cuya pendiente es −Ea/R, lo que permite determinar experimentalmente la energía de activación a partir de medidas de velocidad a distintas temperaturas. Este gráfico de Arrhenius es una herramienta estándar en química cinética.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una reacción de orden 0, orden 1 y orden 2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El orden de reacción indica cómo depende la velocidad de la concentración del reactivo. En orden 0, la velocidad es constante independientemente de la concentración. En orden 1, la velocidad es proporcional a [A] y la vida media t₁/₂ = ln(2)/k es constante. En orden 2, la velocidad es proporcional a [A]² y la vida media aumenta al disminuir la concentración. Cada orden tiene una ecuación integrada distinta y se distingue gráficamente por la forma de la curva [A] vs tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿De qué manera actúa un catalizador sobre la cinética de una reacción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un catalizador ofrece un camino alternativo de reacción con menor Ea, lo que permite que más moléculas superen la barrera energética a la misma temperatura. Esto aumenta la constante de velocidad k sin alterar el ΔG ni el equilibrio termodinámico. En el visualizador, activar el catalizador dibuja una segunda curva de energía potencial con la barrera reducida, haciendo visible el efecto sobre la Ea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de cinética química?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está pensado para estudiantes de bachillerato, grado universitario de química, farmacia o ingeniería química que necesiten entender de forma intuitiva la energía de activación, la ecuación de Arrhenius y los órdenes de reacción. Al ser interactivo y funcionar sin instalación, también sirve como recurso de apoyo para docentes que quieran ilustrar estos conceptos con gráficos dinámicos en clase.',
      },
    },
  ],
};

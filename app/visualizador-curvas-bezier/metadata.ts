import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Curvas de Bézier - De Casteljau Interactivo | meskeIA',
  description:
    'Dibuja y entiende las curvas de Bézier moviendo sus puntos de control. Bézier cuadrática (3 puntos) y cúbica (4 puntos), polígono de control, deslizador de t y construcción geométrica de De Casteljau animada paso a paso. La base de las fuentes tipográficas, las curvas de animación (easing), el trazado vectorial y las trayectorias en videojuegos.',
  keywords:
    'curvas de bézier, de casteljau, interpolación, bézier cuadrática, bézier cúbica, animación, easing, gráficos vectoriales, videojuegos, puntos de control, splines, trazado vectorial, matemática de animación, Pierre Bézier',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-curvas-bezier/',
  },
  openGraph: {
    type: 'website',
    title: 'Visualizador de Curvas de Bézier - De Casteljau Interactivo | meskeIA',
    description:
      'Mueve los puntos de control y ve cómo se forma una curva de Bézier. Cuadrática y cúbica, polígono de control y el algoritmo de De Casteljau animado.',
    url: 'https://meskeia.com/visualizador-curvas-bezier/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Curvas de Bézier | meskeIA',
    description: 'Curvas de Bézier interactivas con puntos arrastrables y el algoritmo de De Casteljau animado',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Curvas de Bézier (De Casteljau)',
  description:
    'Herramienta interactiva para dibujar y comprender las curvas de Bézier. Arrastra los puntos de control de una curva cuadrática (3 puntos) o cúbica (4 puntos), observa el polígono de control y la curva resultante, mueve el parámetro t y activa la construcción geométrica de De Casteljau para ver cómo las interpolaciones lineales sucesivas generan cada punto de la curva. Con animación de t y movimiento de los puntos por teclado.',
  url: 'https://meskeia.com/visualizador-curvas-bezier/',
  category: 'EducationalApplication',
  features: [
    'Curvas de Bézier cuadráticas (3 puntos) y cúbicas (4 puntos)',
    'Puntos de control arrastrables con ratón, táctil y teclado',
    'Polígono de control con líneas discontinuas',
    'Deslizador del parámetro t con punto sobre la curva',
    'Construcción de De Casteljau animada por niveles',
    'Animación automática de t de 0 a 1',
    'Coordenadas del punto y longitud aproximada de la curva',
    'En español, con guía educativa completa',
  ],
  keywords: ['curvas de bézier', 'de casteljau', 'interpolación', 'animación', 'easing', 'gráficos vectoriales'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una curva de Bézier?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una curva de Bézier es una curva suave definida por unos pocos puntos de control. La curva siempre empieza en el primer punto y termina en el último, y los puntos intermedios «tiran» de ella sin tocarla, marcando su dirección y curvatura. Se calcula con una mezcla ponderada de los puntos de control mediante los polinomios de Bernstein. Las más usadas son la cuadrática (3 puntos) y la cúbica (4 puntos). Su gran ventaja es que con muy pocos puntos se controla una curva entera de forma intuitiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una Bézier cuadrática y una cúbica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuadrática usa 3 puntos de control (inicio, un punto intermedio y fin) y solo puede curvarse en un sentido, como un arco. La cúbica usa 4 puntos (inicio, dos intermedios y fin) y puede tener forma de S, con dos curvaturas distintas, por lo que es mucho más flexible. La cúbica es el estándar en diseño gráfico (PostScript, SVG, Illustrator), mientras que la cuadrática se usa, por ejemplo, en las fuentes TrueType porque es más ligera de calcular.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el algoritmo de De Casteljau?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un método geométrico para calcular un punto de la curva de Bézier para un valor de t entre 0 y 1, sin usar la fórmula con polinomios. Consiste en interpolar (hacer un punto medio ponderado por t) entre cada par de puntos de control consecutivos, obteniendo un nivel con menos puntos, y repetir hasta quedarse con un único punto: ese es el punto de la curva. Es numéricamente estable y muy visual, por eso se usa para dibujar y subdividir curvas. Lo propuso Paul de Casteljau en Citroën a finales de los años 50.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usan las curvas de Bézier?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Están por todas partes: definen la forma de las letras en las fuentes tipográficas, las curvas de los programas de dibujo vectorial (Illustrator, Inkscape, SVG, CSS), las curvas de aceleración y frenado (easing) de las animaciones de interfaces y videojuegos, y trayectorias suaves de cámaras y objetos. La curva cubic-bezier() de CSS es exactamente una Bézier cúbica que controla cómo evoluciona una animación en el tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién inventó las curvas de Bézier?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Llevan el nombre de Pierre Bézier, ingeniero de Renault que en los años 60 las popularizó para diseñar la carrocería de los coches con ordenador (sistema UNISURF). En paralelo, Paul de Casteljau, en la rival Citroën, había desarrollado el método geométrico equivalente algo antes, aunque su trabajo se publicó más tarde. Por eso la curva lleva el nombre de Bézier y el algoritmo para evaluarla lleva el de De Casteljau.',
      },
    },
  ],
};

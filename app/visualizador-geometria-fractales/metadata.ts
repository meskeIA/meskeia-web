import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Geometría de Fractales - Koch, Sierpinski y Mandelbrot | meskeIA',
  description: 'Explora los fractales interactivamente: copo de Koch, triángulo de Sierpinski, alfombra, curva de Hilbert. Autosimilitud, dimensión fractal y fractales en la naturaleza.',
  keywords: 'fractales, Sierpinski, Koch, Mandelbrot, autosimilitud, dimensión fractal, geometría fractal, Hilbert, fractales naturaleza, copo de nieve Koch',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Geometría de Fractales - Koch, Sierpinski y Mandelbrot',
    description: 'Genera fractales paso a paso con sliders interactivos: Sierpinski, Koch, alfombra y Hilbert. Descubre la autosimilitud y la dimensión fractal.',
    url: 'https://meskeia.com/visualizador-geometria-fractales/',
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
    title: 'Geometría de Fractales - Explicador Visual Interactivo',
    description: 'Triángulo de Sierpinski, copo de Koch, alfombra y Hilbert: genera fractales paso a paso y descubre por qué la naturaleza los usa.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: { 'application-name': 'Geometría Fractales meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Geometría de Fractales - Koch, Sierpinski y Mandelbrot',
  description: 'Explicador visual interactivo sobre fractales: triángulo de Sierpinski, copo de Koch, alfombra de Sierpinski, curva de Hilbert. Autosimilitud, dimensión fractal, fractales en la naturaleza y aplicaciones tecnológicas.',
  url: 'https://meskeia.com/visualizador-geometria-fractales/',
  category: 'EducationalApplication',
  features: [
    'Genera 4 fractales clásicos con sliders de iteración interactivos',
    'Triángulo de Sierpinski, copo de Koch, alfombra y curva de Hilbert',
    'Cálculo de perímetro y área por iteración',
    'Fractales en la naturaleza: helechos, brócoli, costas, pulmones',
    'Conjunto de Mandelbrot y dimensión fractal de Hausdorff explicados',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un fractal y por qué tiene dimensión no entera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un fractal es una figura geométrica que muestra el mismo patrón a cualquier escala de zoom, propiedad llamada autosimilitud. Su dimensión fractal (o de Hausdorff) puede ser un número decimal, como 1,585 para el triángulo de Sierpinski, porque ocupa más espacio que una línea pero menos que un plano completo. Este concepto, introducido por Benoît Mandelbrot en los años 70, permite medir la complejidad de formas irregulares que la geometría clásica no puede describir bien.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la criba o construcción del triángulo de Sierpinski?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se parte de un triángulo equilátero relleno. En cada iteración se elimina el triángulo central (el que une los puntos medios de los lados), quedando tres triángulos más pequeños. Al repetir el proceso indefinidamente, el área total tiende a cero mientras el perímetro crece sin límite. Con el slider interactivo puedes ver cada iteración y comprobar cómo cambian perímetro y área en tiempo real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el copo de nieve de Koch tiene perímetro infinito pero área finita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El copo de Koch se construye añadiendo triángulos en el tercio central de cada segmento en cada paso. Con cada iteración el número de lados se multiplica por 4 y cada lado mide un tercio del anterior, por lo que el perímetro crece con factor 4/3 en cada paso y diverge al infinito. Sin embargo, el área añadida en cada iteración es una serie geométrica convergente, así que el área total queda acotada a 8/5 del triángulo original.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde aparecen los fractales en la naturaleza y la tecnología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los fractales describen con precisión formas naturales como costas, copos de nieve reales, helechos, brócoli romanesco, redes de ríos, bronquios pulmonares y patrones de relámpagos. En tecnología se usan para comprimir imágenes (compresión fractal), diseñar antenas compactas de móviles que captan múltiples frecuencias, y generar paisajes sintéticos en videojuegos y efectos especiales cinematográficos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el conjunto de Mandelbrot y los fractales de Sierpinski o Koch?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sierpinski, Koch e Hilbert son fractales deterministas: se generan por reglas geométricas fijas y predecibles. El conjunto de Mandelbrot, en cambio, es un fractal definido en el plano complejo: un punto pertenece al conjunto si la sucesión z → z² + c no diverge al infinito. Su frontera es infinitamente compleja y no periódica, y al ampliar cualquier zona aparecen estructuras nuevas que nunca se repiten exactamente.',
      },
    },
  ],
};

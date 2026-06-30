import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Trigonometría: Círculo Unitario Interactivo — meskeIA',
  description: 'Explora la trigonometría de forma visual e interactiva: círculo unitario animado, gráficas de seno, coseno y tangente con sliders de amplitud, frecuencia y fase, tabla de valores exactos en ángulos notables e identidades pitagóricas.',
  keywords: 'trigonometría, círculo unitario, seno, coseno, tangente, funciones trigonométricas, identidades pitagóricas, ángulos notables, bachillerato, preparatoria, secundaria, educación media, matemáticas, visualizador interactivo, radianes, grados, ondas, amplitud, frecuencia, fase',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Trigonometría: Círculo Unitario Interactivo — meskeIA',
    description: 'Aprende trigonometría con visualizaciones interactivas: círculo unitario, gráficas de sen/cos/tan con sliders y tabla de valores exactos.',
    url: 'https://meskeia.com/visualizador-trigonometria/',
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
    title: 'Trigonometría: Círculo Unitario Interactivo — meskeIA',
    description: 'Círculo unitario animado, gráficas con sliders de amplitud/frecuencia/fase e identidades pitagóricas visualizadas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Trigonometría meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Trigonometría — Círculo Unitario Interactivo',
  description: 'Herramienta educativa interactiva para explorar trigonometría: círculo unitario animado con proyecciones de seno y coseno, gráficas con sliders de amplitud, frecuencia y fase, tabla de valores exactos en ángulos notables e identidades pitagóricas.',
  url: 'https://meskeia.com/visualizador-trigonometria/',
  category: 'EducationalApplication',
  features: [
    'Círculo unitario animado con slider de ángulo 0-360°',
    'Proyecciones de seno y coseno en tiempo real',
    'Línea de tangente con valor numérico',
    'Gráficas de sin(x), cos(x) y tan(x) con sliders',
    'Control de amplitud, frecuencia y fase',
    'Tabla de valores exactos en ángulos notables',
    'Visualización de identidades pitagóricas',
    'Modo identidades con cuadrado del radio',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el círculo unitario y cómo se relaciona con seno y coseno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El círculo unitario es una circunferencia de radio 1 centrada en el origen del plano cartesiano. Para cualquier ángulo θ, el punto donde el radio intersecta la circunferencia tiene coordenadas (cos θ, sen θ). Esta construcción geométrica es la definición más general de las funciones trigonométricas, ya que extiende el concepto más allá de los ángulos de un triángulo rectángulo a cualquier ángulo, incluyendo los mayores de 90° y los negativos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los valores exactos del seno y coseno en los ángulos notables?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ángulos notables y sus valores exactos son: 0° → sen=0, cos=1; 30° → sen=1/2, cos=√3/2; 45° → sen=√2/2, cos=√2/2; 60° → sen=√3/2, cos=1/2; 90° → sen=1, cos=0. Estos valores se derivan de triángulos rectángulos con ángulos especiales (30-60-90 y 45-45-90) y son fundamentales en cualquier cálculo trigonométrico sin calculadora.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las identidades pitagóricas en trigonometría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La identidad pitagórica fundamental es sen²θ + cos²θ = 1, consecuencia directa del teorema de Pitágoras aplicado al círculo unitario (el radio siempre mide 1). De ella se derivan otras dos: dividiendo entre cos²θ se obtiene tan²θ + 1 = sec²θ, y dividiendo entre sen²θ se obtiene 1 + cot²θ = csc²θ. Estas identidades son esenciales para simplificar expresiones trigonométricas y resolver integrales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la amplitud, la frecuencia y la fase en las funciones trigonométricas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la función y = A·sen(Bx + C), la amplitud A determina el valor máximo y mínimo de la onda (mayor A = onda más alta). La frecuencia angular B indica cuántos ciclos completos hay en 2π radianes; el período es T = 2π/B. La fase C desplaza la gráfica horizontalmente: un valor positivo la mueve a la izquierda, uno negativo a la derecha. Estos tres parámetros describen cualquier onda periódica, incluyendo las señales de audio, radio o corriente alterna.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué materias y situaciones reales se utiliza la trigonometría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La trigonometría es fundamental en geometría y álgebra de la educación media (bachillerato, preparatoria o secundaria), cálculo diferencial e integral, física (movimiento armónico, óptica, mecánica de ondas), ingeniería eléctrica (corriente alterna, señales), arquitectura, navegación, cartografía y procesamiento de señales digitales (transformada de Fourier). En la vida cotidiana aparece en GPS, compresión de audio MP3, diseño estructural de puentes y prácticamente cualquier fenómeno oscilatorio o periódico.',
      },
    },
  ],
};

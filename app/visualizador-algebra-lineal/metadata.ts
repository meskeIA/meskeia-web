import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Álgebra Lineal — Vectores, Transformaciones y Eigenvalores | meskeIA',
  description: 'Explora álgebra lineal geométricamente: vectores 2D con producto escalar, transformaciones lineales animadas (rotación, escala, cizalla), determinante como área del paralelogramo y eigenvalores/eigenvectores como ejes invariantes.',
  keywords: 'álgebra lineal, vectores, transformaciones lineales, determinante, eigenvalores, eigenvectores, matrices 2x2, producto escalar, PCA, geometría lineal, matemáticas, visualizador',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Álgebra Lineal — Vectores, Transformaciones y Eigenvalores',
    description: '¿Qué es realmente una transformación lineal? Explora la geometría del álgebra lineal: vectores, matrices como transformaciones, el determinante como área y los eigenvalores como ejes invariantes.',
    url: 'https://meskeia.com/visualizador-algebra-lineal/',
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
    title: 'Visualizador de Álgebra Lineal',
    description: 'Geometría del álgebra lineal: vectores, transformaciones matriciales, determinante como área y eigenvalores interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Álgebra Lineal meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Álgebra Lineal',
  description: 'Visualizador interactivo de álgebra lineal geométrica: vectores 2D con producto escalar y ángulo, transformaciones lineales con cuadrícula animada, determinante como área del paralelogramo y eigenvalores/eigenvectores con visualización de ejes invariantes.',
  url: 'https://meskeia.com/visualizador-algebra-lineal/',
  features: [
    'Vectores 2D interactivos: suma, producto escalar, ángulo entre vectores',
    'Transformaciones lineales 2×2 con cuadrícula transformada animada',
    'Presets: rotación, escala, cizalla, reflexión, identidad',
    'Determinante como área del paralelogramo visualizada',
    'Eigenvalores y eigenvectores para matrices simétricas 2×2',
    'Cálculo exacto de eigenvalores mediante fórmula analítica',
  ],
  category: 'EducationalApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una transformación lineal y cómo se visualiza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una transformación lineal es una función que convierte vectores en vectores conservando la suma y la multiplicación por escalar. Geométricamente, "deforma" el espacio: estira, rota, refleja o aplana una cuadrícula sin romper las líneas rectas ni desplazar el origen. Este visualizador anima esa deformación de la cuadrícula al cambiar los valores de la matriz 2×2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significan los eigenvalores y eigenvectores de una matriz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los eigenvectores son los ejes que la transformación no rota, solo escala; los eigenvalores indican cuánto se estiran o comprimen esos ejes. Si un eigenvalor es negativo, el eje se invierte. Para matrices simétricas 2×2 siempre existen eigenvalores reales, calculables con la fórmula λ = (traza ± √(traza² − 4·det)) / 2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el determinante de una matriz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El determinante mide el factor por el que la transformación escala las áreas. Si det = 2, los paralelogramos se duplican en área; si det = 0, la transformación aplana el espacio a una línea o un punto (matriz singular, no invertible). Un det negativo indica que la orientación del espacio se invierte.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de álgebra lineal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de matemáticas, ingeniería, física o informática que estudian álgebra lineal por primera vez. También lo usan quienes quieren reforzar la intuición geométrica antes de cursos de aprendizaje automático, gráficos 3D o análisis de datos (PCA), donde las transformaciones matriciales son fundamentales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un producto escalar y un producto vectorial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El producto escalar de dos vectores devuelve un número: u·v = |u||v|cos(θ), donde θ es el ángulo entre ellos. Si el resultado es 0, los vectores son perpendiculares. El producto vectorial, en cambio, devuelve un nuevo vector perpendicular al plano de los dos originales y se usa principalmente en 3D para calcular normales y áreas de triángulos.',
      },
    },
  ],
};

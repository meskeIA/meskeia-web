import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Cosmología: Composición y Destino del Universo — meskeIA',
  description: 'Exploración interactiva de la cosmología: composición del universo (materia bariónica 5%, materia oscura 27%, energía oscura 68%), línea de tiempo cósmica, expansión acelerada, geometría del universo y posibles destinos cósmicos.',
  keywords: [
    'cosmología universo composición',
    'materia oscura energía oscura',
    'Big Bang línea de tiempo cósmica',
    'expansión acelerada constante Hubble',
    'modelo cosmológico estándar ΛCDM',
    'geometría del universo plana abierta cerrada',
    'Big Freeze Big Rip destino universo',
    'fondo cósmico de microondas CMB',
    'tensión de Hubble cosmología',
    'materia bariónica universo observable',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Visualizador de Cosmología: Composición y Destino del Universo — meskeIA',
    description: 'El universo es 5% materia visible, 27% materia oscura y 68% energía oscura. Explora la línea de tiempo cósmica, la expansión acelerada y el destino final del cosmos.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-cosmologia/',
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
    title: 'Visualizador de Cosmología: Composición y Destino del Universo',
    description: 'Materia oscura, energía oscura, Big Bang, tensión de Hubble y el destino final del universo — explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Cosmología Universo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Cosmología: Composición y Destino del Universo',
  description: 'Visualizador interactivo de cosmología: tarta del universo (ΛCDM), línea de tiempo cósmica desde el Big Bang hasta hoy, curva de expansión acelerada con slider, geometría cósmica (plana/abierta/cerrada) y posibles destinos del universo (Big Freeze, Big Rip, Big Crunch, Big Bounce).',
  url: 'https://meskeia.com/visualizador-cosmologia/',
  category: 'EducationalApplication',
  features: [
    'Tarta del universo (donut SVG animado): materia bariónica, materia oscura, energía oscura',
    'Línea de tiempo cósmica interactiva desde el Big Bang (t=0) hasta hoy (13.800 Ma)',
    'Curva de expansión acelerada a(t) con slider temporal',
    'Geometría del universo: plana, abierta y cerrada con visualización SVG',
    'Cards de destinos cósmicos: Big Freeze, Big Rip, Big Crunch, Big Bounce',
    'Sección educativa: ΛCDM, materia oscura, energía oscura, tensión de Hubble, CMB',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿De qué está hecho el universo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según el modelo cosmológico estándar ΛCDM, el universo observable se compone de un 5% de materia bariónica (átomos, estrellas, planetas), un 27% de materia oscura y un 68% de energía oscura. La materia y la energía ordinarias que podemos detectar directamente representan solo una pequeña fracción del total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la energía oscura y por qué importa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La energía oscura es una forma de energía distribuida uniformemente en el espacio que ejerce una presión negativa, provocando que la expansión del universo se acelere en lugar de frenarse. Fue descubierta en 1998 gracias a la observación de supernovas de tipo Ia y representa el componente dominante del universo (68%). Su naturaleza exacta sigue siendo uno de los mayores misterios de la física.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasará al final del universo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cosmólogos proponen varios escenarios según la densidad y la naturaleza de la energía oscura. El Big Freeze (muerte térmica) es el más aceptado: en billones de años todas las estrellas se apagarán y el universo alcanzará el equilibrio térmico. Otros escenarios incluyen el Big Rip (la energía oscura desgarra toda la materia), el Big Crunch (colapso gravitacional) y el Big Bounce (rebote a un nuevo ciclo).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la tensión de Hubble?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tensión de Hubble es una discrepancia entre dos métodos para medir la tasa de expansión del universo (constante de Hubble H₀). Las mediciones locales basadas en cefeidas y supernovas dan ~73 km/s/Mpc, mientras que las inferidas del fondo cósmico de microondas (CMB) dan ~67 km/s/Mpc. Esta diferencia estadísticamente significativa podría indicar física más allá del modelo ΛCDM estándar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tiene el universo y cómo se sabe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El universo tiene aproximadamente 13.800 millones de años. Esta edad se determina combinando la medición de la constante de Hubble (tasa de expansión actual), el análisis del fondo cósmico de microondas (CMB) captado por los satélites WMAP y Planck, y el estudio de las estrellas más antiguas conocidas. Estos tres métodos independientes convergen en ese valor con una incertidumbre de unos 100 millones de años.',
      },
    },
  ],
};

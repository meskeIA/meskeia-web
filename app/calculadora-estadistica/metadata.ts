import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Estadística Online - Media, Mediana, Desviación | meskeIA',
  description: 'Calcula media, mediana, moda, varianza, desviación estándar y más. Análisis estadístico completo de conjuntos de datos con gráficos.',
  keywords: 'estadística, media, mediana, moda, varianza, desviación estándar, cuartiles, percentiles, datos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-estadistica/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora Estadística | meskeIA',
    description: 'Análisis estadístico completo: media, mediana, varianza, desviación y más.',
    url: 'https://meskeia.com/calculadora-estadistica/',
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
    title: 'Calculadora Estadística | meskeIA',
    description: 'Herramienta de análisis estadístico descriptivo online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora Estadística',
  description: 'Calculadora estadística online para análisis descriptivo: media, mediana, moda, varianza, desviación estándar, cuartiles y percentiles. Visualización gráfica de los datos.',
  url: 'https://meskeia.com/calculadora-estadistica/',
  category: 'EducationalApplication',
  features: [
    'Estadísticos descriptivos: media, mediana, moda',
    'Medidas de dispersión: varianza, desviación estándar, rango',
    'Cuartiles, deciles y percentiles',
    'Gráfico de distribución de datos',
    'Detección de valores atípicos (outliers)',
    'En español',
  ],
  keywords: ['estadística', 'media mediana moda', 'desviación estándar', 'análisis datos', 'estudiantes'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre media, mediana y moda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La media aritmética es la suma de todos los valores dividida entre la cantidad de datos; es sensible a valores extremos. La mediana es el valor central cuando los datos están ordenados; no le afectan los valores atípicos. La moda es el valor que aparece con mayor frecuencia; puede no existir o haber varias. Para datos con valores muy dispersos o atípicos, la mediana suele representar mejor el "valor típico" que la media.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre varianza y desviación estándar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La varianza es la media de los cuadrados de las desviaciones respecto a la media; sus unidades son el cuadrado de las unidades originales (por ejemplo, cm²). La desviación estándar es simplemente la raíz cuadrada de la varianza, lo que la devuelve a las unidades originales (cm) y la hace más fácil de interpretar. Una desviación estándar alta indica que los datos están muy dispersos respecto a la media; una baja, que están concentrados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se interpretan los cuartiles de un conjunto de datos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cuartiles dividen los datos ordenados en cuatro partes iguales. El primer cuartil Q1 deja por debajo el 25% de los datos; la mediana (Q2) el 50%; y Q3 el 75%. El rango intercuartílico (IQR = Q3 − Q1) contiene el 50% central de los datos y se usa para detectar valores atípicos: un dato es sospechoso si está más de 1,5 × IQR por debajo de Q1 o por encima de Q3.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de estudiante o profesional es útil esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de secundaria y universidad que necesiten calcular estadísticos descriptivos en ejercicios o prácticas, así como para docentes, investigadores o analistas que quieran obtener rápidamente un resumen estadístico de un conjunto pequeño o mediano de datos sin necesidad de abrir Excel o SPSS. La herramienta funciona directamente en el navegador, sin instalación ni registro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los valores atípicos (outliers) y cómo se detectan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un valor atípico es un dato que se aleja notablemente del resto del conjunto. El método más común para detectarlos usa el rango intercuartílico: se consideran atípicos los valores inferiores a Q1 − 1,5×IQR o superiores a Q3 + 1,5×IQR (criterio de Tukey). Los outliers pueden deberse a errores de medición, datos reales excepcionales o variabilidad natural; antes de eliminarlos conviene investigar su causa.',
      },
    },
  ],
};

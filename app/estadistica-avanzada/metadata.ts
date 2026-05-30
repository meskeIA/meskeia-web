import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Estadística Avanzada - Tests, Regresión y Correlación | meskeIA',
  description: 'Herramienta estadística avanzada: test t-Student, chi-cuadrado, regresión lineal, correlación Pearson/Spearman, intervalos de confianza y análisis de normalidad. Gratis y en español.',
  keywords: 'estadística avanzada, test t-student, chi-cuadrado, regresión lineal, correlación pearson, spearman, intervalo de confianza, test de normalidad, shapiro-wilk, anova, calculadora estadística, análisis de datos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Estadística Avanzada | meskeIA',
    description: 'Tests de hipótesis, regresión, correlación e intervalos de confianza. Análisis estadístico profesional gratis.',
    url: 'https://meskeia.com/estadistica-avanzada/',
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
    title: 'Calculadora Estadística Avanzada | meskeIA',
    description: 'Tests de hipótesis, regresión, correlación e intervalos de confianza. Análisis estadístico profesional gratis.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estadística Avanzada meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estadística Avanzada",
  description: "Herramienta estadística avanzada: test t-Student, chi-cuadrado, regresión lineal, correlación Pearson/Spearman, intervalos de confianza y análisis de normalidad. Gratis y en español.",
  url: "https://meskeia.com/estadistica-avanzada/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo debo usar el test t de Student en lugar de otro test estadístico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test t de Student es adecuado cuando quieres comparar medias de una o dos muestras y los datos siguen aproximadamente una distribución normal. Si tienes una muestra y quieres compararla con un valor de referencia, usas el t de una muestra. Si compara dos grupos independientes (por ejemplo, tratamiento vs. control), el t de dos muestras independientes. Si los mismos sujetos se miden dos veces (antes/después), el t de muestras pareadas. Para más de dos grupos es preferible ANOVA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el p-valor y cómo se interpreta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El p-valor es la probabilidad de obtener un resultado igual o más extremo que el observado, asumiendo que la hipótesis nula (H₀) es verdadera. Si p < 0,05 (umbral habitual), se rechaza H₀ y se habla de resultado "estadísticamente significativo". Un p-valor bajo no mide la importancia práctica del efecto ni confirma la hipótesis alternativa; solo indica que el resultado es improbable bajo H₀. Siempre conviene complementarlo con el tamaño del efecto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre correlación de Pearson y de Spearman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La correlación de Pearson mide la relación lineal entre dos variables cuantitativas continuas y asume distribución normal. La correlación de Spearman es una versión no paramétrica que trabaja con los rangos de los datos, por lo que es robusta ante valores atípicos y sirve para datos ordinales o cuando la relación no es estrictamente lineal. Si los datos son normales y sin outliers, ambas suelen dar resultados similares; en caso contrario, Spearman es más fiable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el test chi-cuadrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test chi-cuadrado (χ²) se usa con variables categóricas, no numéricas. Su aplicación más frecuente es el test de independencia: determinar si dos variables categóricas están relacionadas entre sí (por ejemplo, si el género y la preferencia de producto son independientes). También se usa como test de bondad de ajuste, para comprobar si una distribución observada se ajusta a una distribución teórica esperada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventaja tiene esta herramienta frente a Excel o una calculadora científica para estadística inferencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Excel requiere conocer fórmulas específicas o instalar complementos para tests de hipótesis. Una calculadora científica solo realiza cálculos descriptivos básicos. Esta herramienta aplica tests completos (t-Student, chi-cuadrado, regresión, correlación, normalidad) en un solo clic, mostrando el estadístico, los grados de libertad, el p-valor y la interpretación del resultado, sin necesidad de consultar tablas estadísticas ni programar nada.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Intervalos de Confianza | meskeIA',
  description: 'Visualiza qué significa realmente un intervalo de confianza al 95%. Simula 100 IC sobre muestras y comprueba que ~95 contienen μ. Modo conceptual y calculadora con z y t de Student.',
  keywords: 'intervalo de confianza, IC, nivel de confianza, t de Student, z, error estándar, margen de error, estadística inferencial, EBAU, Bachillerato, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-intervalos-confianza/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Intervalos de Confianza | meskeIA',
    description: '¿Qué significa realmente "95% de confianza"? Genera 100 intervalos y mira cuántos contienen μ.',
    url: 'https://meskeia.com/simulador-intervalos-confianza/',
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
    title: 'Simulador de Intervalos de Confianza | meskeIA',
    description: 'Aprende qué significa realmente un IC al 95% generando 100 intervalos y contando los que contienen μ.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Intervalos de Confianza',
  description: 'Simulador interactivo para entender visualmente los intervalos de confianza para la media μ. En modo Conceptual genera 100 muestras de una población N(μ, σ) y dibuja 100 IC verticales, contando cuántos contienen μ (debe ser ~95% al nivel 95%). En modo Calculadora introduce X̄, s y n para obtener un IC concreto. Soporta z (σ conocido) y t de Student (σ desconocido), niveles 80/90/95/99% y tamaños muestrales de 5 a 500. Ideal para EBAU, Bachillerato y estadística inferencial universitaria.',
  url: 'https://meskeia.com/simulador-intervalos-confianza/',
  category: 'EducationalApplication',
  features: [
    'Modo Conceptual: 100 IC simulados sobre muestras independientes',
    'Modo Calculadora: IC concreto a partir de X̄, s y n',
    'Niveles de confianza 80%, 90%, 95% y 99%',
    'z (Z normal) cuando σ es conocido, t de Student cuando es estimado',
    'Tamaños muestrales de 5 a 500',
    'Visualización clara: IC que contienen μ vs IC que NO lo contienen',
    'Cálculo automático de error estándar y margen de error',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['intervalo de confianza', 'IC', 't de Student', 'z', 'inferencia estadística', 'EBAU', 'Bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué significa exactamente un intervalo de confianza al 95%?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un intervalo de confianza al 95% no significa que la media poblacional μ caiga dentro de ese intervalo con probabilidad 95%. Significa que si repitieras el muestreo muchas veces, aproximadamente el 95% de los intervalos construidos de esa manera contendrían el verdadero μ. El simulador lo demuestra visualmente generando 100 muestras y mostrando cuántos de sus IC contienen realmente μ.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo debo usar la distribución z y cuándo la t de Student?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se usa z (distribución normal estándar) cuando la desviación típica poblacional σ es conocida. Se usa t de Student cuando σ es desconocida y se estima con la desviación muestral s. En la práctica, con muestras grandes (n > 30) la diferencia es pequeña, pero para muestras pequeñas la t de Student produce intervalos más anchos para compensar la incertidumbre adicional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué aumentar el nivel de confianza hace el intervalo más ancho?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para estar más seguro de que el intervalo contiene μ, necesitas ampliarlo. Al pasar del 95% al 99% de confianza, el valor crítico z (o t) aumenta —de 1,96 a 2,576 con z—, lo que multiplica el margen de error y produce un intervalo más ancho. Mayor confianza implica menos precisión, y viceversa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está diseñado principalmente para estudiantes de Bachillerato y universitarios de primer ciclo que estudian estadística inferencial. También resulta útil para preparar la EBAU, asignaturas de Métodos Estadísticos en Ciencias o Sociales, y para cualquier persona que quiera entender de forma visual un concepto que suele resultar contraintuitivo en los libros de texto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo reduce el tamaño muestral el margen de error?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El margen de error es proporcional a σ/√n (el error estándar). Al multiplicar n por 4, el margen se reduce a la mitad; al multiplicarlo por 100, se divide por 10. Esta relación explica por qué encuestas con muestras grandes tienen márgenes de error tan pequeños, aunque la población sea de millones de personas.',
      },
    },
  ],
};

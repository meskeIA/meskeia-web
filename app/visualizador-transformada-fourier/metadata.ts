import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Transformada de Fourier: Visualizador Interactivo — meskeIA',
  description: 'Visualizador interactivo de la Transformada de Fourier. Descompone señales en sumas de senos, muestra espectros de frecuencias, epiciclos animados y aplicaciones reales: MP3, JPEG, ECG, sismología.',
  keywords: [
    'transformada de Fourier visualizador',
    'serie de Fourier interactiva',
    'síntesis de señales senoidales',
    'espectro de frecuencias explicado',
    'epiciclos Fourier animados',
    'onda cuadrada serie de Fourier',
    'compresión MP3 frecuencias',
    'JPEG DCT transformada coseno',
    'Fourier matemáticas aplicadas',
    'análisis de señales educativo',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Transformada de Fourier: Visualizador Interactivo — meskeIA',
    description: 'Cómo cualquier señal se descompone en sumas de senos. Síntesis, espectro, epiciclos y aplicaciones reales explicadas de forma visual.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-transformada-fourier/',
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
    title: 'Transformada de Fourier: Visualizador Interactivo',
    description: 'Descompone señales en senos, ve el espectro y los epiciclos animados. MP3, JPEG, ECG explicados con Fourier.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Transformada de Fourier Visualizador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Transformada de Fourier: Visualizador Interactivo',
  description: 'Visualizador interactivo de la Transformada de Fourier que muestra la síntesis de señales, espectro de frecuencias, epiciclos animados y aplicaciones reales (MP3, JPEG, ECG, sismología). 100% educativo, sin registro.',
  url: 'https://meskeia.com/visualizador-transformada-fourier/',
  category: 'EducationalApplication',
  features: [
    'Síntesis de señal con 3-5 componentes sinusoidales via sliders',
    'Espectro de frecuencias SVG en tiempo real',
    'Señales preconfiguradas: onda cuadrada, diente de sierra, triangular',
    'Epiciclos animados con Canvas 2D (requestAnimationFrame)',
    'Aplicaciones reales: MP3, JPEG/DCT, ECG, sismología',
    'Visualización interactiva en Canvas 2D',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la Transformada de Fourier y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Transformada de Fourier es una herramienta matemática que descompone cualquier señal compleja en una suma de señales sinusoidales simples, cada una con su propia frecuencia, amplitud y fase. Sirve para analizar qué frecuencias contiene una señal, eliminar ruido, comprimir datos y estudiar sistemas físicos. Es la base de tecnologías cotidianas como el audio digital, la imagen JPEG y la resonancia magnética.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la compresión MP3 con la Transformada de Fourier?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La compresión MP3 aplica la Transformada de Fourier para descomponer el audio en sus componentes de frecuencia. Después elimina las frecuencias que el oído humano percibe con menor sensibilidad (por encima de ~16 kHz y las enmascaradas por sonidos más intensos). El resultado es un archivo hasta 10 veces más pequeño con una pérdida de calidad prácticamente imperceptible en escucha normal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los epiciclos de Fourier y cómo dibujan señales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los epiciclos de Fourier son círculos giratorios encadenados, donde cada uno representa un componente sinusoidal de la señal: su radio corresponde a la amplitud y su velocidad angular a la frecuencia. Al sumar vectorialmente todos los epiciclos en cada instante, la punta del último traza la señal original. Esta representación geométrica demuestra visualmente que cualquier curva —incluso una figura compleja— puede construirse con suficientes círculos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la Serie de Fourier y la Transformada de Fourier?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Serie de Fourier descompone señales periódicas (que se repiten indefinidamente) en un conjunto discreto de frecuencias: la fundamental y sus armónicos enteros. La Transformada de Fourier generaliza el concepto a señales no periódicas, produciendo un espectro continuo de frecuencias. En la práctica digital se usa la Transformada Discreta de Fourier (DFT), calculada eficientemente con el algoritmo FFT.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo usa la Transformada de Fourier la compresión de imágenes JPEG?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'JPEG aplica la Transformada Discreta del Coseno (DCT), variante de Fourier, a bloques de 8×8 píxeles. La DCT convierte esos píxeles en coeficientes de frecuencia espacial: los de baja frecuencia representan variaciones suaves de color y los de alta frecuencia, los detalles finos. El estándar descarta o redondea agresivamente los coeficientes de alta frecuencia, ya que el ojo humano los percibe con menor nitidez, logrando ratios de compresión de 10:1 o más.',
      },
    },
  ],
};

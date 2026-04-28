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
    url: 'https://meskeia.com/visualizador-transformada-fourier',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transformada de Fourier: Visualizador Interactivo',
    description: 'Descompone señales en senos, ve el espectro y los epiciclos animados. MP3, JPEG, ECG explicados con Fourier.',
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
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Analizador de Espectro de Audio - Visualiza frecuencias en tiempo real | meskeIA',
  description: 'Analizador de espectro FFT gratuito. Visualiza las frecuencias de audio en tiempo real con tu micrófono. Ideal para músicos, técnicos de sonido y curiosos.',
  keywords: 'analizador espectro, FFT, frecuencias audio, espectrograma, visualizador audio, analizador frecuencias, audio spectrum analyzer, técnico sonido',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Analizador de Espectro de Audio - meskeIA',
    description: 'Visualiza las frecuencias de audio en tiempo real con tu micrófono. Herramienta gratuita para músicos y técnicos.',
    url: 'https://meskeia.com/analizador-espectro/',
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
    title: 'Analizador de Espectro de Audio - meskeIA',
    description: 'Visualiza frecuencias de audio en tiempo real. Gratis y sin instalación.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Analizador de Espectro de Audio - Visualiza frecuencias en tiempo real",
  description: "Analizador de espectro FFT gratuito. Visualiza las frecuencias de audio en tiempo real con tu micrófono. Ideal para músicos, técnicos de sonido y curiosos.",
  url: 'https://meskeia.com/analizador-espectro/',
  category: 'UtilityApplication',
  features: [
    'Análisis FFT en tiempo real con fftSize 8192 para alta resolución frecuencial',
    'Visualización en modo barras o modo línea sobre escala logarítmica 20 Hz–20 kHz',
    'Detección de frecuencia dominante y nota musical más cercana (temperamento igual)',
    'Ocho bandas de frecuencia con color diferenciado: sub-graves, graves, medios, agudos y presencia',
    'Control de sensibilidad ajustable y marcadores de picos con decay automático',
    'Tabla de referencia de frecuencias de notas musicales (A4=440 Hz)',
    'Bloque educativo sobre FFT, EQ, respuesta frecuencial y usos profesionales',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un analizador de espectro de audio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un analizador de espectro de audio es una herramienta que descompone una señal sonora en sus frecuencias constituyentes y las muestra visualmente en tiempo real. Utiliza el algoritmo FFT (Transformada Rápida de Fourier) para convertir la onda de sonido del dominio temporal al dominio de la frecuencia, permitiendo ver qué frecuencias (graves, medios, agudos) están presentes y con qué intensidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué necesito para usar el analizador de espectro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Solo necesitas un navegador moderno (Chrome, Firefox, Safari o Edge actualizados) y un micrófono, que puede ser el integrado en tu ordenador, tablet o móvil. La herramienta funciona completamente en el navegador sin instalar nada; al abrirla, pedirá permiso para acceder al micrófono, que debes aceptar para capturar el audio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué usan este tipo de herramienta los músicos y técnicos de sonido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los músicos lo usan para identificar qué frecuencias domina un instrumento, detectar resonancias indeseadas en una sala o afinar con mayor precisión. Los técnicos de sonido lo emplean para ecualizar monitores, detectar realimentación (feedback), ajustar procesadores de dinámica y verificar que la mezcla tiene una distribución frecuencial equilibrada. También es útil para diagnóstico de ruidos ambientales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué rango de frecuencias muestra el analizador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rango analizado depende de la frecuencia de muestreo del micrófono. La mayoría de micrófonos de ordenador y móvil trabajan a 44.100 Hz o 48.000 Hz, lo que permite visualizar frecuencias desde cerca de 20 Hz hasta 20.000 Hz (20 kHz), cubriendo prácticamente todo el espectro audible por el oído humano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia de una app de afinador o de un medidor de decibelios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un afinador detecta la frecuencia fundamental de una nota y te dice si está en el tono correcto. Un medidor de decibelios mide el volumen global del sonido sin distinguir frecuencias. El analizador de espectro muestra todas las frecuencias simultáneamente con su nivel relativo, ofreciendo una visión completa de la "huella" frecuencial del sonido, útil para análisis detallado más allá de la afinación o el volumen.',
      },
    },
  ],
};

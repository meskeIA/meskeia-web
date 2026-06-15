import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Bitrate y Tamaño de Vídeo - Estima espacio en disco | meskeIA',
  description:
    'Calcula el bitrate y el tamaño de archivo de vídeo según resolución, fps, códec y duración. Compatible con H.264, H.265, ProRes 422 y RAW. Comparativa entre códecs.',
  keywords:
    'calculadora bitrate video, tamaño archivo video, H.264, H.265, ProRes 422, RAW, 4K, 1080p, fps, almacenamiento video, produccion video',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Bitrate y Tamaño de Vídeo | meskeIA',
    description:
      'Estima el bitrate y el espacio en disco para cualquier resolución y códec de vídeo.',
    url: 'https://meskeia.com/calculadora-bitrate-video/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Bitrate y Tamaño de Vídeo | meskeIA',
    description:
      'Calcula el tamaño de archivo de vídeo según resolución, fps y códec. H.264, H.265, ProRes 422, RAW.',
  },
  other: {
    'application-name': 'Calculadora de Bitrate de Vídeo meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Bitrate y Tamaño de Vídeo',
  description:
    'Herramienta para estimar el bitrate y el espacio en disco necesario para grabar vídeo según resolución, fps, códec y duración. Compatible con H.264, H.265, ProRes 422 y RAW.',
  url: 'https://meskeia.com/calculadora-bitrate-video/',
  category: 'UtilityApplication',
  features: [
    'Estimación de bitrate por resolución y fps',
    'Cálculo de tamaño de archivo en GB/MB',
    'Compatible con H.264, H.265, ProRes 422 y RAW',
    'Comparativa simultánea entre los 4 códecs',
    'Seis resoluciones: 480p, 720p, 1080p, 2K, 4K y 8K con bitrates de referencia',
    'Seis opciones de fps: 24, 25, 30, 50, 60 y 120 fps',
    'Cálculo de almacenamiento necesario para proyectos de producción de vídeo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el bitrate de vídeo y por qué importa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El bitrate es la cantidad de datos que se procesa por segundo en un vídeo, medido en Mbps (megabits por segundo). Un bitrate más alto conserva más detalle y calidad de imagen, pero genera archivos más grandes. Para referencia, streaming en 1080p suele usar 8-15 Mbps; grabación en 4K con H.265 puede requerir 50-100 Mbps; ProRes 4K puede superar los 700 Mbps.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto espacio ocupa un vídeo 4K en disco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del códec: un vídeo 4K a 25 fps durante 1 hora ocupa aproximadamente 13 GB en H.264, 7 GB en H.265, 270 GB en ProRes 422 y hasta 1.100 GB en RAW sin comprimir. H.265 ofrece la mejor relación calidad/espacio para distribución online, mientras que ProRes y RAW se usan en producción profesional por su mayor flexibilidad en posproducción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre H.264 y H.265 (HEVC)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'H.265 (HEVC) es el sucesor de H.264 y ofrece la misma calidad visual con aproximadamente la mitad del tamaño de archivo, gracias a algoritmos de compresión más eficientes. La desventaja de H.265 es que requiere más potencia de procesamiento para codificar y decodificar, lo que puede ser un problema en ordenadores más antiguos. Para distribución en internet y almacenamiento a largo plazo, H.265 es la opción más eficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa ProRes 422 frente a H.264 o H.265?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ProRes 422 es un códec de producción diseñado para la edición no lineal: tiene compresión intraframe (cada fotograma es independiente), lo que facilita el scrubbing y la edición fluida en tiempo real sin necesidad de renderizar. H.264 y H.265 usan compresión interframe que requiere procesar varios fotogramas a la vez, lo que ralentiza la edición. ProRes es preferido por coloristas y editores profesionales a pesar de sus archivos mucho más grandes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto almacenamiento necesito para una jornada de rodaje en 4K?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para una jornada de 8 horas de grabación real en 4K a 25 fps, necesitas aproximadamente 100 GB con H.264, 55 GB con H.265, 2 TB con ProRes 422 y 9 TB en RAW. En la práctica solo grabas una fracción del tiempo, pero siempre se recomienda llevar el doble de lo calculado para imprevistos. Para producciones en ProRes o RAW es habitual trabajar con unidades de 2-4 TB y hacer copias de seguridad en el campo.',
      },
    },
  ],
};

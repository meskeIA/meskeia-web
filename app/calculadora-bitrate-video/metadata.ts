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
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

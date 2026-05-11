import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Convertidor de Subtítulos SRT, VTT, SUB y SSA | meskeIA',
  description: 'Convierte archivos de subtítulos entre formatos SRT, WebVTT, SUB (SubViewer) y SSA/ASS en tu navegador. Auto-detección, validación y descarga directa. 100% local.',
  keywords: 'convertidor subtítulos, srt a vtt, vtt a srt, srt a sub, subtitulos online, webvtt, subviewer, substation alpha, ssa, ass, accesibilidad audiovisual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/convertidor-subtitulos/',
  },
  openGraph: {
    type: 'website',
    title: 'Convertidor de Subtítulos SRT, VTT, SUB y SSA | meskeIA',
    description: 'Convierte subtítulos entre los principales formatos. 100% local en tu navegador.',
    url: 'https://meskeia.com/convertidor-subtitulos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convertidor de Subtítulos | meskeIA',
    description: 'SRT, VTT, SUB y SSA: convierte entre formatos sin subir el archivo a internet.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Convertidor de Subtítulos',
  description: 'Herramienta gratuita para convertir archivos de subtítulos entre los formatos SRT, WebVTT, SUB (SubViewer) y SSA/ASS. Detección automática del formato de origen, validación, preview y descarga. Procesamiento 100% local en el navegador.',
  url: 'https://meskeia.com/convertidor-subtitulos/',
  category: 'UtilityApplication',
  features: [
    'Conversión entre SRT, WebVTT, SUB (SubViewer) y SSA/ASS',
    'Detección automática del formato de origen',
    'Validación de tiempos y solapamientos',
    'Preview del resultado antes de descargar',
    'Procesamiento 100% local (el archivo nunca sale del navegador)',
    'Drag & drop o pegar texto directamente',
    'Gratuito, sin registro ni publicidad',
    'En español',
  ],
  keywords: ['subtítulos', 'srt', 'vtt', 'webvtt', 'subviewer', 'ssa', 'ass', 'accesibilidad', 'conversor'],
});

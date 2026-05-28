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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los formatos de subtítulos más comunes y en qué se diferencian?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los formatos más extendidos son SRT (SubRip), el más universal y soportado por casi todos los reproductores; WebVTT (Web Video Text Tracks), el estándar nativo de HTML5 con soporte para estilos CSS; SUB/SubViewer, usado principalmente en software antiguo; y SSA/ASS (SubStation Alpha/Advanced SubStation Alpha), que permite animaciones, fuentes y posicionamiento avanzado de subtítulos. Cada formato tiene su propio esquema de marcas de tiempo y codificación de texto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo convierto un archivo SRT a WebVTT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La principal diferencia entre SRT y VTT es el formato de las marcas de tiempo: SRT usa comas como separador decimal (00:01:23,456) mientras que VTT usa punto (00:01:23.456). Un convertidor cambia estas marcas y añade la cabecera "WEBVTT" obligatoria al inicio del archivo. El proceso es inmediato y el contenido de los subtítulos no se altera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué necesito convertir subtítulos entre formatos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Distintas plataformas y reproductores admiten formatos diferentes. YouTube acepta SRT, VTT y SBV; los reproductores de escritorio como VLC admiten SRT, ASS y SUB; los reproductores HTML5 del navegador requieren VTT. Si los subtítulos vienen de una fuente externa o de un software de transcripción, es habitual que estén en un formato incompatible con el destino previsto y haya que convertirlos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro subir archivos de subtítulos a un convertidor online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la herramienta. Las que procesan el archivo en el servidor implican que el contenido abandona tu dispositivo, lo que puede ser un problema si los subtítulos contienen información confidencial o están sujetos a acuerdos de confidencialidad. Las herramientas que operan íntegramente en el navegador (JavaScript del lado cliente) no envían el archivo a ningún servidor, por lo que el procesamiento es completamente local y privado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tienen los subtítulos con la accesibilidad audiovisual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los subtítulos son un elemento clave de accesibilidad para personas sordas o con dificultades auditivas. Las pautas WCAG 1.2 exigen subtítulos sincronizados para todo contenido multimedia pregrabado como requisito de nivel A. Además, los subtítulos benefician a personas que ven vídeo en entornos ruidosos, a quienes aprenden el idioma del contenido y a sistemas de búsqueda e indexación que no pueden procesar audio directamente.',
      },
    },
  ],
};

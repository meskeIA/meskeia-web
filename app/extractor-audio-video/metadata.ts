import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Extractor de Audio de Vídeo - AVI, MP4 a MP3 o WAV | meskeIA',
  description: 'Extrae y recorta fragmentos de audio de tus vídeos AVI, MP4, MOV, MKV directamente en el navegador. Convierte a MP3 o WAV. 100% privado: ningún archivo sale de tu dispositivo.',
  keywords: 'extractor audio video, convertir avi a mp3, extraer audio mp4, convertir video a audio, recortar audio video, avi a wav, mp4 a mp3, ffmpeg online, privado sin subir',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Extractor de Audio de Vídeo - AVI, MP4 a MP3/WAV',
    description: 'Extrae y recorta fragmentos de audio de cualquier vídeo. Todo en tu navegador, ningún archivo se envía a servidores.',
    url: 'https://meskeia.com/extractor-audio-video/',
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
    title: 'Extractor de Audio de Vídeo | meskeIA',
    description: 'Extrae y recorta audio de vídeos AVI, MP4, MOV. 100% privado, sin subir archivos a ningún servidor.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Extractor de Audio de Vídeo",
  description: "Extrae y recorta fragmentos de audio de tus vídeos AVI, MP4, MOV, MKV directamente en el navegador. Convierte a MP3 o WAV. 100% privado: ningún archivo sale de tu dispositivo.",
  url: "https://meskeia.com/extractor-audio-video/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo extraer el audio de un vídeo MP4 o AVI sin programas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes extraer el audio directamente en el navegador sin instalar ningún programa. Solo tienes que abrir la herramienta, cargar el archivo de vídeo (MP4, AVI, MOV o MKV), elegir el formato de salida (MP3 o WAV) y pulsar "Extraer". El proceso se realiza íntegramente en tu dispositivo gracias a tecnología WebAssembly basada en FFmpeg.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Mis vídeos se suben a algún servidor cuando extraigo el audio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Todo el procesamiento ocurre localmente en tu navegador, sin que ningún archivo abandone tu dispositivo. No se envía nada a servidores externos. Esto lo convierte en una opción especialmente adecuada para vídeos personales, confidenciales o de gran tamaño, ya que tampoco hay límites de tamaño impuestos por una conexión a internet.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre extraer audio en MP3 y en WAV?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MP3 es un formato comprimido con pérdida: el archivo resultante ocupa mucho menos espacio (típicamente 1 MB por minuto a 128 kbps) y es compatible con casi todos los dispositivos. WAV es un formato sin compresión que conserva la calidad original del audio, pero genera archivos mucho más grandes. Usa MP3 para podcasts, música o contenido web; WAV si necesitas editar el audio después o conservar la máxima calidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede recortar solo un fragmento del audio de un vídeo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La herramienta permite definir un punto de inicio y un punto de fin para extraer únicamente el segmento de audio que necesitas, sin tener que procesar el vídeo completo. Esto es muy útil para capturar citas, fragmentos musicales o escenas concretas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué formatos de vídeo admite el extractor de audio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herramienta es compatible con los formatos de vídeo más habituales: MP4, AVI, MOV y MKV. Estos cubren la inmensa mayoría de los vídeos procedentes de cámaras, smartphones, descargas de internet o grabaciones de pantalla.',
      },
    },
  ],
};

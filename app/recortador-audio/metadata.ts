import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Recortador de Audio Online - Corta MP3, WAV, OGG Gratis | meskeIA',
  description: 'Recorta y edita archivos de audio online gratis. Corta MP3, WAV, OGG sin límites ni marcas de agua. Fade in/out, ajuste de volumen. 100% privado en tu navegador.',
  keywords: 'recortador audio, cortar mp3, recortar audio online, editar mp3 gratis, cortar canciones, hacer tonos, trim audio, cortar wav, recortar ogg, editor audio online, sin marca de agua, fade in, fade out',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Recortador de Audio Online - Sin Límites | meskeIA',
    description: 'Recorta y edita archivos de audio online gratis. Sin límites ni marcas de agua. 100% privado.',
    url: 'https://meskeia.com/recortador-audio/',
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
    title: 'Recortador de Audio Online | meskeIA',
    description: 'Recorta MP3, WAV, OGG gratis. Sin límites ni marcas de agua.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Recortador de Audio meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Recortador de Audio",
  description: "Recorta y edita archivos de audio online gratis. Corta MP3, WAV, OGG sin límites ni marcas de agua. Fade in/out, ajuste de volumen. 100% privado en tu navegador.",
  url: "https://meskeia.com/recortador-audio/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo recortar un archivo MP3 online sin instalar programas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sube el archivo MP3 a la herramienta, ajusta los puntos de inicio y fin en la línea de tiempo y descarga el fragmento recortado. Todo el procesamiento ocurre en tu navegador, por lo que no se sube ningún dato a servidores externos. No necesitas instalar ningún programa ni registrarte.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué formatos de audio admite un recortador online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los formatos más compatibles con navegadores modernos son MP3, WAV y OGG. El MP3 es el más universal para música y podcasts; el WAV ofrece calidad sin pérdida y es preferido en producción de audio; el OGG es habitual en videojuegos y aplicaciones web. Algunos recortadores también admiten M4A y FLAC.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el efecto fade in y fade out en audio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El fade in aumenta progresivamente el volumen al inicio del clip, evitando cortes bruscos. El fade out lo reduce al final, creando un cierre suave. Ambos efectos se usan para crear tonos de llamada, intros de pódcast, transiciones musicales y eliminación de ruidos de fondo al principio o al final de una grabación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro usar un recortador de audio online para archivos personales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, siempre que el procesamiento sea local (en el propio navegador mediante la Web Audio API). En ese caso el archivo nunca abandona tu dispositivo y no existe riesgo de filtración de datos. Antes de usar cualquier herramienta, verifica que no envía el archivo a un servidor externo revisando la política de privacidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre recortar audio y convertir audio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Recortar audio consiste en seleccionar un fragmento temporal de un archivo, manteniendo el formato y la calidad originales. Convertir audio cambia el formato del archivo (por ejemplo, de WAV a MP3) sin modificar necesariamente su duración. Son operaciones distintas: se puede recortar sin convertir y viceversa.',
      },
    },
  ],
};

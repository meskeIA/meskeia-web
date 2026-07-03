import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Recortador de Vídeo Online - Corta MP4 Gratis sin Marca de Agua | meskeIA',
  description: 'Recorta y corta vídeos MP4 online gratis, sin subirlos a ningún servidor. Precisión al fotograma, sin registro, sin marca de agua y sin límite de exportaciones. 100% privado en tu navegador.',
  keywords: 'recortar video online, cortar video mp4, recortador de video gratis, recortar clip, cortar video sin marca de agua, editar video online, recortar video sin subir, trim video, cortar video navegador, recortar clip xbox game bar, recortar video redes sociales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Recortador de Vídeo Online - Sin Subir Archivos | meskeIA',
    description: 'Corta vídeos MP4 online con precisión al fotograma. Sin registro, sin marca de agua, sin subir nada a ningún servidor. 100% privado.',
    url: 'https://meskeia.com/recortador-video/',
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
    title: 'Recortador de Vídeo Online | meskeIA',
    description: 'Corta vídeos MP4 gratis en tu navegador. Sin subir archivos, sin marca de agua.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Recortador de Vídeo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Recortador de Vídeo',
  description: 'Recorta y corta vídeos MP4 online gratis, sin subirlos a ningún servidor. Precisión al fotograma, sin registro y sin marca de agua. 100% privado en tu navegador.',
  url: 'https://meskeia.com/recortador-video/',
  category: 'UtilityApplication',
  features: [
    'Recorte de vídeo MP4 en el navegador sin subir archivos',
    'Modo rápido sin recodificar (instantáneo)',
    'Modo exacto con precisión al fotograma',
    'Marcado de inicio y fin sobre la previsualización',
    'Sin registro, sin marca de agua y sin límite de exportaciones',
    'Procesamiento 100% local con la tecnología WebCodecs',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo recortar un vídeo online sin subirlo a un servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Abre el vídeo desde tu dispositivo, marca el inicio y el fin sobre la previsualización y descarga el fragmento. Todo el procesamiento ocurre dentro de tu navegador mediante la tecnología WebCodecs, por lo que el archivo nunca se sube a Internet ni pasa por ningún servidor. No hace falta registrarse ni instalar programas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el recorte rápido y el recorte exacto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El recorte rápido no recodifica el vídeo: copia el fragmento tal cual, es casi instantáneo y no pierde calidad, pero el inicio se ajusta al fotograma clave más cercano (puede desviarse uno o dos segundos). El recorte exacto recodifica el fragmento con aceleración por hardware para empezar justo en el fotograma que has marcado; tarda algo más, pero es preciso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El vídeo recortado sirve para subirlo a X, TikTok o Instagram?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El resultado es un MP4 con códec H.264 y audio AAC, el formato que aceptan todas las redes sociales en cualquier proporción. No es necesario convertir el vídeo a vertical para poder publicarlo: las apps de TikTok e Instagram permiten reencuadrarlo al subir. El recorte conserva la resolución y el formato originales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay límite de tamaño o de duración del vídeo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No hay límites artificiales, pero al procesarse en el navegador el vídeo se carga en la memoria del dispositivo. Los clips de pocos minutos y hasta unos cientos de MB funcionan con fluidez; los archivos muy grandes (más de 1 GB) pueden agotar la memoria disponible. Para recortes cortos el rendimiento es similar al de un recortador de audio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué navegadores admiten el recortador de vídeo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Funciona en navegadores modernos compatibles con la API WebCodecs: Chrome y Edge (versión 94 o superior), y versiones recientes de Safari y Firefox. El modo rápido funciona de forma muy amplia; el modo exacto requiere soporte de codificación de vídeo en el navegador, disponible en Chrome y Edge de escritorio de forma generalizada.',
      },
    },
  ],
};

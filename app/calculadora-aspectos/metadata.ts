import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Aspectos de Imagen - Mantén Proporciones | meskeIA',
  description: 'Calcula proporciones perfectas para redimensionar imágenes sin deformarlas. Presets para Instagram, YouTube, Facebook y más redes sociales.',
  keywords: 'calculadora aspectos, ratio imagen, redimensionar, proporciones, 16:9, 4:3, instagram, youtube, aspect ratio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Aspectos de Imagen - meskeIA',
    description: 'Redimensiona imágenes manteniendo proporciones perfectas',
    url: 'https://meskeia.com/calculadora-aspectos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Aspectos de Imagen - Mantén Proporciones",
  description: "Calcula proporciones perfectas para redimensionar imágenes sin deformarlas. Presets para Instagram, YouTube, Facebook y más redes sociales.",
  url: 'https://meskeia.com/calculadora-aspectos/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la relación de aspecto de una imagen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La relación de aspecto (aspect ratio) es la proporción entre el ancho y el alto de una imagen o pantalla, expresada como dos números separados por dos puntos. Por ejemplo, 16:9 significa que por cada 16 píxeles de ancho hay 9 de alto. Las relaciones más comunes son 16:9 (pantallas y vídeos), 4:3 (fotografía clásica), 1:1 (cuadrado, Instagram) y 9:16 (vídeo vertical, Stories).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo redimensionar una imagen sin deformarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para redimensionar sin deformar debes mantener la misma relación de aspecto. Si conoces el ancho original, el nuevo alto se calcula así: nuevo_alto = (ancho_nuevo × alto_original) / ancho_original. Por ejemplo, una imagen de 1920×1080 reducida a 800px de ancho debe tener 800×450px para conservar la proporción 16:9. La calculadora de aspectos hace este cálculo automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tamaño de imagen necesito para Instagram?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Instagram admite varios formatos: cuadrado 1:1 recomendado a 1080×1080px; apaisado 1.91:1 a 1080×566px; vertical 4:5 a 1080×1350px (el que más espacio ocupa en el feed, recomendado). Para Stories e Instagram Reels el formato es 9:16 a 1080×1920px. El tamaño máximo de archivo es 30MB para fotos y los vídeos deben tener menos de 4GB.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la relación de aspecto para YouTube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'YouTube usa la relación 16:9 como estándar. El tamaño recomendado para vídeos es 1920×1080px (Full HD) o 3840×2160px (4K). Para miniaturas (thumbnails) el tamaño ideal es 1280×720px en formato 16:9, con un máximo de 2MB. Las miniaturas de calidad son cruciales para el CTR: deben ser legibles en tamaño pequeño y consistentes con la identidad visual del canal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre píxeles y resolución en imágenes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los píxeles son las dimensiones en pantalla (ej: 1920×1080). La resolución mide la densidad de píxeles en impresión, expresada en PPI (pixels per inch) o DPI (dots per inch). Para pantallas, lo relevante son los píxeles; para impresión, la resolución (mínimo 150 DPI para uso general, 300 DPI para calidad profesional). Una imagen de 1080×1080px impresa a 300 DPI ocuparía aproximadamente 9×9 cm.',
      },
    },
  ],
};

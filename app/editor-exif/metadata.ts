import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Editor EXIF - Visualiza y Elimina Metadatos de Fotos | meskeIA',
  description: 'Analiza qué datos revelan tus fotos (GPS, cámara, fecha, dispositivo). Elimina metadatos EXIF para proteger tu privacidad. 100% offline, procesamiento local en tu navegador.',
  keywords: 'editor exif, eliminar metadatos fotos, quitar gps fotos, privacidad fotos, datos ocultos imagen, exif viewer, metadata remover, limpiar exif, seguridad digital, ubicacion fotos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Editor EXIF - Protege tu Privacidad | meskeIA',
    description: 'Descubre qué datos ocultos revelan tus fotos y elimínalos fácilmente. Herramienta educativa de seguridad digital.',
    url: 'https://meskeia.com/editor-exif/',
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
    title: 'Editor EXIF - Visualiza y Elimina Metadatos | meskeIA',
    description: 'Analiza y elimina datos ocultos de tus fotos. Protege tu privacidad al compartir imágenes.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Editor EXIF meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Editor EXIF",
  description: "Analiza qué datos revelan tus fotos (GPS, cámara, fecha, dispositivo). Elimina metadatos EXIF para proteger tu privacidad. 100% offline, procesamiento local en tu navegador.",
  url: "https://meskeia.com/editor-exif/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los metadatos EXIF de una foto y qué información contienen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'EXIF (Exchangeable Image File Format) es un estándar que almacena información técnica dentro del archivo de imagen. Puede incluir la fecha y hora exactas de la toma, las coordenadas GPS de la ubicación, el modelo de cámara o smartphone, la apertura, el tiempo de exposición, la sensibilidad ISO y otros ajustes fotográficos. Estos datos son invisibles en la foto pero legibles por cualquier programa que analice el archivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué es importante eliminar los metadatos EXIF antes de compartir fotos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Compartir fotos con metadatos puede revelar tu ubicación exacta (GPS), el dispositivo que usas y los horarios de tu rutina diaria. Esto representa un riesgo real de privacidad, especialmente en redes sociales públicas, anuncios de compraventa o cuando la foto incluye imágenes de menores. Eliminar los metadatos EXIF antes de subir las imágenes es una medida básica de higiene digital.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las redes sociales eliminan automáticamente los metadatos EXIF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de las grandes plataformas (Instagram, Facebook, X/Twitter) eliminan o reducen los metadatos EXIF al subir una imagen. Sin embargo, no todas lo hacen de forma sistemática: algunas conservan parte de los datos, especialmente cuando se comparte el archivo original en lugar de una foto comprimida. Para garantizar privacidad, conviene eliminar los metadatos antes de subir la imagen, independientemente de la plataforma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo ver los metadatos EXIF de una foto sin software especial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En Windows puedes ver algunos metadatos haciendo clic derecho sobre la foto, seleccionando Propiedades y luego la pestaña Detalles. En macOS puedes abrir la imagen con Vista Previa y acceder a Herramientas > Mostrar Inspector. También existen herramientas online que analizan el archivo directamente en el navegador sin necesidad de instalar nada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Eliminar los metadatos EXIF afecta a la calidad de la imagen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Los metadatos EXIF son información adicional almacenada junto a los píxeles de la imagen, pero no forman parte de la imagen en sí. Eliminarlos no altera ningún píxel ni reduce la resolución, el color ni la nitidez de la foto. El archivo resultante puede ser ligeramente más pequeño en kilobytes, pero visualmente es idéntico al original.',
      },
    },
  ],
};

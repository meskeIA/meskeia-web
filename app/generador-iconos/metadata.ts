import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Iconos PWA - Crea Favicon y App Icons | meskeIA',
  description: 'Genera todos los tamaños de iconos necesarios para tu PWA, favicon y aplicaciones móviles. 12 tamaños automáticos, múltiples formatos, descarga como ZIP.',
  keywords: 'generador iconos, pwa icons, favicon generator, app icons, manifest icons, apple touch icon, android chrome, iconos web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Iconos PWA - meskeIA',
    description: 'Crea todos los iconos que necesitas para tu aplicación web progresiva en segundos',
    url: 'https://meskeia.com/generador-iconos/',
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
    title: 'Generador de Iconos PWA - meskeIA',
    description: 'Genera iconos PWA, favicon y app icons automáticamente',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Iconos PWA",
  description: "Genera todos los tamaños de iconos necesarios para tu PWA, favicon y aplicaciones móviles. 12 tamaños automáticos, múltiples formatos, descarga como ZIP.",
  url: "https://meskeia.com/generador-iconos/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tamaños de icono necesito para una PWA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una PWA necesita al menos los tamaños 192×192 y 512×512 píxeles para el manifest.json, más un favicon de 32×32 o 16×16. Para compatibilidad completa con iOS se recomienda el apple-touch-icon de 180×180. Lo ideal es generar todos los tamaños estándar de una vez a partir de una imagen de alta resolución (mínimo 512×512).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un favicon y un icono de PWA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El favicon es el pequeño icono que aparece en la pestaña del navegador, normalmente en formato .ico o PNG de 16×16 a 32×32 píxeles. Los iconos de PWA son los que se muestran cuando el usuario instala la aplicación en su dispositivo móvil u ordenador, y deben tener tamaños mayores (192×192, 512×512). Ambos se generan habitualmente desde la misma imagen fuente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué formato debo guardar los iconos de mi aplicación web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El formato PNG es el más recomendado para iconos de aplicaciones web porque admite transparencia y no pierde calidad. Para favicons también se usa .ico (que puede contener múltiples tamaños en un solo archivo). WebP es más ligero pero tiene compatibilidad limitada como icono de PWA. SVG funciona bien para favicons modernos pero no se admite en todos los contextos de icono de aplicación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo añado los iconos generados a mi proyecto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Después de descargar el ZIP con los iconos, copia los archivos PNG a la carpeta pública de tu proyecto (por ejemplo /public en Next.js o /static en otros frameworks). Luego referencia cada tamaño en tu manifest.json dentro del array "icons" y añade las etiquetas <link rel="apple-touch-icon"> y <link rel="icon"> en el <head> de tu HTML.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué resolución mínima debe tener la imagen de origen para generar buenos iconos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La imagen de origen debe tener al menos 512×512 píxeles para garantizar que el icono más grande de la PWA tenga buena nitidez. Lo ideal es partir de 1024×1024 o superior. Si la imagen fuente es más pequeña que el tamaño de salida, el resultado quedará pixelado. Se recomienda usar un PNG con fondo transparente para obtener iconos con bordes limpios en todos los dispositivos.',
      },
    },
  ],
};

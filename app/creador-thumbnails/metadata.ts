import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Creador de Thumbnails YouTube - Diseña miniaturas atractivas gratis | meskeIA',
  description: 'Crea thumbnails profesionales para YouTube gratis. Editor visual con texto personalizable, formas, emojis y exportación PNG en 1280x720. Sin registro.',
  keywords: 'thumbnails youtube, miniaturas youtube, crear thumbnails, editor thumbnails, diseñar miniaturas, 1280x720, portadas youtube, carátulas videos, gratis, online',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Creador de Thumbnails YouTube - meskeIA',
    description: 'Diseña thumbnails profesionales para tus videos de YouTube. Editor visual gratuito con texto, formas, emojis y exportación PNG.',
    url: 'https://meskeia.com/creador-thumbnails/',
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
    title: 'Creador de Thumbnails YouTube - meskeIA',
    description: 'Diseña thumbnails profesionales para YouTube gratis. Editor visual intuitivo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Creador de Thumbnails meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Creador de Thumbnails YouTube",
  description: "Crea thumbnails profesionales para YouTube gratis. Editor visual con texto personalizable, formas, emojis y exportación PNG en 1280x720. Sin registro.",
  url: "https://meskeia.com/creador-thumbnails/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es el tamaño recomendado para un thumbnail de YouTube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'YouTube recomienda 1280×720 píxeles con una relación de aspecto 16:9, que es el formato estándar HD. El archivo no debe superar 2 MB y los formatos aceptados son JPG, PNG, GIF y BMP. El editor genera la imagen directamente en 1280×720 px lista para subir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hace que un thumbnail consiga más clics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los thumbnails con mayor CTR suelen combinar tres elementos: un rostro con expresión emocional visible (aumenta la conexión humana), texto en negrita de 3–5 palabras que promete un beneficio concreto, y contraste de color elevado para destacar en el feed. Evitar fondos blancos y usar tipografías grandes mejora la legibilidad en dispositivos móviles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo exportar el thumbnail creado como archivo PNG?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El editor permite exportar la miniatura en formato PNG a 1280×720 píxeles con un solo clic, sin marcas de agua ni registro previo. El archivo queda listo para subir directamente al panel de YouTube al publicar o editar el vídeo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en aprender a usar un editor de thumbnails online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de creadores diseña su primer thumbnail en menos de 5 minutos usando un editor visual con plantillas. No se necesitan conocimientos de diseño gráfico: basta con elegir un fondo o color, añadir texto y ajustar el tamaño. La curva de aprendizaje es mínima comparada con herramientas profesionales como Photoshop.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre diseñar thumbnails online y usar Canva o Photoshop?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las herramientas online especializadas en thumbnails son más rápidas para casos concretos: exportan al tamaño exacto de YouTube sin configuración, funcionan sin instalación y son gratuitas. Canva ofrece más plantillas y elementos de diseño. Photoshop proporciona control total pero requiere conocimientos avanzados y suscripción de pago.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lupa Digital Online - Amplía con la Cámara Gratis | meskeIA',
  description: 'Lupa digital gratuita que usa la cámara de tu dispositivo para ampliar texto, objetos pequeños y detalles. Ideal para leer letra pequeña y accesibilidad.',
  keywords: 'lupa digital, lupa online, ampliar cámara, lupa gratis, magnificador, zoom cámara, accesibilidad, leer letra pequeña',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lupa Digital Online - Amplía con la Cámara',
    description: 'Lupa digital gratuita que usa la cámara para ampliar texto y objetos pequeños.',
    url: 'https://meskeia.com/lupa-digital/',
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
    title: 'Lupa Digital Online - Amplía con la Cámara',
    description: 'Lupa digital gratuita que usa la cámara para ampliar texto y objetos pequeños.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Lupa Digital con Cámara",
  description: "Lupa digital gratuita que usa la cámara de tu dispositivo para ampliar texto, objetos pequeños y detalles. Ideal para leer letra pequeña y accesibilidad.",
  url: "https://meskeia.com/lupa-digital/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona la lupa digital online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lupa digital accede a la cámara de tu dispositivo (móvil, tablet u ordenador con webcam) y muestra la imagen en pantalla con el nivel de ampliación que elijas. A diferencia del zoom óptico de una lupa física, aplica ampliación digital sobre la imagen de la cámara en tiempo real, permitiendo ver con mayor detalle textos pequeños, etiquetas, componentes electrónicos o cualquier objeto que coloquen frente al objetivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué casos es útil la lupa digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para leer letra pequeña en prospectos de medicamentos, contratos, facturas o etiquetas de productos. También para personas con baja visión que necesitan apoyo de magnificación, para inspeccionar detalles de joyería, electrónica o piezas pequeñas, o simplemente cuando no se tiene a mano gafas de lectura y se necesita ampliar algo rápidamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar algo en mi móvil u ordenador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No requiere instalación. Funciona directamente desde el navegador web en cualquier dispositivo con cámara. Solo tienes que abrir la herramienta y aceptar el permiso de acceso a la cámara. Es compatible con Chrome, Firefox, Safari y Edge en versiones recientes, tanto en Android e iOS como en ordenadores de escritorio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia de la lupa de accesibilidad del sistema operativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lupa del sistema operativo (como la lupa de Windows o la función de accesibilidad de iOS/Android) amplía el contenido de la pantalla, no lo que hay físicamente frente a la cámara. Esta lupa digital amplía el mundo real a través de la cámara, lo que la hace útil para documentos físicos, objetos y entornos, no para contenido digital que ya está en pantalla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo congelar la imagen para leer con más comodidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la herramienta incluye la opción de pausar (congelar) la imagen de la cámara para que puedas leer el texto ampliado sin tener que sostener el dispositivo quieto. Esta función es muy práctica para leer etiquetas de medicamentos, números de serie o instrucciones impresas en letra muy pequeña.',
      },
    },
  ],
};

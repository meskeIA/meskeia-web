import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Carruseles para Redes Sociales - Instagram y LinkedIn | meskeIA',
  description: 'Crea carruseles profesionales para Instagram y LinkedIn gratis. Diseña slides con texto, elige entre 5 plantillas, personaliza colores y descarga como imágenes PNG. Sin registro.',
  keywords: 'generador carruseles, carrusel instagram, carrusel linkedin, crear slides redes sociales, posts instagram, contenido linkedin, marketing visual, gratis, sin registro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Carruseles para Redes Sociales | meskeIA',
    description: 'Crea carruseles profesionales para Instagram y LinkedIn. Diseña slides, personaliza colores y descarga como imágenes PNG gratis.',
    url: 'https://meskeia.com/generador-carruseles/',
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
    title: 'Generador de Carruseles para Redes Sociales | meskeIA',
    description: 'Crea carruseles profesionales para Instagram y LinkedIn gratis. Sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador de Carruseles meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Carruseles",
  description: "Crea carruseles profesionales para Instagram y LinkedIn gratis. Diseña slides con texto, elige entre 5 plantillas, personaliza colores y descarga como imágenes PNG. Sin registro.",
  url: "https://meskeia.com/generador-carruseles/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un carrusel en redes sociales y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un carrusel es un formato de publicación que permite incluir varias imágenes o diapositivas en un mismo post que el usuario puede deslizar. En Instagram y LinkedIn es uno de los formatos con mayor alcance orgánico porque incentiva la interacción (swipe) y genera más tiempo de permanencia en la publicación. Se usa habitualmente para presentar procesos paso a paso, listas, datos estadísticos, guías visuales o historias de marca.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas diapositivas debe tener un carrusel para Instagram o LinkedIn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Instagram permite hasta 10 diapositivas por carrusel, mientras que LinkedIn acepta hasta 300 páginas en un documento PDF. Para el rendimiento óptimo, los estudios de marketing de contenidos sugieren entre 5 y 10 slides: suficientes para desarrollar un tema con profundidad, pero sin saturar al lector. La primera slide es la más crítica porque determina si alguien hace swipe o no.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo descargo el carrusel que he creado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una vez diseñadas todas las diapositivas, el generador permite descargar cada slide como imagen PNG de alta resolución directamente desde el navegador, sin necesidad de registrarse ni instalar ningún programa. Las imágenes descargadas están listas para subirse a Instagram o LinkedIn de forma individual o como álbum.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre crear un carrusel con este generador y usar Canva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este generador está enfocado en la rapidez y la simplicidad: en pocos minutos tienes un carrusel coherente con plantillas preconfiguradas, sin necesidad de cuenta ni suscripción. Canva ofrece mayor flexibilidad de diseño (fuentes, elementos gráficos, fotos de stock) pero requiere registro y algunas funcionalidades avanzadas son de pago. Para publicaciones frecuentes con texto y estructura clara, un generador especializado suele ser más ágil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tamaño de imagen debo usar para un carrusel de Instagram?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Instagram recomienda imágenes cuadradas de 1080 × 1080 píxeles (relación 1:1) para carruseles, aunque también acepta el formato vertical 1080 × 1350 px (4:5) que ocupa más espacio en el feed. Para LinkedIn, el formato más habitual en documentos es A4 o 1080 × 1080 px. Usar imágenes con las dimensiones correctas evita recortes automáticos y garantiza la máxima calidad visual.',
      },
    },
  ],
};

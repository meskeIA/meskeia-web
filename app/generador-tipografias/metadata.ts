import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Tipografías Web - Google Fonts Preview | meskeIA',
  description: 'Explora y compara tipografías web. Vista previa de Google Fonts populares, ajusta tamaños, pesos y estilos. Código CSS listo para copiar.',
  keywords: 'generador tipografías, Google Fonts, fuentes web, font preview, CSS typography, web fonts',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Tipografías Web - meskeIA',
    description: 'Explora y compara tipografías web con vista previa en vivo',
    url: 'https://meskeia.com/generador-tipografias/',
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
  name: 'Generador de Tipografías Web - Google Fonts Preview',
  description: 'Explora y compara tipografías web. Vista previa de Google Fonts populares, ajusta tamaños, pesos y estilos. Código CSS listo para copiar.',
  url: 'https://meskeia.com/generador-tipografias/',
  category: 'UtilityApplication',
  features: [
    'Vista previa de Google Fonts más populares',
    'Ajuste de tamaño, peso, interlineado y espaciado',
    'Comparación de dos tipografías en paralelo',
    'Código CSS de importación listo para copiar',
    'Gratuito, en español, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las tipografías web y cómo funcionan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tipografías web (web fonts) son fuentes tipográficas que se cargan desde un servidor cuando el usuario visita una web, en lugar de depender de las fuentes instaladas en el sistema operativo. Se integran con @font-face en CSS o mediante servicios como Google Fonts. Permiten usar cualquier tipografía de forma consistente en todos los dispositivos, garantizando que el diseño se muestre exactamente como fue diseñado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo añadir Google Fonts a una web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para añadir Google Fonts: 1) Ve a fonts.google.com y selecciona la fuente. 2) Haz clic en "Get font" y luego en "Get embed code". 3) Copia el tag <link> y pégalo en el <head> de tu HTML. 4) En tu CSS usa font-family: \'Nombre Fuente\', sans-serif. Alternativamente puedes importar en CSS con @import url(\'https://fonts.googleapis.com/css2?family=...\').',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipografías son más legibles para web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para textos de cuerpo las más legibles son sans-serif: Inter, Roboto, Open Sans y Lato destacan por su claridad en pantallas. Para títulos funcionan bien fuentes con personalidad como Playfair Display o Montserrat. Para código, JetBrains Mono o Fira Code son las preferidas. Para accesibilidad y dislexia, OpenDyslexic o Lexie Readable están diseñadas específicamente para mejorar la lectura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el peso tipográfico y cuáles son los valores comunes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El peso tipográfico (font-weight) determina el grosor de los trazos. Los valores numéricos van de 100 a 900 en pasos de 100. Los más usados son: 300 (Light), 400 (Regular/Normal), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold). No todas las fuentes incluyen todos los pesos; usar un peso no disponible hace que el navegador simule el resultado, con peor calidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo combinar tipografías en un diseño web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla básica es usar máximo 2-3 tipografías: una para títulos y otra para cuerpo. Combina fuentes con personalidades complementarias: una serif con una sans-serif, o una fuente con personalidad para títulos con una neutra para texto largo. Buen ejemplo: Playfair Display (títulos) + Source Sans Pro (cuerpo). Evita combinar dos fuentes similares o con la misma personalidad, ya que genera confusión visual.',
      },
    },
  ],
};

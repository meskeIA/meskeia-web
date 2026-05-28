import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Imágenes OG para Redes Sociales | meskeIA',
  description: 'Crea imágenes Open Graph (OG) profesionales para Facebook, Twitter, LinkedIn y WhatsApp. Plantillas listas, editor visual y exportación 1200x630 px.',
  keywords: 'og image, open graph, meta tags, redes sociales, facebook preview, twitter card, linkedin image, whatsapp preview, generador imagenes, social media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Imágenes OG para Redes Sociales',
    description: 'Crea imágenes Open Graph profesionales para compartir en redes sociales. Editor visual con plantillas.',
    url: 'https://meskeia.com/generador-og-images/',
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
    title: 'Generador de Imágenes OG',
    description: 'Crea imágenes profesionales para Facebook, Twitter, LinkedIn y WhatsApp.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador OG Images meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador Imágenes OG",
  description: "Crea imágenes Open Graph (OG) profesionales para Facebook, Twitter, LinkedIn y WhatsApp. Plantillas listas, editor visual y exportación 1200x630 px.",
  url: "https://meskeia.com/generador-og-images/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una imagen Open Graph (OG) y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una imagen Open Graph es la vista previa visual que aparece cuando se comparte un enlace en redes sociales como Facebook, LinkedIn, WhatsApp o Telegram. Se define mediante la etiqueta meta og:image en el HTML de la página. Sin ella, la red social escoge una imagen aleatoria, lo que suele generar previsualizaciones poco atractivas que reducen el número de clics.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las dimensiones correctas para una imagen OG?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tamaño recomendado es 1200×630 píxeles con relación de aspecto 1,91:1, que es el estándar aceptado por Facebook, LinkedIn, Twitter/X y WhatsApp. El archivo debe pesar menos de 8 MB en JPG o PNG. El editor genera la imagen directamente en esas dimensiones para subir al servidor sin reescalar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo añado la imagen OG a mi web o blog?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una vez generada y subida a tu servidor, añade la etiqueta <meta property="og:image" content="https://tudominio.com/imagen-og.png"> dentro del <head> del HTML. En WordPress basta con instalar un plugin SEO (Yoast, Rank Math) e indicar la URL de la imagen. En Next.js se configura en el objeto openGraph de la metadata.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Una misma imagen OG sirve para todas las redes sociales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La imagen OG estándar (1200×630 px) funciona en Facebook, LinkedIn y WhatsApp. Twitter/X usa la misma imagen si se especifica con twitter:image, aunque puede recortarla según el tipo de tarjeta (summary_large_image o summary). Para Pinterest existen propiedades adicionales pero la imagen OG sirve como fallback.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia debo actualizar la imagen OG de mis páginas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se recomienda actualizar la imagen OG cuando cambies el contenido principal de la página, la gráfica de campaña o el nombre del producto. Las redes sociales cachean las previsualizaciones durante días o semanas; puedes forzar la actualización en Facebook con la herramienta "Depurador de URLs" y en LinkedIn con el Inspector de publicaciones, ambas gratuitas.',
      },
    },
  ],
};

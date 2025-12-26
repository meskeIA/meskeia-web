import { Metadata } from 'next';

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
    url: 'https://meskeia.com/generador-og-images',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Imágenes OG',
    description: 'Crea imágenes profesionales para Facebook, Twitter, LinkedIn y WhatsApp.',
  },
  other: {
    'application-name': 'Generador OG Images meskeIA',
  },
};

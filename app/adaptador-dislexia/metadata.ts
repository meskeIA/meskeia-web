import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Adaptador de Lectura para Dislexia - Personaliza tu texto | meskeIA',
  description: 'Herramienta gratuita para adaptar textos y facilitar la lectura a personas con dislexia. Ajusta fuente, tamaño, espaciado, interlineado y color de fondo. Tus preferencias se guardan automáticamente.',
  keywords: 'dislexia, adaptador lectura, fuente dislexia, lexend, texto dislexia, accesibilidad, lectura fácil, espaciado letras, interlineado, dificultad lectura',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Adaptador de Lectura para Dislexia | meskeIA',
    description: 'Personaliza cualquier texto para facilitar la lectura: fuente especial, espaciado amplio, fondo crema y más. Gratis y sin registro.',
    url: 'https://meskeia.com/adaptador-dislexia/',
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
    title: 'Adaptador de Lectura para Dislexia | meskeIA',
    description: 'Ajusta fuente, espaciado y color de fondo para leer con mayor facilidad. Gratis y sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Adaptador de Lectura para Dislexia",
  description: "Herramienta gratuita para adaptar textos y facilitar la lectura a personas con dislexia. Ajusta fuente, tamaño, espaciado, interlineado y color de fondo. Tus preferencias se guardan automáticamente.",
  url: "https://meskeia.com/adaptador-dislexia/",
  category: 'EducationalApplication',
  features: [],
});

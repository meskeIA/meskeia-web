import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Adaptación del Hogar para Mayores - Checklist y costes | meskeIA',
  description: 'Checklist interactivo de adaptaciones del hogar para mayores y personas con movilidad reducida. Costes orientativos, ítems con ayudas públicas y prioridades por estancia.',
  keywords: 'adaptacion hogar mayores, accesibilidad vivienda, barras apoyo bano, silla salvaescaleras, rampa acceso, ducha accesible, ayudas adaptacion hogar imserso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Adaptación del Hogar para Mayores | meskeIA',
    description: 'Checklist de adaptaciones del hogar: costes estimados, prioridades y ayudas públicas disponibles.',
    url: 'https://meskeia.com/adaptacion-hogar/',
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
    title: 'Adaptación del Hogar para Mayores | meskeIA',
    description: 'Checklist interactivo: adaptaciones accesibles, costes y ayudas públicas',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Adaptación del Hogar meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Adaptación del Hogar",
  description: "Checklist interactivo de adaptaciones del hogar para mayores y personas con movilidad reducida. Costes orientativos, ítems con ayudas públicas y prioridades por estancia.",
  url: "https://meskeia.com/adaptacion-hogar/",
  category: 'FinanceApplication',
  features: [],
});

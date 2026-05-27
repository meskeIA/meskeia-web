import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Asistente de Reclamaciones al Consumidor - meskeIA',
  description: 'Guía interactiva para reclamar tus derechos como consumidor en España. Árbol de decisión, plazos legales, organismos y modelos de carta.',
  keywords: 'reclamaciones consumidor, derechos consumidor España, OMIC, hoja de reclamaciones, garantía productos, devoluciones, derecho desistimiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Asistente de Reclamaciones al Consumidor - meskeIA',
    description: 'Guía interactiva para reclamar tus derechos como consumidor en España',
    url: 'https://meskeia.com/asistente-reclamaciones/',
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
    title: 'Asistente de Reclamaciones al Consumidor',
    description: 'Guía interactiva para reclamar tus derechos como consumidor en España',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Asistente de Reclamaciones al Consumidor",
  description: "Guía interactiva para reclamar tus derechos como consumidor en España. Árbol de decisión, plazos legales, organismos y modelos de carta.",
  url: "https://meskeia.com/asistente-reclamaciones/",
  category: 'EducationalApplication',
  features: [],
});

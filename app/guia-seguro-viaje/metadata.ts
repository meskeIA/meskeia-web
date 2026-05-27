import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Seguro de Viaje - Qué Cobertura Necesitas según Destino | meskeIA',
  description: 'Descubre qué coberturas de seguro de viaje necesitas según tu destino y tipo de viaje. Checklist completo de 12 puntos para verificar antes de contratar cualquier póliza.',
  keywords: 'seguro viaje, cobertura viaje, gastos medicos viaje, repatriacion, cancelacion viaje, TSJE tarjeta sanitaria europea, equipaje viaje, seguro aventura, checklist seguro viaje',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Seguro de Viaje según Destino | meskeIA',
    description: 'Qué cobertura necesitas según tu destino y tipo de viaje. Checklist completo antes de contratar.',
    url: 'https://meskeia.com/guia-seguro-viaje/',
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
    title: 'Guía de Seguro de Viaje | meskeIA',
    description: 'Coberturas recomendadas según destino y tipo de viaje. Checklist antes de contratar.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Seguro de Viaje meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Guía de Seguro de Viaje",
  description: "Descubre qué coberturas de seguro de viaje necesitas según tu destino y tipo de viaje. Checklist completo de 12 puntos para verificar antes de contratar cualquier póliza.",
  url: "https://meskeia.com/guia-seguro-viaje/",
  category: 'FinanceApplication',
  features: [],
});

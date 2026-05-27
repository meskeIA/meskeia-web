import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Tarifa Freelance - Calcula tu Precio por Hora | meskeIA',
  description: 'Calcula tu tarifa freelance ideal considerando gastos, impuestos, vacaciones y margen de beneficio. Herramienta gratuita para autónomos y freelancers en España.',
  keywords: 'tarifa freelance, precio por hora, freelancer, autonomo, honorarios, calcular tarifa, cuanto cobrar, presupuesto freelance',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Tarifa Freelance | meskeIA',
    description: 'Descubre cuánto deberías cobrar como freelance. Calcula tu tarifa hora/día/proyecto considerando todos los gastos e impuestos.',
    url: 'https://meskeia.com/orientador-tarifa-freelance/',
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
    title: 'Orientador Tarifa Freelance | meskeIA',
    description: 'Herramienta gratuita para calcular tu tarifa freelance ideal. Evita cobrar de menos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Tarifa Freelance",
  description: "Calcula tu tarifa freelance ideal considerando gastos, impuestos, vacaciones y margen de beneficio. Herramienta gratuita para autónomos y freelancers en España.",
  url: "https://meskeia.com/orientador-tarifa-freelance/",
  category: 'BusinessApplication',
  features: [],
});

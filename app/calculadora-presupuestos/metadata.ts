import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Presupuestos Freelance - Genera Presupuestos Profesionales | meskeIA',
  description: 'Crea presupuestos profesionales para clientes: servicios, horas, materiales, descuentos. Exporta a PDF. Completa el flujo freelance: presupuesto → trabajo → factura. 100% gratis.',
  keywords: 'presupuesto freelance, generador presupuestos, cotización servicios, presupuesto autónomo, calculadora presupuesto, precio proyecto, tarifa freelance, propuesta comercial',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Presupuestos Freelance | meskeIA',
    description: 'Crea presupuestos profesionales para tus clientes. Servicios, horas, materiales y descuentos. Exporta a PDF.',
    url: 'https://meskeia.com/calculadora-presupuestos/',
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
    title: 'Calculadora de Presupuestos Freelance | meskeIA',
    description: 'Crea presupuestos profesionales para tus clientes. Servicios, horas, materiales y descuentos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Presupuestos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Presupuestos",
  description: "Crea presupuestos profesionales para clientes: servicios, horas, materiales, descuentos. Exporta a PDF. Completa el flujo freelance: presupuesto → trabajo → factura. 100% gratis.",
  url: "https://meskeia.com/calculadora-presupuestos/",
  category: 'BusinessApplication',
  features: [],
});

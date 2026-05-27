import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Rentabilidad de Alquiler - ROI Inversión Inmobiliaria | meskeIA',
  description: 'Calcula la rentabilidad bruta y neta de una inversión inmobiliaria en alquiler. ROI, cash flow mensual, payback y análisis completo de gastos: IBI, comunidad, seguro, reparaciones.',
  keywords: 'rentabilidad alquiler, roi inmobiliario, inversion inmobiliaria, comprar para alquilar, yield alquiler, cash flow alquiler, rentabilidad piso, inversion vivienda, roi vivienda, retorno inversion inmueble',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Rentabilidad Alquiler - meskeIA',
    description: 'Calcula el ROI real de tu inversión inmobiliaria: bruto, neto y cash flow mensual',
    url: 'https://meskeia.com/calculadora-rentabilidad-alquiler/',
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
    title: 'Calculadora Rentabilidad Alquiler - meskeIA',
    description: '¿Es rentable comprar un piso para alquilar? Calcula el ROI real',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Rentabilidad de Inversión en Alquiler",
  description: "Calcula la rentabilidad bruta y neta de una inversión inmobiliaria en alquiler. ROI, cash flow mensual, payback y análisis completo de gastos: IBI, comunidad, seguro, reparaciones.",
  url: "https://meskeia.com/calculadora-rentabilidad-alquiler/",
  category: 'FinanceApplication',
  features: [],
});

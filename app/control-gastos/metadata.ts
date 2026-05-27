import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Control de Gastos Mensual - Gestiona tu Presupuesto | meskeIA',
  description: 'Controla tus gastos mensuales por categorías. Registra ingresos y gastos, visualiza estadísticas y gestiona tu presupuesto familiar de forma sencilla.',
  keywords: 'control gastos, presupuesto mensual, gestión gastos, finanzas personales, ahorro, categorías gastos, presupuesto familiar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Control de Gastos Mensual | meskeIA',
    description: 'Gestiona tu presupuesto con categorías y estadísticas visuales.',
    url: 'https://meskeia.com/control-gastos/',
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
    title: 'Control de Gastos Mensual | meskeIA',
    description: 'Controla y visualiza tus gastos mensuales por categorías.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Control de Gastos",
  description: "Controla tus gastos mensuales por categorías. Registra ingresos y gastos, visualiza estadísticas y gestiona tu presupuesto familiar de forma sencilla.",
  url: "https://meskeia.com/control-gastos/",
  category: 'FinanceApplication',
  features: [],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calendario Fiscal del Emprendedor - Fechas y Modelos Tributarios | meskeIA',
  description: 'Calendario fiscal 2025 para autónomos y sociedades en España. Fechas límite de declaraciones, modelos tributarios (303, 130, 111, 200), recordatorios y estimador de pagos.',
  keywords: 'calendario fiscal, fechas declaraciones, modelo 303, modelo 130, modelo 111, modelo 200, IVA trimestral, IRPF, impuesto sociedades, autónomo, pyme, obligaciones fiscales, hacienda, AEAT, plazos tributarios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calendario Fiscal del Emprendedor - meskeIA',
    description: 'Calendario fiscal completo para autónomos y sociedades. Fechas límite, modelos tributarios y recordatorios.',
    url: 'https://meskeia.com/calendario-fiscal-emprendedor/',
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
    title: 'Calendario Fiscal del Emprendedor - meskeIA',
    description: 'Todas las fechas fiscales para autónomos y sociedades en España. No te pierdas ninguna declaración.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calendario Fiscal meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calendario Fiscal Emprendedor",
  description: "Calendario fiscal 2025 para autónomos y sociedades en España. Fechas límite de declaraciones, modelos tributarios (303, 130, 111, 200), recordatorios y estimador de pagos.",
  url: "https://meskeia.com/calendario-fiscal-emprendedor/",
  category: 'FinanceApplication',
  features: [],
});

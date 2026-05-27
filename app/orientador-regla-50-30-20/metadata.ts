import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Regla 50/30/20 - Distribuye tu Presupuesto | meskeIA',
  description: 'Aplica la regla 50/30/20 de Elizabeth Warren para distribuir tus ingresos: 50% necesidades, 30% deseos, 20% ahorro. Organiza tu presupuesto mensual.',
  keywords: 'regla 50 30 20, presupuesto, finanzas personales, distribuir ingresos, ahorro, necesidades, deseos, elizabeth warren',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Regla 50/30/20 | meskeIA',
    description: 'Distribuye tus ingresos según la regla 50/30/20: necesidades, deseos y ahorro',
    url: 'https://meskeia.com/orientador-regla-50-30-20/',
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
    title: 'Orientador Regla 50/30/20 | meskeIA',
    description: 'Distribuye tus ingresos según la regla 50/30/20: necesidades, deseos y ahorro',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Regla 50/30/20",
  description: "Aplica la regla 50/30/20 de Elizabeth Warren para distribuir tus ingresos: 50% necesidades, 30% deseos, 20% ahorro. Organiza tu presupuesto mensual.",
  url: "https://meskeia.com/orientador-regla-50-30-20/",
  category: 'FinanceApplication',
  features: [],
});

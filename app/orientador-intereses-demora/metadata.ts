import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Intereses de Demora 2025 | meskeIA',
  description: 'Oriéntate sobre los intereses que puedes reclamar por facturas impagadas o deudas vencidas. Calcula orientativamente el interés de demora comercial (Ley 3/2004) o civil (art. 1108 CC) en España.',
  keywords: 'intereses demora, ley morosidad, ley 3/2004, intereses facturas impagadas, interes legal dinero, demora comercial, calculo intereses demora España 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Intereses de Demora 2025 — meskeIA',
    description: 'Oriéntate sobre los intereses por facturas impagadas o deudas vencidas. Interés comercial (Ley 3/2004) e interés civil (Código Civil) calculados orientativamente.',
    url: 'https://meskeia.com/orientador-intereses-demora/',
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
    title: 'Orientador de Intereses de Demora 2025',
    description: 'Cuánto puedes reclamar por facturas impagadas: interés comercial (BCE+8pp) e interés civil para España 2025.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador de Intereses de Demora",
  description: "Oriéntate sobre los intereses que puedes reclamar por facturas impagadas o deudas vencidas. Calcula orientativamente el interés de demora comercial (Ley 3/2004) o civil (art. 1108 CC) en España.",
  url: "https://meskeia.com/orientador-intereses-demora/",
  category: 'FinanceApplication',
  features: [],
});

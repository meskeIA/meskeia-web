import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Coste Real a Plazos - Descubre el Precio Oculto | meskeIA',
  description: 'Calcula el coste real de financiar productos a plazos. Descubre la TAE, los intereses ocultos y cuánto pagas de más respecto al precio de contado.',
  keywords: 'coste real plazos, financiacion, TAE, TIN, intereses ocultos, cuotas, precio contado, comprar a plazos, credito consumo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Coste Real a Plazos - meskeIA',
    description: 'Descubre cuánto pagas realmente al financiar productos. Calcula TAE, intereses y coste total vs precio de contado.',
    url: 'https://meskeia.com/estimador-coste-plazos/',
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
    title: 'Estimador Coste Real a Plazos - meskeIA',
    description: 'Descubre el precio oculto de comprar a plazos. Calcula TAE e intereses reales.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Coste Real a Plazos",
  description: "Calcula el coste real de financiar productos a plazos. Descubre la TAE, los intereses ocultos y cuánto pagas de más respecto al precio de contado.",
  url: "https://meskeia.com/estimador-coste-plazos/",
  category: 'FinanceApplication',
  features: [],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Alquiler vs Compra - ¿Qué me conviene más? | meskeIA',
  description: 'Compara alquilar vs comprar vivienda en España. Análisis a 10, 20 y 30 años con hipoteca, IBI, comunidad, seguros y coste de oportunidad de la entrada.',
  keywords: 'alquiler vs compra, comprar piso, alquilar, hipoteca, vivienda, inversion, coste oportunidad, ibi, comunidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Alquiler vs Compra - meskeIA',
    description: '¿Alquilar o comprar? Compara opciones con todos los gastos incluidos',
    url: 'https://meskeia.com/orientador-alquiler-vs-compra/',
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
    title: 'Orientador Alquiler vs Compra - meskeIA',
    description: '¿Alquilar o comprar vivienda? Descúbrelo con números reales',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Alquiler vs Compra",
  description: "Compara alquilar vs comprar vivienda en España. Análisis a 10, 20 y 30 años con hipoteca, IBI, comunidad, seguros y coste de oportunidad de la entrada.",
  url: "https://meskeia.com/orientador-alquiler-vs-compra/",
  category: 'FinanceApplication',
  features: [],
});

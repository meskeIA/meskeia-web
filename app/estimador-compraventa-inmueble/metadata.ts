import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gastos de Compraventa Inmobiliaria - Calculadora | meskeIA',
  description: 'Calcula gastos de compraventa de vivienda, local comercial, nave industrial y terreno en España. ITP/IVA por comunidad autónoma, notaría, registro y plusvalía.',
  keywords: 'simulador compraventa, gastos compra vivienda, ITP por comunidad, gastos notario, registro propiedad, plusvalía municipal, impuestos vivienda, calculadora inmobiliaria, compra local comercial, nave industrial, compra terreno, IVA inmuebles',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/estimador-compraventa-inmueble/',
  },
  openGraph: {
    type: 'website',
    title: 'Estimador Compraventa Inmobiliaria - meskeIA',
    description: 'Calcula todos los gastos de compra y venta de inmuebles en España: ITP, IVA, notaría, registro, plusvalía municipal y comisiones.',
    url: 'https://meskeia.com/estimador-compraventa-inmueble',
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
    title: 'Estimador Compraventa Inmobiliaria',
    description: 'Calcula todos los gastos de compra y venta de inmuebles en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Simulador Compraventa Inmobiliaria meskeIA',
  },
};

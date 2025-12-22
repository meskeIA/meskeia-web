import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Compraventa Inmobiliaria - Calcula Gastos Comprador y Vendedor | meskeIA',
  description: 'Calcula todos los gastos de compraventa de vivienda, garaje o trastero en España. ITP/IVA por comunidad autónoma, notaría, registro, plusvalía municipal y más.',
  keywords: 'simulador compraventa, gastos compra vivienda, ITP por comunidad, gastos notario, registro propiedad, plusvalía municipal, impuestos vivienda, calculadora inmobiliaria, compra piso segunda mano, vivienda nueva IVA',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Compraventa Inmobiliaria - meskeIA',
    description: 'Calcula todos los gastos de compra y venta de inmuebles en España: ITP, IVA, notaría, registro, plusvalía municipal y comisiones.',
    url: 'https://meskeia.com/simulador-compraventa-inmueble',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Compraventa Inmobiliaria',
    description: 'Calcula todos los gastos de compra y venta de inmuebles en España.',
  },
  other: {
    'application-name': 'Simulador Compraventa Inmobiliaria meskeIA',
  },
};

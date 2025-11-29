import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Préstamos - Francés, Alemán y Americano | meskeIA',
  description: 'Compara sistemas de amortización: francés (cuota fija), alemán (amortización constante) y americano. Cuadro completo, TAE vs TIN y comisiones.',
  keywords: 'prestamo, simulador, amortizacion, frances, aleman, americano, cuota, interes, TAE, TIN, cuadro amortizacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Préstamos - Compara Sistemas de Amortización',
    description: 'Calcula y compara préstamos con sistema francés, alemán y americano',
    url: 'https://meskeia.com/simulador-prestamos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Préstamos',
    description: 'Compara sistemas de amortización y calcula tu préstamo ideal',
  },
};

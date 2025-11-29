import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora MCD y MCM Online - Máximo Común Divisor y Mínimo Común Múltiplo | meskeIA',
  description: 'Calculadora de MCD (Máximo Común Divisor) y MCM (Mínimo Común Múltiplo) online y gratuita. Calcula hasta 5 números con explicación paso a paso del método.',
  keywords: 'mcd, mcm, maximo comun divisor, minimo comun multiplo, calcular mcd, calcular mcm, matematicas, divisores, multiplos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora MCD y MCM Online - meskeIA',
    description: 'Calcula el MCD y MCM de varios números con explicación paso a paso.',
    url: 'https://meskeia.com/calculadora-mcd-mcm/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora MCD y MCM Online',
    description: 'Calcula el MCD y MCM de varios números con explicación paso a paso.',
  },
};

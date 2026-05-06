import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Puertas Lógicas - AND, OR, NOT, NAND, XOR | meskeIA',
  description: 'Simulador interactivo de puertas lógicas: tablas de verdad, circuitos predefinidos (Half Adder, Full Adder, Multiplexor) y expresiones booleanas. Para electrónica digital.',
  keywords: 'puertas lógicas, AND, OR, NOT, NAND, NOR, XOR, XNOR, tabla de verdad, circuitos digitales, electrónica digital, álgebra booleana, half adder, full adder, multiplexor, simulador, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-puertas-logicas/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Puertas Lógicas | meskeIA',
    description: 'Tablas de verdad, circuitos predefinidos y expresiones booleanas. Para estudiantes de electrónica digital.',
    url: 'https://meskeia.com/simulador-puertas-logicas',
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
    title: 'Simulador de Puertas Lógicas | meskeIA',
    description: 'Simula puertas lógicas, genera tablas de verdad y prueba circuitos digitales.',
    images: ['https://meskeia.com/og-image.png']
  },
};

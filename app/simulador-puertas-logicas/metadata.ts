import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Puertas Lógicas - AND, OR, NOT, NAND, XOR | meskeIA',
  description: 'Simulador interactivo de puertas lógicas: genera tablas de verdad, prueba circuitos predefinidos (Half Adder, Full Adder, Multiplexor) y evalúa expresiones booleanas. Herramienta educativa para electrónica digital.',
  keywords: 'puertas lógicas, AND, OR, NOT, NAND, NOR, XOR, XNOR, tabla de verdad, circuitos digitales, electrónica digital, álgebra booleana, half adder, full adder, multiplexor, simulador, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Puertas Lógicas | meskeIA',
    description: 'Tablas de verdad, circuitos predefinidos y expresiones booleanas. Para estudiantes de electrónica digital.',
    url: 'https://meskeia.com/simulador-puertas-logicas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Puertas Lógicas | meskeIA',
    description: 'Simula puertas lógicas, genera tablas de verdad y prueba circuitos digitales.',
  },
};

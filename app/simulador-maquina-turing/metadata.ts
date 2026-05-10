import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Máquina de Turing | meskeIA',
  description: 'Simula una máquina de Turing con cinta animada, reglas editables y 4 programas clásicos: incrementador binario, lenguaje aⁿbⁿ, duplicar cadena y palíndromos. Teoría de la Computación.',
  keywords: 'máquina de Turing, Alan Turing, computabilidad, autómatas, lenguajes formales, teoría de la computación, FP informática, universidad, decidible, lenguaje recursivo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-maquina-turing/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Máquina de Turing | meskeIA',
    description: 'Cinta, reglas y 4 programas clásicos animados paso a paso',
    url: 'https://meskeia.com/simulador-maquina-turing/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Máquina de Turing | meskeIA',
    description: 'Aprende computabilidad con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Máquina de Turing',
  description:
    'Simulador interactivo de máquina de Turing con cinta visual, tabla de reglas editable y programas clásicos: incrementador binario, lenguaje aⁿbⁿ, duplicador unario y reconocedor de palíndromos.',
  url: 'https://meskeia.com/simulador-maquina-turing/',
  category: 'EducationalApplication',
  features: [
    'Cinta animada con cabezal y símbolos',
    'Tabla de reglas (transiciones) editable',
    '4 programas predefinidos clásicos',
    'Estados iniciales y finales configurables',
    'Velocidad ajustable y modo paso a paso',
    'Métricas: pasos, símbolos escritos, ACEPTADO/RECHAZADO',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['máquina de Turing', 'computabilidad', 'autómatas', 'teoría computación'],
});

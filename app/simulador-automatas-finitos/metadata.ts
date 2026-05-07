import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Autómatas Finitos DFA y NFA | meskeIA',
  description:
    'Simula autómatas finitos deterministas (DFA) y no deterministas (NFA) con editor visual. Diseña estados y transiciones, prueba cadenas y observa la ejecución animada. Lenguajes formales.',
  keywords:
    'autómatas finitos, DFA NFA, lenguajes regulares, expresiones regulares, ε-transiciones epsilon, teoría computación, lenguajes formales, FP informática, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-automatas-finitos/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Autómatas Finitos DFA y NFA | meskeIA',
    description: 'Editor visual de autómatas con animación de validación de cadenas',
    url: 'https://meskeia.com/simulador-automatas-finitos',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Autómatas Finitos | meskeIA',
    description: 'Aprende lenguajes formales con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Autómatas Finitos DFA y NFA',
  description:
    'Simulador interactivo de autómatas finitos deterministas y no deterministas con editor visual. Diseña estados y transiciones, prueba cadenas, valida en lote y observa la animación símbolo a símbolo.',
  url: 'https://meskeia.com/simulador-automatas-finitos/',
  category: 'EducationalApplication',
  features: [
    'Editor visual de DFA y NFA con drag & drop',
    'Soporte para ε-transiciones (autómatas no deterministas)',
    'Validación animada de cadenas paso a paso',
    'Modo batch: validar múltiples cadenas a la vez',
    '4 ejemplos clásicos predefinidos',
    'Estados iniciales y finales configurables',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['autómatas finitos', 'DFA NFA', 'lenguajes formales', 'teoría computación'],
});

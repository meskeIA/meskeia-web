import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Cosmología: Composición y Destino del Universo — meskeIA',
  description: 'Exploración interactiva de la cosmología: composición del universo (materia bariónica 5%, materia oscura 27%, energía oscura 68%), línea de tiempo cósmica, expansión acelerada, geometría del universo y posibles destinos cósmicos.',
  keywords: [
    'cosmología universo composición',
    'materia oscura energía oscura',
    'Big Bang línea de tiempo cósmica',
    'expansión acelerada constante Hubble',
    'modelo cosmológico estándar ΛCDM',
    'geometría del universo plana abierta cerrada',
    'Big Freeze Big Rip destino universo',
    'fondo cósmico de microondas CMB',
    'tensión de Hubble cosmología',
    'materia bariónica universo observable',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Visualizador de Cosmología: Composición y Destino del Universo — meskeIA',
    description: 'El universo es 5% materia visible, 27% materia oscura y 68% energía oscura. Explora la línea de tiempo cósmica, la expansión acelerada y el destino final del cosmos.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-cosmologia',
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
    title: 'Visualizador de Cosmología: Composición y Destino del Universo',
    description: 'Materia oscura, energía oscura, Big Bang, tensión de Hubble y el destino final del universo — explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Cosmología Universo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Cosmología: Composición y Destino del Universo',
  description: 'Visualizador interactivo de cosmología: tarta del universo (ΛCDM), línea de tiempo cósmica desde el Big Bang hasta hoy, curva de expansión acelerada con slider, geometría cósmica (plana/abierta/cerrada) y posibles destinos del universo (Big Freeze, Big Rip, Big Crunch, Big Bounce).',
  url: 'https://meskeia.com/visualizador-cosmologia/',
  category: 'EducationalApplication',
  features: [
    'Tarta del universo (donut SVG animado): materia bariónica, materia oscura, energía oscura',
    'Línea de tiempo cósmica interactiva desde el Big Bang (t=0) hasta hoy (13.800 Ma)',
    'Curva de expansión acelerada a(t) con slider temporal',
    'Geometría del universo: plana, abierta y cerrada con visualización SVG',
    'Cards de destinos cósmicos: Big Freeze, Big Rip, Big Crunch, Big Bounce',
    'Sección educativa: ΛCDM, materia oscura, energía oscura, tensión de Hubble, CMB',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

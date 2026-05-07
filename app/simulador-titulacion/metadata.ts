import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Titulación Ácido-Base | meskeIA',
  description: 'Titula gota a gota ácidos fuertes/débiles con bases fuertes/débiles. Curva de pH en tiempo real, punto de equivalencia, pKa, indicadores y zona tampón. Química Bachillerato.',
  keywords: 'titulación ácido base, valoración ácido base, curva de pH, punto de equivalencia, indicador fenolftaleína, pKa, Henderson-Hasselbalch, química bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-titulacion/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Titulación Ácido-Base | meskeIA',
    description: 'Titula gota a gota con curva de pH en tiempo real',
    url: 'https://meskeia.com/simulador-titulacion',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Titulación Ácido-Base | meskeIA',
    description: 'Aprende valoraciones con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Titulación Ácido-Base',
  description: 'Simulador interactivo de valoración ácido-base. Configura ácido y base fuertes o débiles, titula gota a gota, observa la curva de pH en tiempo real, el punto de equivalencia y el viraje del indicador.',
  url: 'https://meskeia.com/simulador-titulacion/',
  category: 'EducationalApplication',
  features: [
    '4 tipos de titulación: AF+BF, AD+BF, AF+BD, AD+BD',
    'Bureta animada con goteo controlado',
    'Curva de pH en tiempo real',
    '4 indicadores con su rango de viraje',
    'Cálculo automático del punto de equivalencia',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['titulación', 'valoración', 'pH', 'química bachillerato'],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Ondas e Interferencia | meskeIA',
  description:
    'Simula ondas viajeras, interferencia de 2 fuentes y ondas estacionarias en cuerdas y tubos. Ajusta frecuencia, amplitud, fase y separación. Física Bachillerato y Universidad.',
  keywords:
    'ondas interferencia, ondas estacionarias, doble rendija, superposición ondas, nodos antinodos, armónicos cuerda, frecuencia fundamental, física bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-ondas-interferencia/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Ondas e Interferencia | meskeIA',
    description:
      'Onda viajera, interferencia de 2 fuentes y ondas estacionarias con animación interactiva',
    url: 'https://meskeia.com/simulador-ondas-interferencia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      { url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Ondas e Interferencia | meskeIA',
    description: 'Aprende ondas y superposición con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Ondas e Interferencia',
  description:
    'Simulador interactivo de ondas, interferencia y ondas estacionarias. Ajusta amplitud, frecuencia, velocidad, fase y separación de fuentes; observa patrones 1D y 2D, nodos, antinodos y armónicos.',
  url: 'https://meskeia.com/simulador-ondas-interferencia/',
  category: 'EducationalApplication',
  features: [
    'Onda viajera 1D animada con λ, T y k medidos',
    'Interferencia 2D de 2 fuentes con mapa de color',
    'Ondas estacionarias en cuerda y tubo abierto/cerrado',
    'Hasta 5 modos armónicos visualizables',
    'Patrones predefinidos: doble rendija, fuentes opuestas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['ondas', 'interferencia', 'estacionarias', 'física bachillerato'],
});

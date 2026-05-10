import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Movimiento Circular - MCU y MCNU | meskeIA',
  description: 'Simula el movimiento circular uniforme (MCU) y no uniforme (MCNU). Visualiza velocidad tangencial, aceleración centrípeta y fuerza centrípeta en tiempo real. Física Bachillerato.',
  keywords: 'movimiento circular, MCU, MCNU, velocidad angular, aceleración centrípeta, período, frecuencia, fuerza centrípeta, EBAU, Bachillerato, física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-movimiento-circular/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Movimiento Circular | meskeIA',
    description: 'Animación interactiva de MCU y MCNU con vectores de velocidad y aceleración centrípeta',
    url: 'https://meskeia.com/simulador-movimiento-circular/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Movimiento Circular | meskeIA',
    description: 'Aprende MCU y MCNU con animaciones interactivas y cálculo de magnitudes físicas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Movimiento Circular (MCU y MCNU)',
  description: 'Simulador interactivo de movimiento circular uniforme y no uniforme. Ajusta radio, velocidad angular y masa, observa los vectores de velocidad tangencial y aceleración centrípeta, y obtén período, frecuencia y fuerza centrípeta en tiempo real.',
  url: 'https://meskeia.com/simulador-movimiento-circular/',
  category: 'EducationalApplication',
  features: [
    'Animación 2D del movimiento circular en tiempo real',
    'Modo MCU (uniforme) y MCNU (con aceleración angular)',
    'Vector velocidad tangencial y vector aceleración centrípeta visibles',
    'Cálculo de v, a_c, F_c, T y frecuencia en tiempo real',
    'Soporte dark mode completo',
    'Escala Retina/HiDPI para pantallas de alta resolución',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['movimiento circular', 'MCU', 'MCNU', 'aceleración centrípeta', 'física bachillerato'],
});

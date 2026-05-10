import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Campo Eléctrico - Cargas y Líneas de Campo | meskeIA',
  description: 'Simula el campo eléctrico de cargas puntuales: coloca cargas, observa vectores, líneas de campo y equipotenciales. Calcula E, V, F y U sobre una carga de prueba. Física Bachillerato.',
  keywords: 'campo eléctrico, líneas de campo, equipotenciales, ley de Coulomb, cargas puntuales, dipolo eléctrico, potencial eléctrico, física bachillerato, electrostática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-campo-electrico/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Campo Eléctrico | meskeIA',
    description: 'Coloca cargas puntuales y observa vectores, líneas de campo y equipotenciales en tiempo real',
    url: 'https://meskeia.com/simulador-campo-electrico/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Campo Eléctrico | meskeIA',
    description: 'Aprende electrostática con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Campo Eléctrico',
  description:
    'Simulador interactivo de campos eléctricos y potenciales. Coloca cargas puntuales con clic, observa líneas de campo, equipotenciales, vectores de E y mide fuerza/energía sobre una carga de prueba arrastrable.',
  url: 'https://meskeia.com/simulador-campo-electrico/',
  category: 'EducationalApplication',
  features: [
    'Editor visual de cargas puntuales con clic y arrastre',
    'Líneas de campo, vectores y equipotenciales',
    'Mapa de intensidad |E| con escala de color',
    '4 configuraciones predefinidas (dipolo, cuadrupolo, etc.)',
    'Carga de prueba con cálculo de F, U, E, V',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['campo eléctrico', 'electrostática', 'Coulomb', 'física bachillerato'],
});

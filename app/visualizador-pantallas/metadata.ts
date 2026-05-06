import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona una Pantalla - Tecnología de Displays | meskeIA',
  description: 'Descubre cómo funcionan las pantallas: de CRT a OLED y MicroLED, subpíxeles RGB, resoluciones 4K/8K, luz azul y salud visual. Explicador visual interactivo.',
  keywords: 'pantallas, display, OLED, LCD, CRT, MicroLED, píxel, subpíxel, RGB, resolución 4K, 8K, luz azul, salud visual, PPI, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona una Pantalla - Tecnología de Displays',
    description: 'De CRT a MicroLED: subpíxeles RGB, resoluciones, luz azul y salud visual explicados de forma visual e interactiva.',
    url: 'https://meskeia.com/visualizador-pantallas',
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
    title: 'Cómo Funciona una Pantalla - Tecnología de Displays',
    description: 'Píxeles, resoluciones, OLED vs LCD, luz azul: todo lo que hay detrás de tu pantalla, explicado visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Pantallas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona una Pantalla',
  description: 'Explicador visual interactivo sobre tecnología de pantallas: evolución de CRT a MicroLED, anatomía de un píxel RGB, resoluciones HD a 8K, PPI por dispositivo, luz azul y consejos de salud visual basados en evidencia.',
  url: 'https://meskeia.com/visualizador-pantallas/',
  category: 'EducationalApplication',
  features: [
    'Evolución de tecnologías de display: CRT, LCD, Plasma, OLED, MicroLED',
    'Mezcla interactiva de subpíxeles RGB con combinaciones de color',
    'Comparativa de resoluciones: HD, Full HD, 2K, 4K, 8K con número de píxeles',
    'PPI por dispositivo y resolución angular a distancia',
    'Datos sobre luz azul, regla 20-20-20 y salud visual',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía de una Ciudad - Infraestructura Urbana | meskeIA',
  description: 'Descubre las capas invisibles de una ciudad: tuberías, alcantarillado, metro, transporte, servicios urbanos y presupuesto municipal. Explicador visual interactivo.',
  keywords: 'infraestructura ciudad, tuberías, alcantarillado, metro, servicios urbanos, presupuesto municipal, transporte urbano, urbanismo, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía de una Ciudad - Infraestructura Urbana',
    description: 'Las capas invisibles que hacen funcionar una ciudad: desde las tuberías bajo el suelo hasta el presupuesto municipal.',
    url: 'https://meskeia.com/visualizador-ciudad',
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
    title: 'Anatomía de una Ciudad - Infraestructura Urbana',
    description: 'Tuberías, metro, servicios y presupuesto: todo lo que hace funcionar una ciudad, explicado visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Anatomía Ciudad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía de una Ciudad',
  description: 'Explicador visual interactivo de la infraestructura urbana: capas subterráneas (tuberías, alcantarillado, gas, fibra óptica, metro), transporte, servicios públicos y presupuesto municipal de una ciudad española típica.',
  url: 'https://meskeia.com/visualizador-ciudad/',
  category: 'EducationalApplication',
  features: [
    'Capas subterráneas interactivas con profundidad y antigüedad',
    'Comparativa de transporte urbano: tiempos, CO₂ por modo',
    'Servicios de una ciudad de 1 millón de habitantes',
    'Desglose del presupuesto municipal por partida',
    'Toggle de capas de infraestructura on/off',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

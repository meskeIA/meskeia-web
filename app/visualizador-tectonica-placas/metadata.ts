import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tectónica de Placas - La Tierra que se Mueve Bajo tus Pies | meskeIA',
  description: 'Descubre las placas tectónicas, tipos de bordes, terremotos y volcanes. Escala Richter visualizada y datos fascinantes. Explicador visual interactivo.',
  keywords: 'tectónica de placas, placas tectónicas, terremotos, volcanes, Pangea, escala Richter, subducción, falla, bordes divergentes, convergentes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tectónica de Placas - La Tierra que se Mueve Bajo tus Pies',
    description: 'Placas, bordes, terremotos y volcanes: la geología del planeta explicada visualmente.',
    url: 'https://meskeia.com/visualizador-tectonica-placas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tectónica de Placas - Explicador Visual',
    description: 'De Pangea al Himalaya: por qué la Tierra tiembla, con visualizaciones interactivas.',
  },
  other: { 'application-name': 'Tectónica Placas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tectónica de Placas - La Tierra que se Mueve Bajo tus Pies',
  description: 'Explicador visual interactivo sobre tectónica de placas: 15 placas, 3 tipos de bordes, escala Richter, Cinturón de Fuego y datos geológicos fascinantes.',
  url: 'https://meskeia.com/visualizador-tectonica-placas/',
  category: 'EducationalApplication',
  features: [
    '7 placas principales con dirección de movimiento',
    '3 tipos de bordes con diagramas animados',
    'Escala Richter visualizada con energía equivalente',
    'Timeline de Pangea a la tectónica moderna',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

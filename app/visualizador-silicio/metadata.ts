import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Silicio: De la Arena al Chip y la Ley de Moore | meskeIA',
  description: 'Cómo un semiconductor se convierte en el cerebro de todos los ordenadores. Dopado N/P, unión P-N, fabricación de chips y los límites cuánticos de la Ley de Moore.',
  keywords: ['silicio semiconductor', 'como funciona un chip', 'ley de moore', 'dopado semiconductor', 'union PN diodo', 'fabricacion chips', 'de la arena al chip', 'transistor como funciona'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'El Silicio: De la Arena al Chip',
    description: 'Cómo un semiconductor dopado con fósforo y boro hace posible toda la computación moderna',
    type: 'website',
    url: 'https://meskeia.com/visualizador-silicio',
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
    title: 'El Silicio: De la Arena al Chip',
    description: 'Dopado N/P, unión P-N, fabricación de chips y los límites cuánticos de la Ley de Moore.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Silicio Semiconductor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Silicio: De la Arena al Chip',
  description: 'Visualizador interactivo del semiconductor más importante: bandas de energía, dopado N y P, la unión P-N (diodo), fabricación de chips en 7 pasos y la evolución de la Ley de Moore hasta sus límites cuánticos.',
  url: 'https://meskeia.com/visualizador-silicio/',
  category: 'EducationalApplication',
  features: [
    'Diagrama de bandas de energía: conductor, semiconductor y aislante',
    'Animación interactiva del dopado tipo N (fósforo) y tipo P (boro)',
    'Diagrama de la unión P-N con slider de voltaje de polarización',
    'Infografía del proceso de fabricación: de la arena al chip en 7 pasos',
    'Gráfico de la Ley de Moore en escala logarítmica con datos históricos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

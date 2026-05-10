import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Viaje de tu Basura - Reciclaje y Residuos | meskeIA',
  description: 'Descubre qué pasa con tu basura: contenedores, plantas de reciclaje, tiempos de degradación y datos de reciclaje en España. Explicador visual interactivo.',
  keywords: 'reciclaje, basura, residuos, contenedores, degradación, economía circular, medioambiente, plástico, vidrio, papel, orgánico, España, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Viaje de tu Basura - Reciclaje y Residuos',
    description: 'Qué pasa con cada tipo de residuo: desde el cubo de tu casa hasta su nueva vida como producto reciclado.',
    url: 'https://meskeia.com/visualizador-viaje-basura/',
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
    title: 'El Viaje de tu Basura - Reciclaje y Residuos',
    description: 'Contenedores, plantas de reciclaje, tiempos de degradación y datos de España: todo sobre tus residuos, explicado visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Viaje Basura meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Viaje de tu Basura',
  description: 'Explicador visual interactivo sobre gestión de residuos y reciclaje: qué va en cada contenedor, el viaje de cada tipo de residuo hasta su reciclaje, tiempos de degradación de materiales y datos de reciclaje en España comparados con la UE.',
  url: 'https://meskeia.com/visualizador-viaje-basura/',
  category: 'EducationalApplication',
  features: [
    'Clasificación interactiva de residuos por contenedor',
    'Errores comunes de reciclaje señalados',
    'Flujo completo de cada tipo de residuo: recogida, planta, procesado, nuevo producto',
    'Tiempos de degradación con escala logarítmica visual',
    'Datos de reciclaje en España vs. media europea',
    'Concepto de economía circular explicado visualmente',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

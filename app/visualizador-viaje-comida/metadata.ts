import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Viaje de tu Comida — Sistema Digestivo Explicado | meskeIA',
  description: 'De la boca al intestino grueso: 6 etapas del sistema digestivo con tiempos reales, enzimas, y datos sorprendentes. Biología para Bachillerato.',
  keywords: 'sistema digestivo, digestión, boca, estómago, intestino delgado, intestino grueso, amilasa, pepsina, peristaltismo, absorción nutrientes, biología bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Viaje de tu Comida — Sistema Digestivo Explicado',
    description: 'Sigue el recorrido de un bocado desde la boca hasta la eliminación. 6 etapas, enzimas, tiempos y datos sorprendentes.',
    url: 'https://meskeia.com/visualizador-viaje-comida',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Viaje de tu Comida — Sistema Digestivo',
    description: 'El recorrido completo de un bocado por tu cuerpo. 6 etapas con enzimas, tiempos y datos sorprendentes.',
  },
  other: { 'application-name': 'Viaje Comida meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Viaje de tu Comida — Sistema Digestivo',
  description: 'Explicador visual del sistema digestivo humano. Desde que metes comida en la boca hasta la eliminación: masticación, peristaltismo, ácido clorhídrico, pepsina, vellosidades intestinales, microbiota. Ideal para Biología de Bachillerato.',
  url: 'https://meskeia.com/visualizador-viaje-comida/',
  features: [
    'Timeline visual de 6 etapas del sistema digestivo',
    'Tiempos reales de cada fase (minutos a horas)',
    'Explicación de enzimas digestivas y su función',
    'Datos sorprendentes sobre el sistema digestivo',
    'Navegación paso a paso interactiva',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

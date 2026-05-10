import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tu Jubilación en Perspectiva - Timeline Visual | meskeIA',
  description: 'Visualiza tu vida laboral como una línea temporal: cuántos años cotizas, qué porcentaje de pensión generas y cómo cambia según cuándo empezaste a trabajar.',
  keywords: 'jubilación perspectiva, años cotizados, porcentaje pensión, vida laboral, timeline jubilación, explicador visual, seguridad social',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu Jubilación en Perspectiva - Timeline Visual',
    description: 'Timeline interactivo de tu vida laboral: años cotizados, porcentaje de pensión y edad de jubilación.',
    url: 'https://meskeia.com/visualizador-jubilacion-perspectiva/',
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
    title: 'Tu Jubilación en Perspectiva',
    description: 'Visualiza tu carrera laboral y cómo se traduce en pensión.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Jubilación Perspectiva meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu Jubilación en Perspectiva',
  description: 'Explicador visual de la jubilación española: timeline interactivo que muestra cuántos años cotizas según cuándo empiezas, qué porcentaje de pensión generas, y cómo cada año extra de cotización impacta tu pensión futura.',
  url: 'https://meskeia.com/visualizador-jubilacion-perspectiva/',
  features: [
    'Timeline visual de vida laboral desde los 18 a los 67',
    'Cálculo del porcentaje de pensión según años cotizados',
    'Slider de edad de inicio de cotización',
    'Gráfico de evolución del porcentaje de pensión por años',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

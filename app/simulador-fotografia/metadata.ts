import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Fotografía: Triángulo de Exposición (ISO, Apertura, Velocidad) | meskeIA',
  description: 'Simula cómo afectan ISO, apertura y velocidad de obturación a tus fotos. Modo libre y modo compensado. Ve el bokeh, el ruido y el motion blur en tiempo real.',
  keywords: 'simulador fotografía, triángulo exposición, ISO apertura velocidad, profundidad de campo, motion blur, bokeh, fotografía aficionados, aprender fotografía, simulador cámara DSLR',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador del Triángulo de Exposición Fotográfico',
    description: 'Aprende fotografía moviendo ISO, apertura y velocidad. Ve el resultado en una escena sintética interactiva con bokeh, ruido y motion blur.',
    url: 'https://meskeia.com/simulador-fotografia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Triángulo de Exposición Fotográfico',
    description: 'Aprende fotografía moviendo ISO, apertura y velocidad. Resultado visual en tiempo real.',
  },
  other: {
    'application-name': 'Simulador de Fotografía meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Fotografía: Triángulo de Exposición',
  description: 'Simulador interactivo del triángulo de exposición fotográfico. Permite ajustar ISO, apertura y velocidad de obturación y ver el resultado en una escena sintética con efectos reales: bokeh por apertura, ruido por ISO y motion blur por velocidad. Incluye modo libre y modo compensado para entender la relación entre los tres parámetros.',
  url: 'https://meskeia.com/simulador-fotografia/',
  category: 'EducationalApplication',
  features: [
    'Ajuste de los 3 parámetros del triángulo de exposición: ISO, apertura (f-stop) y velocidad de obturación',
    '3 escenas sintéticas: retrato (bokeh), paisaje (nitidez) y deportes (motion blur)',
    'Modo libre: mueve cada parámetro independientemente y observa la exposición resultante',
    'Modo compensado: fija un parámetro y los otros se reajustan automáticamente',
    'Indicador visual de exposición en stops (-3 a +3)',
    'Renderizado sintético en SVG: bokeh real, ruido y motion blur direccional',
    'Bloque educativo con guía paso a paso, casos de uso y errores frecuentes',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});

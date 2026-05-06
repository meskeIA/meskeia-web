import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Solar en Números - Planetas, Distancias y Curiosidades | meskeIA',
  description: 'Explora el sistema solar de forma visual: los 8 planetas con datos clave, comparación a escala, velocidad de la luz y curiosidades. Explicador visual interactivo.',
  keywords: 'sistema solar, planetas, distancias planetas, escala sistema solar, velocidad luz, curiosidades planetas, Júpiter, Saturno, Marte, Tierra, astronomía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Sistema Solar en Números - Planetas, Distancias y Curiosidades',
    description: 'Los 8 planetas, sus distancias a escala, velocidad de la luz y curiosidades sorprendentes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-sistema-solar',
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
    title: 'El Sistema Solar en Números - Explicador Visual',
    description: 'Explora los planetas, sus tamaños a escala, distancias y curiosidades del sistema solar.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema Solar meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Solar en Números - Planetas, Distancias y Curiosidades',
  description: 'Explicador visual interactivo sobre el sistema solar: los 8 planetas con datos clave, comparación de tamaños a escala, velocidad de la luz y tiempos de viaje, y curiosidades sorprendentes.',
  url: 'https://meskeia.com/visualizador-sistema-solar/',
  category: 'EducationalApplication',
  features: [
    'Los 8 planetas con distancia, diámetro, masa, temperatura, lunas y datos curiosos',
    'Comparación a escala: si el Sol fuera un balón, ¿dónde estaría cada planeta?',
    'Tiempos de viaje de la luz y la Voyager 1 por el sistema solar',
    'Curiosidades sorprendentes: Venus gira al revés, Saturno flotaría en agua',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

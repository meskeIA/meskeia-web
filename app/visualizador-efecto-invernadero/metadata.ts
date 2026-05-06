import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Efecto Invernadero - Mecanismo, Gases y Cambio Climático | meskeIA',
  description: 'Entiende el efecto invernadero paso a paso: radiación solar, gases (CO₂, metano, N₂O), diferencia entre efecto natural y antropogénico, datos históricos de CO₂ (280→425 ppm) y soluciones. Explicador visual interactivo.',
  keywords: 'efecto invernadero, CO2, metano, cambio climatico, calentamiento global, gases, radiacion infrarroja, GWP, Acuerdo de Paris, huella de carbono',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Efecto Invernadero - Mecanismo, Gases y Cambio Climático',
    description: 'El mecanismo del efecto invernadero explicado visualmente: radiación solar e infrarroja, los 4 gases principales, natural vs antropogénico, y soluciones.',
    url: 'https://meskeia.com/visualizador-efecto-invernadero',
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
    title: 'El Efecto Invernadero - Explicador Visual Interactivo',
    description: 'CO₂, metano, vapor de agua: cómo funcionan los gases de efecto invernadero y por qué el exceso es el problema.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Efecto Invernadero meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Efecto Invernadero - Mecanismo, Gases y Cambio Climático',
  description: 'Explicador visual interactivo sobre el efecto invernadero: cómo la radiación solar entra, la superficie la reemite como infrarrojo y los gases la atrapan. Comparativa de gases (CO₂, metano, N₂O, vapor de agua), evolución histórica del CO₂, escenarios de calentamiento y soluciones.',
  url: 'https://meskeia.com/visualizador-efecto-invernadero/',
  category: 'EducationalApplication',
  features: [
    'Diagrama SVG del mecanismo: radiación solar → superficie → infrarrojo → gases',
    'Los 4 principales gases: CO₂, metano, N₂O y vapor de agua con GWP comparativo',
    'Evolución histórica del CO₂: de 280 ppm preindustrial a 425 ppm actual',
    'Escenarios de calentamiento: +1,5°C, +2°C y +4°C con consecuencias',
    'Fuentes antropogénicas desglosadas por sector',
    'Huella de carbono media en España (~6 t CO₂/año)',
    'Feedback loops y soluciones (renovables, captura de carbono, reforestación)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

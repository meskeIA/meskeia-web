import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Lentes Ópticas: Trazado de Rayos | meskeIA',
  description: 'Visualiza el trazado de rayos a través de lentes convergentes y divergentes. Mueve el objeto y mira cómo cambian la imagen, su tamaño y si es real o virtual.',
  keywords: 'lentes ópticas, lente convergente, lente divergente, trazado de rayos, imagen real, imagen virtual, distancia focal, aumento, óptica geométrica, EBAU, Bachillerato, física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-lentes-opticas/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Lentes Ópticas | meskeIA',
    description: 'Trazado de rayos en lentes convergentes y divergentes. Mueve el objeto y observa la imagen formada en tiempo real.',
    url: 'https://meskeia.com/simulador-lentes-opticas/',
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
    title: 'Simulador de Lentes Ópticas | meskeIA',
    description: 'Visualiza imágenes reales y virtuales con trazado de rayos en lentes delgadas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Lentes Ópticas',
  description: 'Simulador interactivo de óptica geométrica para lentes delgadas convergentes y divergentes. Visualiza los tres rayos principales (paralelo→F2, centro sin desviar, F1→paralelo) atravesando la lente y formando la imagen del objeto. Permite ajustar la distancia focal f, la distancia objeto s, la altura del objeto h y el tipo de lente. Calcula automáticamente la distancia imagen, el aumento y clasifica la imagen (real/virtual, derecha/invertida, mayor/menor). Ideal para EBAU de Física, Bachillerato y primero de universidad.',
  url: 'https://meskeia.com/simulador-lentes-opticas/',
  category: 'EducationalApplication',
  features: [
    'Trazado en directo de los 3 rayos principales',
    'Lentes convergentes y divergentes',
    'Imagen formada (real o virtual) calculada y dibujada',
    'Sliders interactivos de distancia focal, distancia objeto y altura',
    'Cálculo automático de aumento y clasificación de la imagen',
    'Aplicación de la ecuación de Gauss (1/s + 1/s\' = 1/f)',
    'Funciona 100% en el navegador, gratuito y en español',
    'Ideal para EBAU, Bachillerato y óptica universitaria',
  ],
  keywords: ['lentes ópticas', 'trazado de rayos', 'óptica', 'imagen real', 'imagen virtual', 'EBAU', 'Bachillerato', 'física'],
});

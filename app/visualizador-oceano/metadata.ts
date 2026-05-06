import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Los Números del Océano - Profundidad, Plástico y Clima | meskeIA',
  description: 'Descubre las cifras del océano: 71% de la Tierra, 11 km de profundidad, 8 millones de toneladas de plástico al año. Zonas de profundidad, contaminación y regulación del clima explicados visualmente.',
  keywords: 'océano, profundidad marina, zonas oceánicas, plástico océano, cambio climático mar, Fosa de las Marianas, zona abisal, contaminación marina, coral, nivel del mar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Los Números del Océano - Profundidad, Plástico y Clima',
    description: 'Las cifras del océano que deberías conocer: profundidad, zonas de vida, contaminación por plástico y regulación del clima.',
    url: 'https://meskeia.com/visualizador-oceano',
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
    title: 'Los Números del Océano - Explicador Visual',
    description: '71% de la Tierra, 11 km de profundidad, 8M toneladas de plástico/año. Las cifras del océano.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Océano meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Los Números del Océano - Profundidad, Plástico y Clima',
  description: 'Explicador visual interactivo sobre el océano: cifras clave, zonas de profundidad con vida y condiciones, contaminación por plástico y su papel como regulador del clima terrestre.',
  url: 'https://meskeia.com/visualizador-oceano/',
  category: 'EducationalApplication',
  features: [
    'Cifras del océano con comparaciones proporcionales',
    'Corte vertical: 5 zonas de profundidad con fauna, temperatura y presión',
    'Contaminación por plástico: degradación, islas de basura, países contaminantes',
    'Regulador del clima: absorción de CO2, calor, nivel del mar y coral',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

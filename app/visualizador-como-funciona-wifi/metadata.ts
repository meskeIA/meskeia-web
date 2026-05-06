import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona el WiFi - De las Ondas a tu Pantalla | meskeIA',
  description: 'Descubre cómo funciona el WiFi: ondas electromagnéticas, frecuencias 2.4 vs 5 GHz, propagación por el hogar, obstáculos y consejos. Explicador visual interactivo.',
  keywords: 'como funciona wifi, ondas electromagnéticas, 2.4 GHz, 5 GHz, señal wifi, router, canales wifi, propagación, WiFi 6, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona el WiFi - De las Ondas a tu Pantalla',
    description: 'Ondas, frecuencias, obstáculos y canales: todo sobre el WiFi explicado visualmente.',
    url: 'https://meskeia.com/visualizador-como-funciona-wifi',
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
    title: 'Cómo Funciona el WiFi - Explicador Visual',
    description: 'De las ondas electromagnéticas a tu pantalla: WiFi explicado paso a paso.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'WiFi Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona el WiFi - De las Ondas a tu Pantalla',
  description: 'Explicador visual interactivo sobre el funcionamiento del WiFi: ondas electromagnéticas, frecuencias 2.4 y 5 GHz, propagación en el hogar, canales y evolución tecnológica.',
  url: 'https://meskeia.com/visualizador-como-funciona-wifi/',
  category: 'EducationalApplication',
  features: [
    'Comparativa visual 2.4 GHz vs 5 GHz',
    'Plano interactivo de propagación WiFi en el hogar',
    'Canales WiFi y solapamiento explicados visualmente',
    'Timeline de evolución WiFi hasta WiFi 7',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Regla de los 180° para Vídeo | meskeIA',
  description:
    'Calcula la velocidad de obturación correcta para cualquier frame rate con la regla de los 180°. Motion blur natural y fluido en 24, 25, 30, 50, 60 fps y más.',
  keywords:
    'regla 180 grados video, velocidad obturación fps, motion blur natural, obturador cinematográfico, 24fps 25fps 30fps, filtro ND video',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Regla de los 180° para Vídeo',
    description:
      'Encuentra la velocidad de obturación exacta para cualquier frame rate. Motion blur natural garantizado.',
    url: 'https://meskeia.com/calculadora-regla-180-video/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Regla de los 180° para Vídeo | meskeIA',
    description:
      'Velocidad de obturación correcta para cualquier frame rate. Motion blur cinematográfico garantizado.',
  },
  other: {
    'application-name': 'Calculadora Regla 180° Video meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora Regla de los 180° para Vídeo',
  description:
    'Calcula la velocidad de obturación correcta para cualquier frame rate aplicando la regla de los 180°. Tabla de referencia completa para 24, 25, 30, 48, 50, 60, 90, 120, 180 y 240 fps.',
  url: 'https://meskeia.com/calculadora-regla-180-video/',
  category: 'UtilityApplication',
  features: [
    'Regla de los 180° para cualquier frame rate',
    'Tabla completa de fps comunes y su obturador correcto',
    'Explicación del motion blur natural y por qué funciona',
    'Compatible con 24/25/30/50/60/120 fps y más',
    'Selector rápido de fps comunes y entrada manual',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

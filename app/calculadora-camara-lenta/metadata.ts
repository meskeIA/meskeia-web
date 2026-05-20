import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Cámara Lenta (Slow Motion) | meskeIA',
  description: 'Calcula el factor de ralentización de tu vídeo a cámara lenta. Introduce los fps de grabación y reproducción para obtener el factor slow motion, la velocidad de obturación correcta (regla 180°) y la duración final del clip.',
  keywords: 'calculadora cámara lenta, slow motion fps, factor ralentización vídeo, regla 180 grados video, obturador slow motion, 120fps 240fps 960fps, velocidad obturación grabación, slow motion suave intenso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Cámara Lenta (Slow Motion)',
    description: 'Factor de ralentización, obturador correcto y duración final del clip. Desde slow motion suave hasta ultra slow motion.',
    url: 'https://meskeia.com/calculadora-camara-lenta/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Cámara Lenta (Slow Motion)',
    description: 'Calcula el factor de ralentización y el obturador correcto para slow motion real.',
  },
  other: {
    'application-name': 'Calculadora de Cámara Lenta meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Cámara Lenta (Slow Motion)',
  description: 'Herramienta para calcular el factor de ralentización de vídeo en cámara lenta. A partir de los fps de grabación y reproducción obtiene el multiplicador slow motion, la velocidad de obturación correcta según la regla 180°, el nivel de slow motion y la duración final del clip.',
  url: 'https://meskeia.com/calculadora-camara-lenta/',
  category: 'UtilityApplication',
  features: [
    'Factor de ralentización automático (ej. 4× más lento)',
    'Velocidad de obturación correcta para la grabación (regla 180°)',
    'Duración del clip resultante a partir de la grabación',
    'Niveles de slow motion: suave, marcado, intenso y ultra',
    'Selectores rápidos de fps comunes (60, 90, 120, 240, 480, 960)',
    'Guía educativa completa: interpolación vs slow motion real, casos de uso',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});

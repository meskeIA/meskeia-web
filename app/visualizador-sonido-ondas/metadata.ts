import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sonido y Ondas - Frecuencia, Amplitud y Decibelios | meskeIA',
  description: 'Explora la física del sonido: ondas, frecuencia, amplitud, decibelios, armónicos y timbre. Entiende por qué una guitarra y un piano suenan diferente tocando la misma nota.',
  keywords: 'sonido, ondas, frecuencia, amplitud, decibelios, armónicos, timbre, acústica, física visual, ondas sonoras, espectro audible',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Sonido y Ondas - Frecuencia, Amplitud y Decibelios',
    description: 'Explora la física del sonido: ondas, frecuencia, amplitud, decibelios y timbre. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-sonido-ondas',
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
    title: 'Sonido y Ondas - Explicador Visual Interactivo',
    description: 'Ondas, frecuencia, decibelios y armónicos: la física del sonido explicada visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sonido y Ondas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Sonido y Ondas - Frecuencia, Amplitud y Decibelios',
  description: 'Explicador visual interactivo sobre la física del sonido: anatomía de ondas sonoras, frecuencia y tono, escala de decibelios con niveles de seguridad auditiva, timbre y armónicos que distinguen instrumentos musicales.',
  url: 'https://meskeia.com/visualizador-sonido-ondas/',
  category: 'EducationalApplication',
  features: [
    'Onda sinusoidal interactiva con sliders de frecuencia y amplitud',
    'Rango audible humano y frecuencias de notas musicales',
    'Escala de decibelios con niveles de seguridad auditiva',
    'Timbre y armónicos: por qué cada instrumento suena diferente',
    'Efecto Doppler y resonancia explicados visualmente',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

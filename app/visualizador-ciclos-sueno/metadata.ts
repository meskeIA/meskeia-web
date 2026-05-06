import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Qué Pasa Cuando Duermes - Ciclos y Fases del Sueño | meskeIA',
  description: 'Explora la ciencia del sueño de forma visual: fases N1-N2-N3-REM, hipnograma interactivo, horas necesarias por edad, enemigos del sueño con consejos basados en ciencia. Explicador visual interactivo.',
  keywords: 'ciclos sueno, fases sueno, REM, sueno profundo, hipnograma, higiene sueno, horas dormir, N1 N2 N3, ondas cerebrales, ciencia del sueño',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Qué Pasa Cuando Duermes - Ciclos y Fases del Sueño',
    description: 'Fases del sueño, hipnograma, horas por edad y enemigos del descanso. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-ciclos-sueno',
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
    title: 'Qué Pasa Cuando Duermes - Explicador Visual',
    description: 'La ciencia del sueño explicada visualmente: fases, ciclos, necesidades por edad y enemigos del descanso.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Ciclos Sueño meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Qué Pasa Cuando Duermes - Ciclos y Fases del Sueño',
  description: 'Explicador visual interactivo sobre la ciencia del sueño: las 4 fases (N1, N2, N3, REM), hipnograma de una noche entera, horas necesarias según la edad y los 6 enemigos del sueño con consejos basados en evidencia.',
  url: 'https://meskeia.com/visualizador-ciclos-sueno/',
  category: 'EducationalApplication',
  features: [
    'Las 4 fases del sueño explicadas: ondas cerebrales, temperatura, tono muscular',
    'Hipnograma CSS interactivo de 8 horas con ciclos de 90 minutos',
    'Horas de sueño necesarias por grupo de edad (recién nacido a anciano)',
    '6 enemigos del sueño con medidor de impacto y consejos científicos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

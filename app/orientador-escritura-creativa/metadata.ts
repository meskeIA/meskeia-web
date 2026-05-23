import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Escritura Creativa — ¿Por dónde empezar? | meskeIA',
  description: 'Guía interactiva para escritores principiantes. Elige tu género literario, perspectiva narrativa y recibe tu hoja de ruta personalizada para empezar a escribir con confianza.',
  keywords: 'escritura creativa, como escribir un libro, escritor principiante, género literario, perspectiva narrativa, primera persona, novela, cuento, poesía, memorias',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Escritura Creativa | meskeIA',
    description: 'Elige tu género, perspectiva narrativa y recibe tu hoja de ruta personalizada para empezar a escribir.',
    url: 'https://meskeia.com/orientador-escritura-creativa',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orientador de Escritura Creativa | meskeIA',
    description: 'Guía para escritores principiantes. Elige tu género y obtén tu hoja de ruta personalizada.',
  },
  other: {
    'application-name': 'Orientador de Escritura Creativa meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Escritura Creativa',
  description: 'Guía interactiva para escritores principiantes. Selecciona tu género literario, perspectiva narrativa y recibe una hoja de ruta personalizada con estructura, kit de arranque y errores frecuentes a evitar.',
  url: 'https://meskeia.com/orientador-escritura-creativa/',
  category: 'EducationalApplication',
  features: [
    'Selección de 6 géneros literarios con descripción, extensión y ejemplos',
    'Orientación sobre perspectiva narrativa (1.ª, 3.ª omnisciente, 3.ª limitada, 2.ª persona)',
    'Estructura básica personalizada según el género elegido',
    'Kit de arranque con preguntas clave antes de escribir la primera línea',
    'Errores frecuentes del escritor principiante específicos por género',
    'Hoja de ruta personalizada con tus respuestas del kit de arranque',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

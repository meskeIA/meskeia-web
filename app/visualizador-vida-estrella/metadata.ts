import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Vida de una Estrella - De la Nebulosa al Agujero Negro | meskeIA',
  description: 'Entiende cómo nacen, viven y mueren las estrellas: nebulosas, fusión nuclear, supernovas, enanas blancas, estrellas de neutrones y agujeros negros. Explicador visual interactivo.',
  keywords: 'vida estrella, evolución estelar, supernova, agujero negro, enana blanca, nebulosa, fusión nuclear, diagrama HR, polvo de estrellas, nucleosíntesis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Vida de una Estrella - De la Nebulosa al Agujero Negro',
    description: 'Cómo nacen, viven y mueren las estrellas. Fusión nuclear, supernovas y agujeros negros explicados visualmente.',
    url: 'https://meskeia.com/visualizador-vida-estrella/',
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
    title: 'La Vida de una Estrella - Explicador Visual',
    description: 'El ciclo de vida estelar explicado: del hidrógeno al agujero negro.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Vida Estrella meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Vida de una Estrella - De la Nebulosa al Agujero Negro',
  description: 'Explicador visual interactivo sobre la evolución estelar: cómo nacen las estrellas en nebulosas, viven fusionando hidrógeno, y mueren como enanas blancas, estrellas de neutrones o agujeros negros según su masa.',
  url: 'https://meskeia.com/visualizador-vida-estrella/',
  category: 'EducationalApplication',
  features: [
    'Ciclo completo de vida estelar: nacimiento, vida adulta y muerte',
    'Slider de masa estelar (0,5x a 20x Sol) con efectos visuales',
    'Camino de muerte bifurcado según masa: enana blanca vs agujero negro',
    'Tabla periódica coloreada por origen estelar (Big Bang, estrellas, supernovas)',
    'Diagrama Hertzsprung-Russell simplificado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

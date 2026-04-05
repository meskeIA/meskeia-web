import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Evolución de la Escritura - De las Cuevas al Emoji | meskeIA',
  description: 'Recorre 40.000 años de historia de la escritura: pinturas rupestres, cuneiforme, jeroglíficos, el alfabeto, la imprenta de Gutenberg y los emojis. Explicador visual interactivo.',
  keywords: 'historia escritura, cuneiforme, jeroglíficos, alfabeto fenicio, Gutenberg, imprenta, emojis, evolución escritura, papiro, pergamino, papel',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Evolución de la Escritura',
    description: 'De las pinturas rupestres a los emojis: 40.000 años de historia de la comunicación escrita. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-historia-escritura',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Evolución de la Escritura',
    description: '40.000 años de escritura: cuevas, cuneiforme, alfabetos, Gutenberg y emojis. ¿Estamos volviendo a los pictogramas?',
  },
  other: { 'application-name': 'Historia de la Escritura meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Evolución de la Escritura',
  description: 'Explicador visual interactivo sobre la historia de la escritura: desde la tradición oral y las pinturas rupestres hasta los emojis y la IA generativa. Cuneiforme, jeroglíficos, el alfabeto fenicio, la imprenta de Gutenberg y la revolución digital.',
  url: 'https://meskeia.com/visualizador-historia-escritura/',
  features: [
    'Línea temporal desde las pinturas rupestres (40.000 a.C.) hasta los emojis',
    'Grandes sistemas de escritura: cuneiforme, jeroglíficos, caracteres chinos, alfabeto',
    'La revolución del papel: papiro, pergamino, imprenta, era digital',
    'El futuro de escribir: emojis, IA, voz — ¿volvemos a los pictogramas?',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

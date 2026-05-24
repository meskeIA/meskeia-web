import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Íncipit — Primera Frase para tu Novela o Cuento | meskeIA',
  description: 'Genera la primera frase para tu historia. 62 íncipit organizados por género (novela negra, terror, romántica, aventura, ciencia ficción...) y tono (oscuro, épico, irónico, íntimo...). Incluye incipits reales de grandes autores.',
  keywords: 'generador incipit, primera frase novela, como empezar un cuento, inicio novela, primera linea libro, escritura creativa, incipit literario, primera frase perfecta, como comenzar a escribir',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Íncipit — Primera Frase para tu Novela',
    description: 'Genera tu primera frase. 62 íncipit por género y tono, con incipits reales de Melville, Camus, García Márquez, Kafka y más.',
    url: 'https://meskeia.com/generador-incipit',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Íncipit — Primera Frase para tu Historia',
    description: 'Primera frase para tu novela o cuento. 62 íncipit por género y tono, con ejemplos de grandes autores.',
  },
  other: {
    'application-name': 'Generador de Íncipit meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Íncipit — Primera Frase para tu Novela',
  description: 'Genera la primera frase de tu historia con una colección de 62 íncipit organizados por género literario y tono narrativo. Incluye incipits reales de grandes autores y frases de inspiración para desbloquear el inicio de cualquier texto.',
  url: 'https://meskeia.com/generador-incipit/',
  category: 'EducationalApplication',
  features: [
    '62 íncipit organizados por género literario y tono narrativo',
    'Géneros: literaria, negra, terror, romántica, aventura, ciencia ficción, histórica, infantil-juvenil',
    'Tonos: oscuro, esperanzador, misterioso, humorístico, épico, íntimo, nostálgico, irónico',
    'Incipits reales de Melville, Camus, García Márquez, Kafka, Orwell, Salinger y más',
    'Botón de copia al portapapeles para cada incipit',
    'Generación aleatoria con filtros aplicados',
    'Gratuito, sin registro, en español',
  ],
});

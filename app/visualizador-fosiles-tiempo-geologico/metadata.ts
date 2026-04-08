import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fosiles y Tiempo Geologico - 4.500 Millones de Anos en un Vistazo | meskeIA',
  description: 'Explora las eras geologicas, las 5 grandes extinciones y como se datan los fosiles. Timeline interactivo de 4.500 Ma, analogia del reloj de 24h y metodos de datacion.',
  keywords: 'fosiles, tiempo geologico, eras geologicas, extinciones masivas, datacion fosiles, Cambrico, Mesozoico, Cenozoico, carbono 14, estratigrafia, paleontologia visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Fosiles y Tiempo Geologico - 4.500 Ma en un Vistazo',
    description: 'Timeline interactivo de las eras geologicas, 5 grandes extinciones y metodos de datacion de fosiles.',
    url: 'https://meskeia.com/visualizador-fosiles-tiempo-geologico',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fosiles y Tiempo Geologico - Explicador Visual',
    description: 'Si la Tierra fuera un dia de 24h, los humanos aparecemos en los ultimos 4 segundos.',
  },
  other: { 'application-name': 'Fosiles Geologico meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Fosiles y Tiempo Geologico - 4.500 Millones de Anos en un Vistazo',
  description: 'Explicador visual interactivo sobre las eras geologicas, fosiles representativos, las 5 grandes extinciones masivas y metodos de datacion como carbono-14 y estratigrafia.',
  url: 'https://meskeia.com/visualizador-fosiles-tiempo-geologico/',
  category: 'EducationalApplication',
  features: [
    'Timeline interactivo de 4.500 millones de anos con eras y periodos clickables',
    'Analogia visual: si la Tierra fuera un dia de 24 horas',
    'Las 5 grandes extinciones masivas con barras de impacto',
    'Metodos de datacion: carbono-14, potasio-argon, estratigrafia, fosiles guia',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});

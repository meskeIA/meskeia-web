import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estilos y Movimientos Literarios — Guía Visual | meskeIA',
  description: 'Explora los grandes movimientos literarios: Romanticismo, Realismo, Vanguardias, Boom Latinoamericano y más. Autores representativos, obras clave y fragmentos de ejemplo.',
  keywords: 'movimientos literarios, estilos literarios, romanticismo, realismo, vanguardias, boom latinoamericano, modernismo, existencialismo, literatura universal, autores clásicos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estilos y Movimientos Literarios | meskeIA',
    description: 'Guía visual de los grandes movimientos literarios: autores, obras clave y fragmentos de ejemplo.',
    url: 'https://meskeia.com/visualizador-estilos-literarios',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estilos y Movimientos Literarios | meskeIA',
    description: 'Explora Romanticismo, Realismo, Vanguardias, Boom Latinoamericano y más con autores y obras clave.',
  },
  other: {
    'application-name': 'Visualizador Estilos Literarios meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Estilos y Movimientos Literarios',
  description: 'Guía visual interactiva de los grandes movimientos literarios de la historia. Explora 10 corrientes desde el Clasicismo hasta el Posmodernismo con autores representativos, obras clave y fragmentos ilustrativos.',
  url: 'https://meskeia.com/visualizador-estilos-literarios/',
  category: 'EducationalApplication',
  features: [
    '10 movimientos literarios con descripción detallada',
    'Filtros por período histórico y región geográfica',
    'Autores representativos con obras clave de cada corriente',
    'Fragmentos literarios ilustrativos atribuidos',
    'Características definitorias de cada estilo',
    'Cobertura desde el s.XVII hasta la literatura contemporánea',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

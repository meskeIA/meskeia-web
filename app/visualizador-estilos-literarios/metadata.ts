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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un movimiento literario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un movimiento literario es un conjunto de escritores de una misma época que comparten características estilísticas, temáticas e ideológicas. Surge como respuesta a un contexto histórico, cultural o filosófico concreto. Ejemplos destacados son el Romanticismo (s. XIX), que reaccionó contra el racionalismo ilustrado, o las Vanguardias (s. XX), que rompieron con todas las convenciones anteriores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los principales movimientos literarios del siglo XX?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los más influyentes del siglo XX son el Modernismo (Joyce, Woolf, Faulkner), las Vanguardias (surrealismo, dadaísmo, futurismo), el Existencialismo (Sartre, Camus, Kafka), el Boom Latinoamericano (García Márquez, Vargas Llosa, Cortázar) y el Posmodernismo (Borges, Pynchon, DeLillo). Cada uno transformó el lenguaje y la estructura narrativa de formas distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia al Romanticismo del Realismo literario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Romanticismo (1780-1850) privilegia la emoción, lo sublime, lo individual y la naturaleza como fuerza espiritual. El Realismo (1850-1900) reacciona contra eso y busca representar la vida cotidiana con objetividad y precisión documental, prestando especial atención a las clases medias y bajas. Autores como Balzac, Dickens o Tolstói son referentes del Realismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Boom Latinoamericano y quiénes son sus autores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Boom Latinoamericano es un fenómeno editorial y literario de los años 60-70 que llevó la narrativa latinoamericana a la escena internacional. Sus principales exponentes son Gabriel García Márquez (Colombia), Mario Vargas Llosa (Perú), Julio Cortázar (Argentina) y Carlos Fuentes (México). El realismo mágico, la experimentación formal y la crítica social son sus rasgos más reconocibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer los movimientos literarios si quiero escribir ficción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer los movimientos literarios te da un mapa de recursos estilísticos disponibles: puedes adoptar la ambigüedad del Modernismo, la fragmentación de las Vanguardias o la voz íntima del Realismo según lo que necesite tu historia. También te ayuda a identificar tus influencias y a situar conscientemente tu escritura en una tradición, lo que suele enriquecer el resultado final.',
      },
    },
  ],
};

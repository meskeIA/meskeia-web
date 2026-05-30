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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un íncipit en literatura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El íncipit es la primera frase o las primeras palabras de una obra literaria. Tiene una función estratégica: capturar al lector desde el inicio, establecer el tono narrativo y plantar una pregunta o tensión que invite a continuar leyendo. Grandes incipits como "Llamadme Ismael" (Moby Dick) o "Muchos años después, frente al pelotón de fusilamiento..." (Cien años de soledad) son estudiados como modelos del género.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo empezar una novela para enganchar al lector?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las estrategias más efectivas son: comenzar in medias res (en mitad de la acción), abrir con una voz narrativa muy marcada, plantear una contradicción o dato insólito, o situar al personaje en un punto de no retorno. Lo que suele no funcionar es empezar con descripciones largas del paisaje, el despertar del protagonista o una historia familiar remota. El primer párrafo debe hacer una promesa implícita al lector sobre qué tipo de historia va a leer.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el tono oscuro, misterioso e íntimo en un inicio de novela?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tono oscuro sugiere peligro, amenaza o fatalidad desde el inicio, y es típico del noir, el terror o el thriller. El tono misterioso crea incertidumbre: algo no encaja, hay información retenida, el lector intuye que hay más de lo que se dice. El tono íntimo reduce la cámara al interior de un personaje, apelando a la empatía inmediata. Elegir el tono correcto depende del género y de qué contrato emocional quieres establecer con el lector.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un generador de incipits si tengo que escribir mi propia historia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un generador de incipits no escribe tu historia: te da un punto de arranque para desbloquear el inicio, que muchas veces es el obstáculo más paralizante. Puedes usarlo como ejercicio de escritura (continúa la frase que te salió), como referente de tono para calibrar el tuyo o como fuente de inspiración para explorar géneros que no sueles frecuentar. Los incipits de autores reales incluidos muestran además cómo los grandes escritores han resuelto ese mismo reto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son algunos de los incipits más famosos de la literatura en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre los más citados en castellano están: "Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo" (García Márquez), "En el principio era el Verbo" (Biblia/San Juan) y "Ese año cumplí quince años..." (diversas novelas de iniciación). En traducción, "Llamadme Ismael" (Melville), "Era el mejor de los tiempos, era el peor de los tiempos" (Dickens) y "La mañana del 15 de junio de 1947" (Kafka) son referentes universales.',
      },
    },
  ],
};

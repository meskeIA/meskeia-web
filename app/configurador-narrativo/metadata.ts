import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Configurador Narrativo — Elige Persona, Narrador y Tiempo Verbal | meskeIA',
  description: 'Herramienta interactiva para escritores: elige persona narrativa (1ª/3ª/2ª), tipo de narrador (omnisciente, limitado, testigo, no fiable) y tiempo verbal. Cada combinación analiza el efecto en el lector con ejemplos de grandes novelas.',
  keywords: 'narrador omnisciente, primera persona narrativa, tercera persona limitada, tiempo verbal narración, narrador no fiable, perspectiva narrativa, escritura creativa, técnica narrativa, como escribir una novela',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Configurador Narrativo — Elige Persona, Narrador y Tiempo Verbal',
    description: 'Elige tu combinación narrativa y descubre qué efecto produce en el lector, cuándo usarla y qué novelas la utilizan.',
    url: 'https://meskeia.com/configurador-narrativo',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Configurador Narrativo — Persona, Narrador y Tiempo Verbal',
    description: 'Herramienta para escritores: analiza el efecto de cada combinación narrativa con ejemplos de grandes novelas.',
  },
  other: {
    'application-name': 'Configurador Narrativo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Configurador Narrativo — Persona, Narrador y Tiempo Verbal',
  description: 'Herramienta interactiva para escritores que analiza las combinaciones de persona narrativa, tipo de narrador y tiempo verbal. Incluye efecto en el lector, cuándo usar cada combinación, ejemplos de grandes novelas y tabla de referencia de autores clásicos.',
  url: 'https://meskeia.com/configurador-narrativo/',
  category: 'EducationalApplication',
  features: [
    '14 combinaciones narrativas válidas analizadas en profundidad',
    'Tres dimensiones: persona (1ª/3ª/2ª), narrador y tiempo verbal',
    'Efecto en el lector, fortalezas y debilidades de cada combinación',
    'Cuándo usar y cuándo evitar cada configuración',
    'Ejemplos de grandes novelas que usan cada combinación',
    'Tabla de referencia de 10 grandes autores y su elección técnica',
    'Combinaciones inválidas explicadas con el motivo',
    'Interfaz paso a paso: persona → narrador → tiempo verbal',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el narrador omnisciente y el narrador limitado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El narrador omnisciente conoce los pensamientos, sentimientos y motivaciones de todos los personajes, así como hechos que ningún personaje sabe. El narrador limitado (o focalizado) solo accede a la mente de un personaje, generalmente el protagonista, y desconoce lo que piensan el resto. Mientras el omnisciente ofrece una visión panorámica, el limitado genera mayor identificación y suspense al restringir la información.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo debo usar la primera persona en una novela?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La primera persona es ideal cuando quieres crear una voz muy distintiva, generar complicidad inmediata con el lector o explorar la subjetividad del protagonista. Es especialmente eficaz en relatos de formación, memorias ficcionalizadas y narradores no fiables. Su principal limitación es que restringe la información a lo que el narrador-personaje puede conocer y observar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un narrador no fiable y cómo se usa en la escritura creativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un narrador no fiable es aquel cuya versión de los hechos el lector debe cuestionar: miente, se engaña a sí mismo, omite información o tiene una percepción distorsionada de la realidad. Se usa para crear tensión, giros narrativos y una segunda lectura enriquecedora. Ejemplos clásicos son el narrador de El gran Gatsby (Nick Carraway) o el de El guardián entre el centeno (Holden Caulfield).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Afecta el tiempo verbal (pasado o presente) al ritmo y la tensión de una historia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, de forma significativa. El presente narrativo crea inmediatez y tensión, como si los hechos ocurrieran en tiempo real, y es eficaz en escenas de acción o thrillers. El pasado es la forma más natural y versátil: permite distancia reflexiva y retrospección sin que el lector lo perciba como artificial. La elección también afecta la credibilidad del narrador: un personaje que narra en presente no puede tener retrospección sobre lo que aún no ha sucedido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué combinación narrativa usan las novelas más conocidas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay combinaciones muy consolidadas: Cien años de soledad usa tercera persona + narrador omnisciente + pasado; El guardián entre el centeno usa primera persona + narrador no fiable + pasado; La carretera de Cormac McCarthy usa tercera persona + narrador limitado + presente. No existe una combinación universalmente superior: la elección correcta depende del efecto que el escritor quiera producir en el lector.',
      },
    },
  ],
};

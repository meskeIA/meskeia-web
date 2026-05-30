import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Recursos Literarios — Guía Visual de Figuras Retóricas | meskeIA',
  description: 'Explora 27 figuras retóricas con definición, ejemplos reales y cómo distinguirlas. Filtra por nivel (ESO, Bachillerato, Selectividad) y categoría. Ideal para estudiar literatura.',
  keywords: 'figuras retóricas, recursos literarios, metáfora, símil, hipérbole, anáfora, ironía, metonimia, oxímoron, paradoja, figuras retóricas bachillerato, selectividad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Recursos Literarios — Guía Visual de Figuras Retóricas',
    description: 'Explora 27 figuras retóricas con definición, ejemplos reales y cómo distinguirlas. Filtra por nivel y categoría.',
    url: 'https://meskeia.com/visualizador-recursos-literarios',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos Literarios — Guía Visual de Figuras Retóricas',
    description: 'Explora 27 figuras retóricas con definición, ejemplos y cómo distinguirlas. Filtra por nivel y categoría.',
  },
  other: {
    'application-name': 'Recursos Literarios meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Recursos Literarios — Guía Visual de Figuras Retóricas',
  description: 'Directorio visual de 27 figuras retóricas con definición, ejemplos reales, campo "cómo no confundirla" y filtros por nivel (ESO, Bachillerato, Selectividad) y grupo. Incluye sección de pares frecuentemente confundidos.',
  url: 'https://meskeia.com/visualizador-recursos-literarios/',
  category: 'EducationalApplication',
  features: [
    '27 figuras retóricas en 3 niveles: ESO, Bachillerato y Selectividad',
    'Filtros por nivel y por grupo (imagen, repetición, contraste, énfasis, sintaxis, contigüidad)',
    'Buscador por nombre de figura',
    'Campo "cómo no confundirla" para cada figura',
    'Sección de 6 pares frecuentemente confundidos',
    'Múltiples ejemplos reales por figura',
    'Enlace directo al quiz para practicar el reconocimiento',
    'Gratuito, sin registro, en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una figura retórica y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una figura retórica es un recurso del lenguaje que se aparta de su uso habitual para conseguir un efecto expresivo, estético o persuasivo. Se usan en literatura, publicidad, discursos y lenguaje cotidiano. Conocerlas permite analizar textos literarios con más profundidad, enriquecer la expresión escrita y entender los efectos que busca un autor sobre el lector.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre metáfora y símil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El símil (o comparación) establece un parecido explícito usando nexos como "como", "cual" o "parece": "Sus ojos brillan como estrellas". La metáfora, en cambio, identifica directamente dos elementos sin nexo comparativo: "Sus ojos son estrellas". La metáfora implica mayor condensación expresiva y se considera más literaria, mientras que el símil resulta más transparente para el lector.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué figuras retóricas son más importantes para selectividad o examen de admisión universitaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En los exámenes de comentario de texto de nivel preuniversitario suelen evaluarse con mayor frecuencia: metáfora, símil, hipérbole, anáfora, antítesis, paradoja, ironía, metonimia, sinécdoque y personificación. La guía incluye las 27 figuras más habituales ordenadas por nivel de dificultad, con ejemplos extraídos de textos literarios reales y un apartado específico para no confundir figuras parecidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo distinguir la metonimia de la sinécdoque?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas son figuras de contigüidad, pero operan de modo distinto. La metonimia sustituye un concepto por otro relacionado por causa-efecto, materia-objeto o contenedor-contenido: "beber una copa" (la copa por su contenido). La sinécdoque sustituye el todo por la parte o la especie por el género: "cien velas surcaron el mar" (las velas por los barcos). La clave es si la relación es parte-todo (sinécdoque) o meramente contigua (metonimia).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre esta guía y un libro de texto de literatura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La guía está diseñada para consulta rápida y repaso activo: puedes filtrar por nivel, buscar una figura concreta y ver de un vistazo su definición, ejemplos y cómo no confundirla con otras similares. Un libro de texto suele presentar las figuras en orden lineal con mayor contexto histórico. Esta herramienta es complementaria: útil justo antes de un examen o cuando necesitas identificar una figura específica en un texto.',
      },
    },
  ],
};

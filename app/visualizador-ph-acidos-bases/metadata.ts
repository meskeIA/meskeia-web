import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Escala de pH: Ácidos y Bases - Explicador Visual | meskeIA',
  description: 'Explora la escala de pH de 0 a 14 con colores. Sustancias cotidianas, neutralización, indicadores naturales, lluvia ácida. Explicador visual interactivo.',
  keywords: 'escala pH, ácidos bases, neutralización, lluvia ácida, indicadores pH, limón vinagre, jabón lejía, química cotidiana, donantes protones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Escala de pH: Ácidos y Bases - Explicador Visual',
    description: 'La escala de pH de 0 a 14 con colores, sustancias cotidianas y neutralización. Interactivo y gratuito.',
    url: 'https://meskeia.com/visualizador-ph-acidos-bases/',
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
    title: 'Escala de pH: Ácidos y Bases - Explicador Visual',
    description: 'Descubre el pH de lo que te rodea: del limón a la lejía, pasando por el agua pura.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'pH Ácidos y Bases meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Escala de pH: Ácidos y Bases - Explicador Visual',
  description: 'Explicador visual interactivo sobre la escala de pH, ácidos, bases, neutralización, indicadores naturales y lluvia ácida. Con sustancias cotidianas y slider de pH.',
  url: 'https://meskeia.com/visualizador-ph-acidos-bases/',
  category: 'EducationalApplication',
  features: [
    'Escala de pH interactiva con slider y colores arcoíris',
    'Más de 15 sustancias cotidianas con su pH exacto',
    'Ácidos y bases: fuertes vs débiles con ejemplos',
    'Neutralización y aplicaciones prácticas',
    'Curiosidades: lluvia ácida, pH del estómago, escala logarítmica',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el pH y cómo se mide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pH mide la concentración de iones hidrógeno (H⁺) en una solución en una escala del 0 al 14. Un pH de 7 es neutro (agua pura), por debajo de 7 es ácido (el limón tiene ~2,2) y por encima de 7 es básico o alcalino (la lejía alcanza ~13). La escala es logarítmica: una diferencia de 1 unidad representa una concentración 10 veces mayor o menor de iones H⁺.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el pH del estómago y por qué es tan ácido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El jugo gástrico tiene un pH de 1,5 a 3,5, uno de los más ácidos del cuerpo humano. Ese entorno ácido es necesario para activar la pepsina, enzima que digiere las proteínas, y para eliminar bacterias y patógenos que ingerimos con los alimentos. La mucosa gástrica produce un recubrimiento protector para no digerirse a sí misma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la lluvia ácida y qué pH tiene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lluvia normal ya es ligeramente ácida (pH ~5,6) porque el CO₂ atmosférico se disuelve formando ácido carbónico. Se habla de lluvia ácida cuando el pH cae por debajo de 5,0 debido a emisiones de dióxido de azufre (SO₂) y óxidos de nitrógeno (NOₓ), que forman ácido sulfúrico y nítrico. La lluvia ácida daña ecosistemas acuáticos, bosques y edificios de piedra caliza.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre cuando se mezcla un ácido con una base?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando un ácido y una base reaccionan se produce una neutralización: los iones H⁺ del ácido se combinan con los iones OH⁻ de la base para formar agua. Si las cantidades son equivalentes, el resultado es una solución de pH neutro (~7) junto con una sal. Este principio se aplica desde antiácidos estomacales (base neutraliza exceso de ácido) hasta tratamiento de aguas residuales industriales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se puede medir el pH en casa sin instrumentos de laboratorio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen indicadores naturales que cambian de color según el pH: el jugo de col lombarda (repollo morado) vira del rojo en ácido al amarillo-verde en básico. Las tiras reactivas de papel tornasol son económicas y precisas para un rango de ~6 unidades. Los pHmetros digitales portátiles dan lecturas exactas con un electrodo calibrado y cuestan desde unos 10 euros en ferreterías o tiendas de acuariofilia.',
      },
    },
  ],
};

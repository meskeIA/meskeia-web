import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Aves Comunes - 40 aves de España y Europa | meskeIA',
  description: 'Directorio de 40 aves comunes de España y Europa: gorrión, mirlo, lechuza, cigüeña y más. Hábitat, alimentación, canto, estado de conservación y cuándo verlas. Filtros por hábitat, presencia y orden.',
  keywords: 'guia aves españa, aves comunes europa, identificar aves, birdwatching españa, aves rapaces, aves migratorias, gorrion mirlo petirrojo, ornitologia, observacion aves',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Aves Comunes de España y Europa | meskeIA',
    description: '40 aves comunes con hábitat, alimentación, canto, tamaño, envergadura y estado de conservación. Filtros por hábitat, presencia y orden taxonómico.',
    url: 'https://meskeia.com/guia-aves-comunes/',
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
    title: 'Guía de Aves Comunes | meskeIA',
    description: '40 aves de España y Europa: hábitat, alimentación, canto y cuándo verlas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Aves Comunes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Aves Comunes',
  description: 'Directorio interactivo de 40 aves comunes de España y Europa con información sobre hábitat, alimentación, canto, tamaño, envergadura, presencia estacional y estado de conservación IUCN. Incluye filtros por hábitat, presencia y orden taxonómico, buscador por nombre y guía de iniciación al birdwatching.',
  url: 'https://meskeia.com/guia-aves-comunes/',
  features: [
    '40 aves comunes de España y Europa con ficha completa',
    'Filtros por hábitat, presencia estacional y orden taxonómico',
    'Búsqueda por nombre común o nombre científico',
    'Estado de conservación IUCN por especie',
    'Descripción del canto y curiosidades de cada ave',
    'Guía de iniciación al birdwatching paso a paso',
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
      name: '¿Cómo puedo identificar un ave que veo por primera vez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para identificar un ave nueva conviene fijarse en cuatro rasgos clave: tamaño (compáralo con una paloma o un gorrión), coloración y marcas características (manchas, bandas alares, color del pecho), forma del pico (fino e insectívoro, grueso y granívoro, curvo y carnívoro) y comportamiento (si camina, salta, se cuelga de ramas). Anotar el hábitat y la época del año también reduce mucho las posibilidades. Esta guía incluye fichas con todos esos datos para 40 especies comunes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué aves se pueden ver en España durante todo el año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las aves sedentarias o residentes que permanecen en España durante los doce meses incluyen el gorrión común, el mirlo, el petirrojo, la paloma bravía, la urraca, la corneja negra, el herrerillo común y el carbonero común, entre otras. Su presencia constante hace que sean las más fáciles de observar y aprender a identificar para quien empieza con el birdwatching.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el estado de conservación de las aves incluidas en la guía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada especie muestra su categoría en la Lista Roja de la IUCN: desde LC (Preocupación Menor) para las más abundantes, hasta NT (Casi Amenazada), VU (Vulnerable) o EN (En Peligro) en casos más delicados. Conocer el estado de conservación es útil tanto para la concienciación ambiental como para priorizar avistamientos de especies escasas antes de que su rango se reduzca aún más.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un ave migratoria y una ave residente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las aves residentes viven en una zona durante todo el año, mientras que las migratorias solo están presentes en temporadas concretas. Las especies estivales (como la golondrina o el vencejo) llegan a Europa en primavera para criar y regresan a África en otoño. Las invernantes (como algunas anátidas o el zorzal) proceden del norte de Europa y pasan el invierno en latitudes más cálidas. Algunas aves son además de paso: se ven brevemente durante sus migraciones entre áreas de cría y de invernada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué material básico necesito para empezar a hacer birdwatching?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para iniciarse en la observación de aves basta con unos prismáticos de entre 8x42 y 10x42 (relación aumento × diámetro objetivo), una guía de campo impresa o una app de identificación y ropa discreta en colores apagados. Un cuaderno para anotar fecha, lugar, especie y comportamiento ayuda a mejorar rápidamente. Los parques urbanos, humedales y bosques de ribera son excelentes puntos de inicio, ya que concentran gran variedad de especies a lo largo del año.',
      },
    },
  ],
};

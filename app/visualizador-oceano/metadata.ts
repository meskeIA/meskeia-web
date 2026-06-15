import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Los Números del Océano - Profundidad, Plástico y Clima | meskeIA',
  description: 'Descubre las cifras del océano: 71% de la Tierra, 11 km de profundidad, 8 millones de toneladas de plástico al año. Zonas de profundidad, contaminación y regulación del clima explicados visualmente.',
  keywords: 'océano, profundidad marina, zonas oceánicas, plástico océano, cambio climático mar, Fosa de las Marianas, zona abisal, contaminación marina, coral, nivel del mar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Los Números del Océano - Profundidad, Plástico y Clima',
    description: 'Las cifras del océano que deberías conocer: profundidad, zonas de vida, contaminación por plástico y regulación del clima.',
    url: 'https://meskeia.com/visualizador-oceano/',
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
    title: 'Los Números del Océano - Explicador Visual',
    description: '71% de la Tierra, 11 km de profundidad, 8M toneladas de plástico/año. Las cifras del océano.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Océano meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Los Números del Océano - Profundidad, Plástico y Clima',
  description: 'Explicador visual interactivo sobre el océano: cifras clave, zonas de profundidad con vida y condiciones, contaminación por plástico y su papel como regulador del clima terrestre.',
  url: 'https://meskeia.com/visualizador-oceano/',
  category: 'EducationalApplication',
  features: [
    'Cifras del océano con comparaciones proporcionales',
    'Corte vertical: 5 zonas de profundidad con fauna, temperatura y presión',
    'Contaminación por plástico: degradación, islas de basura, países contaminantes',
    'Regulador del clima: absorción de CO2, calor, nivel del mar y coral',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto ocupa el océano en la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El océano cubre el 71% de la superficie terrestre y contiene el 97% de toda el agua del planeta. Su volumen total supera los 1.335 millones de kilómetros cúbicos, lo que lo convierte en el mayor sistema continuo de agua salada del mundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la zona más profunda del océano y qué hay allí?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Fosa de las Marianas, en el Pacífico, alcanza los 11.034 metros de profundidad: la zona hadalpelagial. A esa profundidad la presión supera las 1.000 atmósferas, no hay luz solar y la temperatura ronda los 2 °C. Aun así, viven organismos como anfípodos, pepinos de mar y bacterias adaptadas a condiciones extremas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto plástico llega al océano cada año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se estima que entre 8 y 12 millones de toneladas de plástico entran en el océano cada año. Los plásticos se fragmentan con la luz solar en microplásticos de menos de 5 mm que se acumulan en la columna de agua y en los sedimentos marinos, y han sido detectados incluso en las fosas oceánicas más profundas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo regula el océano el clima de la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El océano absorbe aproximadamente el 30% del CO₂ emitido por la actividad humana y más del 90% del exceso de calor generado por el efecto invernadero. Las corrientes termohalinas distribuyen ese calor por todo el planeta, moderando temperaturas y determinando los patrones de lluvia y viento a escala global.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las cinco zonas de profundidad oceánica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las zonas son: epipelágica (0-200 m, luz solar abundante y mayor biodiversidad), mesopelágica (200-1.000 m, zona crepuscular con bioluminiscencia), batipelágica (1.000-4.000 m, oscuridad total y frío extremo), abisopelagial (4.000-6.000 m, fondos planos con presión aplastante) y hadalpelagial (>6.000 m, fosas oceánicas). Cada zona tiene fauna y condiciones físicas propias.',
      },
    },
  ],
};

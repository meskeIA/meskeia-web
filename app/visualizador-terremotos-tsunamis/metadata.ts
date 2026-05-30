import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Terremotos y Tsunamis: Cómo Funcionan | meskeIA',
  description:
    'Visualiza cómo se generan los terremotos (fallas normales, inversas y en desgarre), los tres tipos de ondas sísmicas (P, S, superficiales), cómo se forman y propagan los tsunamis y cómo funcionan los sistemas de alerta temprana.',
  keywords: [
    'cómo se forman terremotos',
    'ondas sísmicas P S',
    'tsunami cómo se forma',
    'escala Richter',
    'escala Mercalli',
    'alerta temprana tsunami',
    'fallas geológicas',
    'sismología explicada',
  ],
  openGraph: {
    title: 'Terremotos y Tsunamis: Cómo Funcionan | meskeIA',
    description:
      'De la falla geológica al tsunami en 800 km/h: todos los principios de la sismología y la alerta temprana.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Terremotos y Tsunamis: De la Falla al Impacto",
  description: "Visualiza cómo se generan los terremotos (fallas normales, inversas y en desgarre), los tres tipos de ondas sísmicas (P, S, superficiales), cómo se forman y propagan los tsunamis y cómo funcionan los ",
  url: "https://meskeia.com/visualizador-terremotos-tsunamis/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se forma un terremoto y qué es una falla geológica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un terremoto se produce cuando dos bloques de la corteza terrestre acumulan tensión a lo largo de una fractura (falla geológica) y se deslizan bruscamente. Existen tres tipos principales: fallas normales (extensión de la corteza, un bloque cae respecto al otro), fallas inversas (compresión, un bloque cabalga sobre el otro) y fallas en desgarre o transcurrentes (movimiento horizontal). El punto donde se produce la rotura bajo tierra se llama foco o hipocentro, y el punto en la superficie directamente encima es el epicentro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la escala de Richter y la escala de Mercalli?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala de Richter (más precisamente, magnitud de momento Mw) mide la energía liberada en el foco del terremoto a partir de instrumentos sísmicos; es una escala objetiva y logarítmica (cada punto representa 32 veces más energía). La escala de Mercalli mide la intensidad percibida en un lugar concreto, basándose en los efectos observados sobre personas y edificios; va de I (imperceptible) a XII (destrucción total). Un mismo terremoto puede tener una sola magnitud Richter pero distintas intensidades Mercalli en diferentes puntos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipos de ondas sísmicas existen y cuál llega antes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay tres familias de ondas sísmicas: ondas P (primarias o de compresión), que viajan a 6-8 km/s y llegan primero porque pueden atravesar sólidos y líquidos; ondas S (secundarias o de cizalladura), que viajan a 3,5-5 km/s y solo se propagan por sólidos; y ondas superficiales (Love y Rayleigh), que son las más lentas pero las más destructivas porque concentran su energía en la superficie terrestre. La diferencia de llegada entre ondas P y S permite a los sismólogos calcular la distancia al epicentro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se forma un tsunami y a qué velocidad viaja?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un tsunami se forma cuando un terremoto submarino de magnitud superior a 7,0 Mw desplaza verticalmente una gran columna de agua al mover el fondo oceánico. En mar abierto, las olas viajan a velocidades de hasta 800 km/h con alturas de apenas 30-60 cm, casi imperceptibles desde un barco. Al llegar a aguas someras, la velocidad se reduce drásticamente pero la altura aumenta por compresión de la energía, pudiendo superar los 30-40 metros como en el tsunami de Tōhoku (Japón) de 2011.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funcionan los sistemas de alerta temprana de tsunamis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los sistemas de alerta temprana combinan redes de sismógrafos (detectan terremotos submarinos en minutos) con boyas DART (Detection Assessment of Tsunami in Real Time) que miden variaciones de presión en el fondo oceánico. Si los sismógrafos detectan un terremoto relevante y las boyas confirman un desplazamiento de agua, los centros de alerta como el PTWC (Pacific Tsunami Warning Center) emiten avisos. El tiempo disponible varía: desde 15-20 minutos para costas cercanas hasta 8-12 horas para cuencas oceánicas completas como el Pacífico.',
      },
    },
  ],
};

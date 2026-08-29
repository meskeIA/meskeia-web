import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Superconductividad: Resistencia Cero y Levitación Magnética | meskeIA',
  description:
    'Explora la superconductividad interactivamente: efecto Meissner (levitación magnética), pares de Cooper, temperatura crítica de 8 materiales reales y aplicaciones en MRI, LHC, Maglev y fusión nuclear.',
  keywords: [
    'superconductividad',
    'efecto Meissner',
    'pares de Cooper',
    'temperatura crítica Tc',
    'YBCO alta Tc',
    'MRI superconductor',
    'Maglev tren levitación',
    'ITER fusión superconductores',
  ],
  openGraph: {
    title: 'Superconductividad: Resistencia Cero y Levitación Magnética',
    description:
      'El efecto más espectacular de la física cuántica: conductividad perfecta y levitación magnética real. Visualizador interactivo con 8 materiales y animaciones.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Superconductividad: Resistencia Cero y Levitación Magnética',
    description: 'El efecto más espectacular de la física cuántica: conductividad perfecta y levitación magnética real. Visualizador interactivo con 8 materiales y animaciones.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Superconductividad: Efecto Meissner y Pares de Cooper",
  description: "Explora la superconductividad interactivamente: efecto Meissner (levitación magnética), pares de Cooper, temperatura crítica de 8 materiales reales y aplicaciones en MRI, LHC, Maglev y fusión nuclear.",
  url: "https://meskeia.com/visualizador-superconductividad/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la superconductividad y a qué temperatura ocurre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La superconductividad es un estado cuántico de la materia en el que ciertos materiales conducen electricidad con resistencia exactamente cero por debajo de una temperatura crítica (Tc). El mercurio fue el primer superconductor descubierto por Kamerlingh Onnes en 1911 a 4,2 K (−269 °C). Los superconductores convencionales requieren temperaturas cercanas al cero absoluto, mientras que los de alta temperatura crítica como el YBCO (93 K) pueden enfriarse con nitrógeno líquido barato (77 K), lo que los hace más prácticos para aplicaciones industriales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el efecto Meissner y cómo produce levitación magnética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto Meissner es la expulsión total del campo magnético del interior de un superconductor cuando se enfría por debajo de su Tc. Las supercorrientes superficiales generan un campo opuesto que cancela exactamente el campo externo (diamagnetismo perfecto). Si se coloca un imán permanente sobre un superconductor, el campo del imán es repelido y el imán queda suspendido en el aire. A diferencia de la levitación electromagnética ordinaria, el efecto Meissner es intrínsecamente estable sin necesidad de retroalimentación electrónica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los pares de Cooper y por qué explican la superconductividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los pares de Cooper son parejas de electrones que se acoplan a través de vibraciones de la red cristalina (fonones). Aunque los electrones tienen carga negativa y deberían repelerse, la deformación que uno provoca en la red atrae al segundo electrón con un retardo de femtosegundos. Estos pares tienen espín total entero y se comportan como bosones, condensando en un mismo estado cuántico (condensado de Bose-Einstein). Este estado colectivo no puede ser dispersado por impurezas ni vibraciones térmicas moderadas, eliminando la resistencia eléctrica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué tecnologías reales se usan los superconductores hoy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los superconductores tienen aplicaciones industriales y científicas consolidadas. En medicina, los electroimanes superconductores de niobio-titanio generan los campos de 1,5-3 T de los equipos de resonancia magnética (MRI). En física de partículas, los 1.232 dipolos superconductores del LHC del CERN guían los protones a 8,3 T. En transporte, los trenes Maglev japoneses (SCMaglev) usan bobinas superconductoras para levitar a 600 km/h. En fusión nuclear, el reactor ITER usa magnetos superconductores de Nb3Sn para confinar el plasma a 150 millones de grados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe ya un superconductor a temperatura ambiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A fecha de 2025, no existe ningún superconductor a temperatura ambiente confirmado y reproducible. Se han publicado varios candidatos polémicos, como el LK-99 en 2023 (refutado en semanas) o hidruros de lantano a altísima presión (~200 GPa) que requieren condiciones extremas inviables para aplicaciones prácticas. El objetivo de la superconductividad a temperatura y presión ambiente sigue siendo el mayor reto abierto de la física de estado sólido, con implicaciones transformadoras para la transmisión eléctrica, la computación cuántica y el almacenamiento de energía.',
      },
    },
  ],
};

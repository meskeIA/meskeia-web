import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Cruces Genéticos y Leyes de Mendel | meskeIA',
  description: 'Simulador de cruces genéticos y herencia mendeliana en español: cuadro de Punnett, cruce monohíbrido (3:1) y dihíbrido (9:3:3:1), proporciones fenotípicas, genotipo y fenotipo, alelos dominante y recesivo. Alternativa interactiva para practicar las leyes de Mendel y los patrones mendelianos de la herencia.',
  keywords: 'cruces genéticos, simulador de cruces genéticos, leyes de Mendel, herencia mendeliana, patrones mendelianos, cruce monohíbrido, cruce dihíbrido, proporciones fenotípicas, cuadro de Punnett, cuadro de herencia mendeliana, genotipo, fenotipo, alelo dominante, alelo recesivo, cruces genéticos con monedas, dihíbrido, cromosomas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-genetica/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Cruces Genéticos y Leyes de Mendel | meskeIA',
    description: 'Cruces genéticos y herencia mendeliana paso a paso: cuadro de Punnett, cruce monohíbrido (3:1) y dihíbrido (9:3:3:1), proporciones fenotípicas, genotipo y fenotipo',
    url: 'https://meskeia.com/simulador-genetica/',
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
    title: 'Simulador de Cruces Genéticos y Leyes de Mendel | meskeIA',
    description: 'Simula cruces genéticos, cuadro de Punnett y las leyes de Mendel: proporciones fenotípicas del cruce monohíbrido (3:1) y dihíbrido (9:3:3:1)',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un cuadro de Punnett?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cuadro de Punnett es una tabla que muestra todas las combinaciones posibles de alelos entre dos progenitores. Permite calcular la probabilidad de que la descendencia presente un determinado genotipo o fenotipo. Por ejemplo, al cruzar dos heterocigotos (Aa × Aa), el cuadro muestra que el 25% de la descendencia será AA, el 50% Aa y el 25% aa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre genotipo y fenotipo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El genotipo es la combinación de alelos que posee un organismo (por ejemplo, Aa para color de ojos), mientras que el fenotipo es la característica observable resultante (por ejemplo, ojos marrones). El fenotipo depende del genotipo y también puede verse influido por el ambiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la herencia mendeliana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herencia mendeliana describe cómo los rasgos se transmiten de padres a hijos según las leyes de Gregor Mendel: la ley de la segregación (cada organismo tiene dos alelos para cada carácter que se separan al formarse los gametos) y la ley de la distribución independiente (alelos de genes distintos se transmiten de forma independiente).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un alelo dominante y uno recesivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un alelo dominante se expresa en el fenotipo aunque solo haya una copia (heterocigoto Aa). Un alelo recesivo solo se manifiesta cuando hay dos copias iguales (homocigoto recesivo aa). Por convención, los alelos dominantes se escriben en mayúscula (A) y los recesivos en minúscula (a).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la herencia ligada al sexo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herencia ligada al sexo afecta a genes localizados en los cromosomas sexuales X o Y. Como los hombres tienen un solo cromosoma X (XY), un alelo recesivo en el X siempre se expresa en ellos. El daltonismo y la hemofilia son ejemplos clásicos: son más frecuentes en hombres porque las mujeres (XX) necesitan dos copias del alelo recesivo para manifestarlo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué proporciones fenotípicas da un cruce monohíbrido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cruce monohíbrido entre dos heterocigotos (Aa × Aa) con dominancia completa da una proporción fenotípica de 3:1, es decir, 3 individuos con el rasgo dominante por cada 1 con el rasgo recesivo. La proporción genotípica subyacente es 1:2:1 (1 AA, 2 Aa, 1 aa). Si la herencia es de dominancia incompleta o codominancia, la proporción fenotípica pasa a ser 1:2:1 porque el heterocigoto muestra su propio fenotipo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué proporciones fenotípicas da un cruce dihíbrido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cruce dihíbrido entre dos individuos heterocigotos para dos genes (AaBb × AaBb) da una proporción fenotípica de 9:3:3:1 cuando ambos genes están en cromosomas distintos y se transmiten de forma independiente (3ª ley de Mendel). Son 9 con ambos rasgos dominantes, 3 con el primero dominante y el segundo recesivo, 3 al revés y 1 con ambos rasgos recesivos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se hace un cruce genético paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para hacer un cruce genético: 1) identifica el modo de herencia y asigna símbolos a los alelos (mayúscula para el dominante, minúscula para el recesivo); 2) determina el genotipo de cada progenitor; 3) escribe los gametos posibles de cada uno; 4) combínalos en un cuadro de Punnett; 5) cuenta las proporciones genotípicas y agrúpalas por fenotipo para obtener las proporciones fenotípicas (por ejemplo 3:1 en un monohíbrido). El simulador construye el cuadro y calcula estas proporciones automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las leyes de Mendel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las leyes de Mendel son los tres principios que describen los patrones mendelianos de la herencia. La 1ª ley (uniformidad) dice que al cruzar dos razas puras toda la F1 es igual. La 2ª ley (segregación) explica que los alelos se separan al formar los gametos, reapareciendo el rasgo recesivo en la F2 en proporción 3:1. La 3ª ley (transmisión independiente) indica que genes de caracteres distintos se heredan por separado, dando la proporción 9:3:3:1 en un cruce dihíbrido.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Cruces Genéticos y Leyes de Mendel',
  description: 'Simulador interactivo de cruces genéticos y herencia mendeliana en español. Genera el cuadro de Punnett del cruce monohíbrido (proporción fenotípica 3:1) y dihíbrido (9:3:3:1), muestra genotipo y fenotipo, alelos dominante y recesivo, herencia ligada al sexo, árboles genealógicos y simulación de poblaciones. Alternativa interactiva para practicar las leyes de Mendel y los patrones mendelianos de la herencia.',
  url: 'https://meskeia.com/simulador-genetica/',
  category: 'EducationalApplication',
  features: [
    'Cuadro de Punnett para cruce monohíbrido (3:1) y dihíbrido (9:3:3:1)',
    'Cálculo de proporciones fenotípicas y genotípicas',
    'Simulación de cruces genéticos paso a paso',
    'Alelos dominante y recesivo, genotipo y fenotipo',
    'Herencia ligada al sexo y autosómica',
    'Árboles genealógicos (pedigrees)',
    'Simulación de frecuencias alélicas en poblaciones',
    'En español, alternativa interactiva a las prácticas de las leyes de Mendel',
  ],
  keywords: ['cruces genéticos', 'leyes de Mendel', 'herencia mendeliana', 'patrones mendelianos', 'cruce monohíbrido', 'cruce dihíbrido', 'proporciones fenotípicas', 'cuadro de Punnett', 'genotipo', 'fenotipo', 'alelo dominante', 'alelo recesivo', 'biología'],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Genética Mendeliana - Cruces y Herencia | meskeIA',
  description: 'Simula cruces genéticos y visualiza la herencia mendeliana. Cuadros de Punnett, árboles genealógicos, herencia ligada al sexo y simulación de poblaciones.',
  keywords: 'genética, Mendel, herencia, cuadro de Punnett, pedigree, alelos, genotipo, fenotipo, dominante, recesivo, dihíbrido, cromosomas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-genetica/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Genética Mendeliana | meskeIA',
    description: 'Visualiza cruces genéticos, cuadros de Punnett y herencia mendeliana de forma interactiva',
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
    title: 'Simulador de Genética Mendeliana | meskeIA',
    description: 'Aprende genética mendeliana con simulaciones interactivas',
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
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Genética Mendeliana',
  description: 'Simulador interactivo de cruces genéticos y herencia mendeliana. Genera cuadros de Punnett, árboles genealógicos, herencia ligada al sexo y simulación de poblaciones para entender genotipos y fenotipos.',
  url: 'https://meskeia.com/simulador-genetica/',
  category: 'EducationalApplication',
  features: [
    'Generador de cuadros de Punnett (mono y dihíbridos)',
    'Visualización de cruces genéticos paso a paso',
    'Herencia ligada al sexo y autosómica',
    'Árboles genealógicos (pedigrees)',
    'Simulación de frecuencias alélicas en poblaciones',
    'En español',
  ],
  keywords: ['genética', 'Mendel', 'cuadro de Punnett', 'herencia', 'bachillerato', 'biología'],
});

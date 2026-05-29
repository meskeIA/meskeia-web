import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Energía Nuclear | Fisión, Fusión y Comparativa | meskeIA',
  description: 'Explora la fisión nuclear (reacción en cadena, reactores PWR/BWR), la fusión (tokamak, ITER) y la comparativa de CO₂ y densidad energética con otras fuentes.',
  keywords: ['energia nuclear', 'fision', 'fusion', 'reactor nuclear', 'ITER', 'tokamak', 'uranio', 'neutrones', 'CO2 nuclear'],
  openGraph: {
    title: 'Visualizador de Energía Nuclear | meskeIA',
    description: 'Fisión vs fusión, reacción en cadena, tipos de reactor y comparativa con renovables.',
    url: 'https://meskeia.com/visualizador-energia-nuclear/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Energía Nuclear - Fisión, Fusión y Comparativa",
  description: "Explora la fisión nuclear (reacción en cadena, reactores PWR/BWR), la fusión (tokamak, ITER) y la comparativa de CO₂ y densidad energética con otras fuentes.",
  url: "https://meskeia.com/visualizador-energia-nuclear/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre fisión y fusión nuclear?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fisión divide núcleos pesados como el uranio-235 liberando energía al fragmentarse en núcleos más ligeros. La fusión une núcleos ligeros como deuterio y tritio para formar helio, liberando mucha más energía por unidad de masa. La fisión se usa en centrales actuales; la fusión, aún en fase experimental (ITER), es la reacción que alimenta el Sol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto CO₂ emite la energía nuclear comparada con otras fuentes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según el IPCC, la energía nuclear emite entre 3 y 12 g de CO₂ equivalente por kilovatio-hora en todo su ciclo de vida, cifra comparable a la eólica (7-15 g/kWh) y muy inferior al gas natural (~490 g/kWh) o al carbón (~820 g/kWh). Es una de las fuentes con menor huella de carbono disponibles a gran escala.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un reactor PWR y en qué se diferencia de uno BWR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un reactor PWR (Pressurized Water Reactor) usa agua a presión para enfriar el núcleo sin que hierva, transfiriendo calor a un circuito secundario que genera vapor. Un BWR (Boiling Water Reactor) permite que el agua hierva directamente en el núcleo y el vapor mueve las turbinas. Los PWR son más comunes a nivel mundial y ofrecen mayor separación entre el circuito radiactivo y la turbina.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el proyecto ITER y cuándo producirá electricidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ITER es un reactor de fusión experimental construido en Cadarache (Francia) con participación de 35 países. Su objetivo es demostrar que la fusión produce más energía de la que consume (Q>1). La primera plasma experimental está prevista en torno a 2025-2026, pero la generación comercial de electricidad mediante fusión no se espera antes de 2050.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la densidad energética del uranio y por qué importa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La densidad energética del uranio en fisión es de unos 45.000 GJ/kg, frente a los 32 MJ/kg del petróleo, lo que supone una diferencia de más de un millón de veces. Esto significa que un pequeño volumen de combustible nuclear puede abastecer una central durante meses, reduciendo enormemente el transporte de combustible y el impacto en el territorio.',
      },
    },
  ],
};

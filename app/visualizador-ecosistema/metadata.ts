import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo del Carbono y del Nitrógeno: Ciclos Biogeoquímicos | meskeIA',
  description: 'Los ciclos biogeoquímicos explicados con diagramas interactivos: el ciclo del carbono y el ciclo del nitrógeno, etapa por etapa. Incluye la pirámide trófica y la regla del 10% del flujo de energía.',
  keywords: 'ecosistema, pirámide trófica, cadena trófica, regla del 10 por ciento, ciclo carbono, ciclo nitrógeno, flujo energía, red trófica, productores, consumidores, descomponedores, ecología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ciclo del Carbono y del Nitrógeno',
    description: 'Pirámide trófica, regla del 10%, ciclos biogeoquímicos y datos fascinantes sobre ecología explicados visualmente.',
    url: 'https://meskeia.com/visualizador-ecosistema/',
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
    title: 'Ciclos Biogeoquímicos',
    description: 'Pirámide trófica, flujo de energía, ciclos biogeoquímicos y redes tróficas explicados de forma visual.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Ecosistemas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Ciclo del Carbono y del Nitrógeno',
  description: 'Explicador visual interactivo sobre ecosistemas: pirámide trófica con 4 niveles, regla del 10% del flujo de energía, ciclos biogeoquímicos del carbono y nitrógeno, redes tróficas y datos fascinantes sobre ecología y naturaleza.',
  url: 'https://meskeia.com/visualizador-ecosistema/',
  category: 'EducationalApplication',
  features: [
    'Pirámide trófica interactiva con 4 niveles y descomponedores',
    'Regla del 10%: flujo de energía entre niveles tróficos',
    'Ciclos biogeoquímicos del carbono y nitrógeno con diagramas circulares',
    'Datos fascinantes sobre ecología y naturaleza',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la pirámide trófica y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pirámide trófica representa los niveles de alimentación en un ecosistema: productores (plantas), consumidores primarios (herbívoros), consumidores secundarios (carnívoros) y descomponedores. Cada nivel obtiene energía del inferior, pero solo transfiere aproximadamente el 10% de esa energía al siguiente nivel; el resto se pierde como calor. Por eso las poblaciones de depredadores son siempre mucho menores que las de sus presas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la regla del 10% en ecología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla del 10% establece que al pasar de un nivel trófico al siguiente solo se transfiere el 10% de la energía disponible; el 90% restante se disipa como calor metabólico. Esto significa que se necesitan 10 kg de plantas para producir 1 kg de herbívoro, y 10 kg de herbívoro para producir 1 kg de carnívoro. Esta limitación explica por qué las cadenas alimentarias rara vez superan los 4-5 eslabones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre cadena trófica y red trófica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una cadena trófica es una secuencia lineal de organismos donde cada uno se alimenta del anterior (hierba → conejo → zorro). Una red trófica es una representación más realista que muestra todas las interrelaciones alimentarias de un ecosistema, donde la mayoría de los organismos tienen múltiples fuentes de alimento y múltiples depredadores. Las redes tróficas son más estables ecológicamente porque la pérdida de una especie no destruye la cadena entera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el ciclo del carbono en los ecosistemas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo del carbono mueve este elemento entre la atmósfera, los seres vivos y el suelo. Las plantas lo capturan del CO₂ atmosférico mediante fotosíntesis y lo incorporan a su biomasa. Los animales lo obtienen al comer plantas u otros animales. La respiración y la descomposición de organismos muertos devuelven el carbono a la atmósfera. La quema de combustibles fósiles (carbono biológico acumulado durante millones de años) libera carbono extra que altera este equilibrio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve estudiar los ciclos biogeoquímicos como el del nitrógeno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ciclos biogeoquímicos explican cómo se reciclan los nutrientes esenciales para la vida. El ciclo del nitrógeno es especialmente importante porque este elemento es imprescindible para fabricar proteínas y ADN. El nitrógeno atmosférico (N₂) debe ser "fijado" por bacterias del suelo para que las plantas puedan utilizarlo. Entender estos ciclos permite comprender la fertilidad del suelo, los efectos de los fertilizantes artificiales y el impacto de la contaminación en los ecosistemas.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo del Carbono y del Nitrógeno: Ciclos Biogeoquímicos | meskeIA',
  description: 'Los ciclos biogeoquímicos explicados con diagramas interactivos: el ciclo del carbono y el ciclo del nitrógeno, etapa por etapa. Incluye la pirámide trófica y la regla del 10 % del flujo de energía.',
  keywords: 'ecosistema, pirámide trófica, cadena trófica, regla del 10 por ciento, ciclo carbono, ciclo nitrógeno, flujo energía, red trófica, productores, consumidores, descomponedores, ecología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ciclo del Carbono y del Nitrógeno',
    description: 'Pirámide trófica, regla del 10 %, ciclos biogeoquímicos y datos fascinantes sobre ecología explicados visualmente.',
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
  description: 'Explicador visual interactivo sobre ecosistemas: pirámide trófica con 4 niveles, regla del 10 % del flujo de energía, ciclos biogeoquímicos del carbono y nitrógeno, redes tróficas y datos fascinantes sobre ecología y naturaleza.',
  url: 'https://meskeia.com/visualizador-ecosistema/',
  category: 'EducationalApplication',
  features: [
    'Pirámide trófica interactiva con 4 niveles y descomponedores',
    'Regla del 10 %: flujo de energía entre niveles tróficos, como media y no como ley',
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
        // Hallazgo 1743: metía a los descomponedores como nivel (la app dice que no lo son) y decía
        // «siempre» de una pirámide de números que puede invertirse.
        text: 'La pirámide trófica representa los niveles de alimentación de un ecosistema: productores (plantas, algas), consumidores primarios (herbívoros) y consumidores secundarios y terciarios (carnívoros). Los descomponedores no ocupan un nivel propio: reciclan la materia muerta de todos ellos. Cada nivel aprovecha de media en torno al 10 % de la energía del anterior, así que la pirámide de energía se estrecha al subir. Las de biomasa y número de individuos suelen hacerlo también, pero pueden invertirse: en el mar, el zooplancton puede pesar más que el fitoplancton del que se alimenta, y un solo árbol sostiene a miles de insectos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la regla del 10 % en ecología?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Hallazgo 1734: la enunciaba como ley exacta y decía que «el 90 % restante se disipa como
        // calor metabólico», contra el reparto de la propia app (respiración, desechos, no consumido).
        text: 'Es una aproximación, no una ley exacta: de media, en torno al 10 % de la energía de un nivel trófico pasa a formar parte del siguiente. El resto no llega: una parte se disipa como calor en la respiración y otra queda en heces, desechos y partes no consumidas, que aprovechan los descomponedores. Se suele atribuir a Raymond Lindeman (1942), que citó eficiencias desde el 0,1 % hasta el 37,5 %, así que la cifra real varía mucho entre ecosistemas. Aplicada a grandes rasgos, hacen falta del orden de 10 kg de plantas por kg de herbívoro, y explica por qué las cadenas alimentarias rara vez superan los cuatro o cinco eslabones.',
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

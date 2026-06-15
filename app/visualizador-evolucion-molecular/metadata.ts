import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Evolución Molecular - ADN, Mutaciones y Reloj Molecular | meskeIA',
  description: 'Explora la evolución a nivel molecular: mutaciones en secuencias de ADN, reloj molecular, árboles filogenéticos y la evidencia genética de la evolución. Teoría neutralista de Kimura.',
  keywords: 'evolución molecular, reloj molecular, mutaciones ADN, árbol filogenético, teoría neutralista, Kimura, pseudogenes, genes ortólogos, MRCA, biología molecular, citocromo c',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Evolución Molecular - ADN, Mutaciones y Reloj Molecular',
    description: 'Simulador interactivo de mutaciones en secuencias de ADN, reloj molecular para datar divergencias evolutivas y constructor de árboles filogenéticos.',
    url: 'https://meskeia.com/visualizador-evolucion-molecular/',
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
    title: 'Evolución Molecular - Visualizador Interactivo',
    description: 'Mutaciones, reloj molecular y árboles filogenéticos: la evolución a nivel de secuencias de ADN.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Evolución Molecular meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Evolución Molecular - ADN, Mutaciones y Reloj Molecular',
  description: 'Visualizador interactivo de evolución molecular: simulación de mutaciones sinónimas y no sinónimas en secuencias de ADN, reloj molecular para estimar divergencias, constructor de árboles filogenéticos con 5 especies, y evidencia molecular de la evolución (pseudogenes, ERVs, secuencias Alu).',
  url: 'https://meskeia.com/visualizador-evolucion-molecular/',
  category: 'EducationalApplication',
  features: [
    'Simulador de mutaciones en secuencias de ADN: sinónimas vs no sinónimas',
    'Clasificación automática de mutaciones según la teoría neutralista de Kimura',
    'Reloj molecular interactivo: slider de tiempo y cálculo de divergencia d = 2μt',
    'Constructor de árbol filogenético con primates y cetáceos como ejemplos',
    'Evidencia molecular de la evolución: pseudogenes, ERVs, secuencias Alu',
    'Concepto MRCA (Most Recent Common Ancestor) visual e interactivo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la evolución molecular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La evolución molecular estudia cómo cambian las secuencias de ADN, ARN y proteínas a lo largo del tiempo entre linajes de organismos. A diferencia de la evolución morfológica (cambios en la forma), opera a nivel de nucleótidos y aminoácidos. Permite datar divergencias evolutivas, reconstruir árboles filogenéticos y entender qué genes son más conservados o más variables entre especies.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el reloj molecular y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reloj molecular es un método que asume que las mutaciones en el ADN se acumulan a una tasa aproximadamente constante en el tiempo. Midiendo el porcentaje de diferencias en secuencias homólogas entre dos especies y conociendo la tasa de mutación, se puede estimar cuándo divergieron sus ancestros comunes. Por ejemplo, los humanos y los chimpancés difieren en torno al 1,2 % en ADN codificante, lo que apunta a una divergencia hace unos 6-7 millones de años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una mutación sinónima y una no sinónima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una mutación sinónima (o silenciosa) cambia un nucleótido en el codón pero produce el mismo aminoácido gracias a la degeneración del código genético; por tanto, no altera la proteína. Una mutación no sinónima cambia el aminoácido codificado, lo que puede modificar la estructura o función de la proteína. Según la teoría neutralista de Kimura, la mayoría de las sustituciones fijadas en el genoma son sinónimas, neutras en términos de selección natural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los pseudogenes y por qué son evidencia de evolución?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los pseudogenes son copias no funcionales de genes que en algún momento cumplieron una función pero acumularon mutaciones hasta perderla. Son evidencia de evolución porque: (1) comparten la misma localización cromosómica y mutaciones concretas con genes funcionales de otros primates, lo que solo se explica por descendencia común; (2) no tendrían sentido como diseño independiente. El gen GULO, necesario para sintetizar vitamina C y no funcional en humanos y grandes simios, es un ejemplo clásico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los árboles filogenéticos y cómo se construyen con datos moleculares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un árbol filogenético es un diagrama que representa las relaciones evolutivas entre especies o genes, mostrando cuáles comparten un ancestro común más reciente. Con datos moleculares se construyen alineando secuencias homólogas y aplicando algoritmos como máxima parsimonia, máxima verosimilitud o UPGMA (análisis de distancias). Los nodos internos representan ancestros hipotéticos y la longitud de las ramas puede ser proporcional al número de sustituciones acumuladas.',
      },
    },
  ],
};

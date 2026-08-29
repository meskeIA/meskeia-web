import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Computación Cuántica — Qubits, Puertas Cuánticas y Algoritmo de Shor | meskeIA',
  description:
    'Entiende la computación cuántica: qubits vs bits, superposición, puertas cuánticas, paralelismo cuántico y por qué amenaza el cifrado RSA. Sin matemáticas complejas.',
  keywords: [
    'computacion cuantica',
    'qubit',
    'superposicion cuantica',
    'puertas cuanticas',
    'algoritmo shor',
    'amenaza RSA',
    'cifrado post-cuantico',
    'IBM quantum',
    'paralelismo cuantico',
    'esfera de Bloch',
  ],
  openGraph: {
    title: 'Computación Cuántica | meskeIA',
    description:
      'Qubits, puertas cuánticas y la amenaza al cifrado RSA explicados visualmente',
    url: 'https://meskeia.com/visualizador-computacion-cuantica/',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Computación Cuántica | meskeIA',
    description: 'Qubits, puertas cuánticas y la amenaza al cifrado RSA explicados visualmente',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Computación Cuántica - Qubits, Puertas y Algoritmo de Shor",
  description: "Entiende la computación cuántica: qubits vs bits, superposición, puertas cuánticas, paralelismo cuántico y por qué amenaza el cifrado RSA. Sin matemáticas complejas.",
  url: "https://meskeia.com/visualizador-computacion-cuantica/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un qubit y en qué se diferencia de un bit clásico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un qubit es la unidad básica de información en computación cuántica. A diferencia de un bit clásico, que solo puede valer 0 o 1, un qubit puede estar en superposición: una combinación de 0 y 1 simultáneamente hasta que se mide. Esto permite que los ordenadores cuánticos procesen muchas posibilidades a la vez, algo imposible con hardware convencional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la computación cuántica amenaza el cifrado RSA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado RSA se basa en la dificultad de factorizar números muy grandes en factores primos, un problema que un ordenador clásico tardaría millones de años en resolver. El algoritmo de Shor, diseñado para ordenadores cuánticos, puede factorizar esos números en tiempo polinómico, lo que rompería RSA en cuestión de horas una vez existan ordenadores cuánticos suficientemente potentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las puertas cuánticas y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las puertas cuánticas son operaciones matemáticas que manipulan el estado de uno o varios qubits, de forma análoga a como las puertas lógicas clásicas (AND, OR, NOT) operan sobre bits. Ejemplos comunes son la puerta Hadamard (que crea superposición), la puerta CNOT (que entrelaza dos qubits) y la puerta de fase. Las puertas cuánticas son siempre reversibles, a diferencia de la mayoría de puertas clásicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué aplicaciones prácticas se está usando ya la computación cuántica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hoy en día los ordenadores cuánticos disponibles (IBM, Google, IonQ) son aún ruidosos y tienen pocos qubits, por lo que se usan principalmente en investigación. Las aplicaciones más prometidas a corto-medio plazo incluyen simulación molecular para descubrir fármacos y materiales, optimización logística, criptografía post-cuántica y modelos financieros de riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el entrelazamiento cuántico y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El entrelazamiento cuántico es un fenómeno por el que dos o más qubits quedan correlacionados de tal manera que el estado de uno determina instantáneamente el del otro, sin importar la distancia física entre ellos. Esta propiedad es fundamental para la teleportación cuántica de información y para aumentar la potencia de cómputo de los algoritmos cuánticos, ya que permite coordinar múltiples qubits de forma eficiente.',
      },
    },
  ],
};

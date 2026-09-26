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
  features: [
    'Esfera de Bloch con probabilidades de medida según la regla de Born',
    'Simulación de la medición y del colapso del qubit',
    'Crecimiento exponencial de los estados con n qubits (2ⁿ)',
    'Tablas de las puertas X, H, CNOT y Z',
    'Estimaciones publicadas de recursos para romper RSA-2048, con su fuente',
    'Calendario de retirada de RSA y ECC y estándares post-cuánticos del NIST',
  ],
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
        text: 'Un qubit es la unidad básica de información en computación cuántica. A diferencia de un bit clásico, que solo puede valer 0 o 1, un qubit puede estar en superposición: una combinación de 0 y 1 hasta que se mide, y al medirlo da un solo resultado, 0 o 1, con probabilidades fijadas por esa combinación. La ventaja de los algoritmos cuánticos no consiste en leer muchas posibilidades a la vez, sino en hacer que las amplitudes de las respuestas incorrectas se cancelen por interferencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la computación cuántica amenaza el cifrado RSA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado RSA se basa en la dificultad de factorizar números muy grandes en factores primos, un problema inviable en la práctica para los ordenadores clásicos: el récord de factorización, de 2020, es un número de 829 bits, lejos de los 2.048 de una clave RSA habitual. El algoritmo de Shor factoriza en tiempo polinómico en un ordenador cuántico; la estimación publicada en 2025 (Gidney) calcula que romper RSA-2048 exigiría menos de un millón de qubits físicos durante menos de una semana, una máquina que aún no existe.',
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
        text: 'El entrelazamiento cuántico es un fenómeno por el que dos o más qubits quedan correlacionados de forma que sus resultados al medirlos coinciden (o se oponen) más de lo que permite cualquier explicación clásica, sin importar la distancia entre ellos. No sirve para enviar información más rápido que la luz. Es un recurso clave de la teleportación cuántica y de muchos algoritmos cuánticos; la puerta CNOT aplicada tras una Hadamard es la forma más sencilla de crearlo.',
      },
    },
  ],
};

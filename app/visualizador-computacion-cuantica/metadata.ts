import type { Metadata } from 'next';

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
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

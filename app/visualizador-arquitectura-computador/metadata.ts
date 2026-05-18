import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Arquitectura del Computador — CPU, Ciclo Fetch-Decode-Execute y Memoria | meskeIA',
  description:
    'Visualiza cómo funciona un computador: arquitectura Von Neumann, CPU con ALU y registros, ciclo fetch-decode-execute animado y jerarquía de memoria. Para estudiantes de informática.',
  keywords:
    'arquitectura computador, Von Neumann, CPU, ALU, fetch decode execute, registros, jerarquía memoria, caché, RAM, informática bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Arquitectura del Computador — CPU, Ciclo FDE y Memoria',
    description:
      'Diagrama Von Neumann interactivo, componentes de la CPU, ciclo fetch-decode-execute animado y jerarquía de memoria con latencias reales.',
    url: 'https://meskeia.com/visualizador-arquitectura-computador',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arquitectura del Computador — CPU, FDE y Memoria | meskeIA',
    description:
      'Von Neumann, ALU, registros y ciclo fetch-decode-execute explicados de forma visual e interactiva.',
  },
  other: {
    'application-name': 'Arquitectura Computador meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Arquitectura del Computador',
  description:
    'Visualizador interactivo de la arquitectura Von Neumann: CPU con ALU y registros, ciclo fetch-decode-execute animado paso a paso y jerarquía de memoria con latencias reales. Para estudiantes de informática y Bachillerato tecnológico.',
  url: 'https://meskeia.com/visualizador-arquitectura-computador/',
  features: [
    'Diagrama Von Neumann interactivo: CPU, RAM, ROM, buses y dispositivos E/S',
    'Componentes de la CPU: ALU, Unidad de Control, PC, IR, MAR, MDR, ACC',
    'Ciclo fetch-decode-execute animado paso a paso con mini-programa de ejemplo',
    'Jerarquía de memoria: de registros a HDD con velocidad, tamaño y latencia reales',
    'Ideal para 1º de carrera de informática y Bachillerato tecnológico',
    'Gratuito, sin registro, 100% en el navegador',
    'Disponible en español',
  ],
});

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
    url: 'https://meskeia.com/visualizador-evolucion-molecular',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evolución Molecular - Visualizador Interactivo',
    description: 'Mutaciones, reloj molecular y árboles filogenéticos: la evolución a nivel de secuencias de ADN.',
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
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Disponible en español',
  ],
});

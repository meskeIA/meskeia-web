import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-microbiologia';
const TITLE = 'Microbiología: Bacterias, Gram y Dominios de la Vida';
const DESCRIPTION = 'Explora las morfologías bacterianas, curva de crecimiento logístico, diferencia Gram+/Gram-, conjugación y esporulación, y el árbol de los 3 dominios de la vida: Archaea, Bacteria y Eukarya.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: 'meskeIA', type: 'website' },
};

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    category: 'EducationalApplication',
    features: [
      'Morfologías bacterianas: cocos, bacilos y espirilos con SVG interactivo',
      'Diagrama de estructura bacteriana con 8 partes clicables (cápsula, pared, membrana, nucleoide, plásmidos, ribosomas, flagelo, pili)',
      'Curva de crecimiento logístico con sliders de tiempo de generación y capacidad de carga',
      'Calculadora de división binaria: N = N₀ × 2^(t/t_d)',
      'Procesos especiales: conjugación, esporulación y transformación con animaciones SVG',
      'Comparativa Gram+ vs Gram− con diagrama de pared celular y ejemplos clínicos',
      'Tabla de sensibilidad a antibióticos: penicilinas, aminoglucósidos, polimixinas, vancomicina',
      'Árbol de los 3 dominios de la vida (Woese, 1977): Bacteria, Archaea y Eukarya',
      'Teoría endosimbiótica: evidencias de que mitocondrias y cloroplastos fueron bacterias',
      'Gratuito, sin registro, disponible en español',
    ],
  });
}

import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Partículas Subatómicas y Modelo Estándar - Quarks, Leptones, Bosones | meskeIA',
  description:
    'Explora el Modelo Estándar de la física de partículas: quarks, leptones y bosones. Mecanismo de Higgs, las 4 fuerzas fundamentales, el LHC y por qué existe más materia que antimateria.',
  keywords: [
    'modelo estandar',
    'particulas subatomicas',
    'quarks',
    'leptones',
    'bosones',
    'higgs',
    'LHC',
    'fuerzas fundamentales',
    'fisica de particulas',
    'gluon',
    'foton',
    'antimateria',
    'mecanismo de higgs',
  ],
  openGraph: {
    title: 'Partículas Subatómicas | meskeIA',
    description:
      'Modelo Estándar completo: quarks, leptones, bosones y las 4 fuerzas fundamentales con visualizaciones interactivas',
    url: 'https://meskeia.com/visualizador-particulas-subatomicas/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Partículas Subatómicas y Modelo Estándar',
  description:
    'Explora el Modelo Estándar de la física de partículas: quarks, leptones y bosones. Mecanismo de Higgs, las 4 fuerzas fundamentales, el LHC y por qué existe más materia que antimateria.',
  url: 'https://meskeia.com/visualizador-particulas-subatomicas/',
  features: [
    'Tabla interactiva del Modelo Estándar con 17 partículas fundamentales',
    'Panel de detalles de cada partícula: masa, carga, spin, descubrimiento',
    'Toggle de antipartículas',
    'Badges Nobel para partículas con premio Nobel',
    'Las 4 fuerzas fundamentales y sus portadores',
    'Diagramas de Feynman simplificados',
    'Animación del mecanismo de Higgs',
    'Línea de tiempo del descubrimiento del bosón de Higgs',
    'Visualización del LHC y sus detectores',
    'Explicación de la asimetría materia-antimateria',
  ],
  category: 'EducationalApplication',
  keywords: [
    'modelo estandar',
    'quarks',
    'leptones',
    'bosones',
    'higgs',
    'LHC',
    'fuerzas fundamentales',
    'fisica particulas',
  ],
});

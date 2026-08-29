import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-microbiologia';
const TITLE = 'Microbiología: Bacterias, Gram y Dominios de la Vida - meskeIA';
const DESCRIPTION = 'Explora las morfologías bacterianas, curva de crecimiento logístico, diferencia Gram+/Gram-, conjugación y esporulación, y el árbol de los 3 dominios de la vida: Archaea, Bacteria y Eukarya.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: 'meskeIA', type: 'website', images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }] },
  twitter: { card: 'summary_large_image', images: ['https://meskeia.com/stemum/og-image.png'] },
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

export const jsonLd = generateWebAppSchema({
  name: "Microbiología: Bacterias, Crecimiento y Tres Dominios de la Vida",
  description: "Visualizador interactivo de microbiología. Morfologías bacterianas clicables (cocos, bacilos, espirilos) con estructura interna detallada, curva de crecimiento logístico con sliders β y K, Gram+/Gram-",
  url: "https://meskeia.com/visualizador-microbiologia/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre bacterias Gram positivas y Gram negativas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tinción de Gram clasifica las bacterias según la composición de su pared celular. Las bacterias Gram positivas tienen una gruesa capa de peptidoglicano que retiene el colorante violeta de cristal, apareciendo de color morado al microscopio. Las Gram negativas tienen una capa de peptidoglicano delgada rodeada por una membrana externa adicional que no retiene el colorante, por lo que aparecen en rojo tras la contratinción. Esta diferencia es clínicamente relevante porque determina la eficacia de distintos antibióticos: la penicilina actúa principalmente sobre Gram positivas, mientras que las polimixinas son efectivas contra Gram negativas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo crecen las bacterias y qué es la curva de crecimiento logístico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las bacterias se reproducen por división binaria: una célula se divide en dos, generando crecimiento exponencial. Sin embargo, en condiciones reales la disponibilidad de nutrientes y la acumulación de desechos limitan el crecimiento. El modelo logístico describe esto con la ecuación dN/dt = r·N·(1 − N/K), donde r es la tasa de crecimiento y K la capacidad de carga del medio. La curva resultante tiene forma de S (sigmoide): fase lag, fase exponencial, fase estacionaria y fase de declive.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los tres dominios de la vida y quién los propuso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El biólogo Carl Woese propuso en 1977, a partir del análisis del ARN ribosomal 16S, que la vida se divide en tres dominios fundamentales: Bacteria, Archaea y Eukarya. Bacteria y Archaea son organismos procariotas (sin núcleo definido), pero difieren profundamente en la composición de sus membranas y en su bioquímica. Los eucariotas (Eukarya) poseen núcleo y orgánulos membranosos. La teoría endosimbiótica explica que las mitocondrias y los cloroplastos de las células eucariotas tienen origen bacteriano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la conjugación bacteriana y por qué es relevante en resistencia a antibióticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La conjugación es un mecanismo de transferencia horizontal de genes en el que una bacteria dona material genético (generalmente un plásmido) a otra mediante un contacto físico llamado pili. Es uno de los principales mecanismos por los que los genes de resistencia a antibióticos se propagan entre bacterias de la misma especie o incluso entre especies distintas. Esto explica por qué la resistencia puede diseminarse rápidamente en un hospital o en la comunidad sin que intervenga la reproducción clásica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este visualizador de microbiología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está orientado a estudiantes de bachillerato y primeros cursos universitarios de biología, farmacia, medicina y ciencias de la salud. Permite explorar de forma visual e interactiva conceptos como morfología bacteriana, tinción de Gram, crecimiento logístico y los tres dominios de la vida, sin necesidad de software especializado ni registro. También resulta útil para docentes que busquen recursos didácticos dinámicos para sus clases de microbiología.',
      },
    },
  ],
};

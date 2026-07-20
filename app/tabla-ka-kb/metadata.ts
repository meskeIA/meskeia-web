import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Ka y Kb — Constantes de Acidez con Calculadora de pH | meskeIA',
  description:
    'Tabla de constantes de acidez y basicidad (Ka, Kb, pKa, pKb) a 25 °C con buscador: ácidos fuertes y débiles, orgánicos, polipróticos y bases, más calculadora de pH y de disolución reguladora.',
  keywords:
    'tabla ka kb, constante de acidez, constante de basicidad, pka, pkb, tabla de pka, calcular ph acido debil, henderson hasselbalch, disolucion reguladora, tampon, buffer, par conjugado, quimica general',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-ka-kb/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Ka y Kb con Calculadora de pH | meskeIA',
    description:
      'Busca cualquier ácido o base y obtén su Ka, pKa, la especie conjugada y su Kb, con el equilibrio escrito y el cálculo del pH para la concentración que tú elijas.',
    url: 'https://meskeia.com/tabla-ka-kb/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabla de Ka y Kb con Calculadora de pH | meskeIA',
    description:
      'Constantes de acidez y basicidad a 25 °C, con equilibrios, pares conjugados, cálculo de pH y ecuación de Henderson-Hasselbalch.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Ka y Kb meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Constantes de Acidez y Basicidad (Ka, Kb, pKa, pKb)',
  description:
    'Tabla de consulta con las constantes de acidez y basicidad a 25 °C de ácidos fuertes, ácidos débiles inorgánicos y orgánicos, ácidos polipróticos con sus constantes sucesivas, bases fuertes, bases débiles y bases conjugadas. Cada entrada incluye el equilibrio de disociación escrito, Ka, pKa, la especie conjugada con su Kb y pKb, y la comprobación numérica de la relación Ka·Kb = Kw. Incorpora una calculadora de pH con control de la aproximación del 5 % y una calculadora de disolución reguladora con la ecuación de Henderson-Hasselbalch.',
  url: 'https://meskeia.com/tabla-ka-kb/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo por fórmula, nombre y sinónimos, tolerante a acentos',
    'Constantes a 25 °C organizadas en 7 categorías filtrables',
    'Equilibrio de disociación escrito en cada entrada',
    'Par conjugado con su Kb y pKb, y comprobación de Ka·Kb = Kw',
    'Calculadora de pH con aproximación del 5 % y aviso cuando no es válida',
    'Calculadora de disolución reguladora con Henderson-Hasselbalch y rango útil pKa ± 1',
    'Indicador de fuerza en escala de pKa legible sin depender del color',
    'Funciona 100 % en el navegador, sin registro ni instalación',
  ],
  keywords: ['tabla ka kb', 'constante de acidez', 'pka', 'henderson-hasselbalch', 'pH'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre Ka y pKa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ka es la constante de equilibrio de la disociación del ácido en agua y pKa es su logaritmo cambiado de signo: pKa = −log Ka. Manejar pKa es más cómodo porque convierte números como 1,8×10⁻⁵ en 4,74. La escala está invertida: cuanto mayor es Ka, más fuerte es el ácido, pero cuanto menor es su pKa, más fuerte es. Una diferencia de una unidad de pKa equivale a un factor 10 en Ka.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el pH de un ácido débil conociendo su Ka?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para un ácido monoprótico HA de concentración C se plantea Ka = x²/(C − x), donde x es [H₃O⁺]. Si la disociación es pequeña se aproxima C − x ≈ C y queda x = √(Ka·C), con pH = −log x. La aproximación se acepta cuando x resulta menor que el 5 % de C; si lo supera, hay que resolver la ecuación de segundo grado x² + Ka·x − Ka·C = 0 y quedarse con la raíz positiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los ácidos fuertes no tienen un valor de Ka útil en agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque HCl, HBr, HI, HNO₃, HClO₄ y la primera disociación del H₂SO₄ se disocian prácticamente al 100 %, de modo que en disolución acuosa todos quedan convertidos en H₃O⁺ y no se distinguen entre sí. Es el efecto nivelador del disolvente: el agua no puede diferenciar ácidos más fuertes que el ion hidronio. Sus Ka aparecen tabuladas como valores muy grandes y aproximados, medidos en disolventes menos básicos que el agua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación hay entre la Ka de un ácido y la Kb de su base conjugada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se cumple Ka·Kb = Kw = 1,0×10⁻¹⁴ a 25 °C, lo que en forma logarítmica equivale a pKa + pKb = 14. Por ejemplo, el ácido acético tiene Ka = 1,8×10⁻⁵ (pKa 4,74), así que su base conjugada, el ion acetato, tiene Kb = 5,6×10⁻¹⁰ (pKb 9,26). La consecuencia práctica es que cuanto más fuerte es un ácido, más débil es su base conjugada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se elige el ácido adecuado para preparar una disolución reguladora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se busca un par ácido-base conjugado cuyo pKa esté lo más cerca posible del pH deseado, porque un tampón funciona bien en el intervalo pKa ± 1. Con la ecuación de Henderson-Hasselbalch, pH = pKa + log([base]/[ácido]), se ajusta la proporción: cuando las dos concentraciones son iguales, el pH coincide exactamente con el pKa. Para pH próximo a 7 suele usarse el par H₂PO₄⁻/HPO₄²⁻ (pKa 7,21) y para pH cercano a 5 el par acético/acetato (pKa 4,74).',
      },
    },
  ],
};

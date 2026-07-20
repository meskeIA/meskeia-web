import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Solubilidad — Reglas, Iones Poliatómicos y Kps | meskeIA',
  description:
    'Tabla de solubilidad en agua con buscador: reglas y sus excepciones, más de 40 iones poliatómicos con nombre IUPAC y tradicional, valores de Kps a 25 °C y un comprobador que dice si un catión y un anión precipitan.',
  keywords:
    'tabla de solubilidad, reglas de solubilidad, iones poliatómicos, producto de solubilidad, kps, precipitado, sales insolubles, ecuación iónica neta, química general, solubilidad en agua',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-solubilidad/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Solubilidad con Comprobador de Precipitación | meskeIA',
    description:
      'Elige un catión y un anión y averigua al instante si el compuesto precipita, con la fórmula bien formulada, la regla que lo justifica y la ecuación iónica neta.',
    url: 'https://meskeia.com/tabla-solubilidad/',
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
    title: 'Tabla de Solubilidad con Comprobador de Precipitación | meskeIA',
    description:
      'Reglas de solubilidad con sus excepciones, iones poliatómicos y Kps a 25 °C, con buscador instantáneo.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Solubilidad meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Solubilidad',
  description:
    'Tabla de solubilidad en agua con tres bloques consultables: 21 reglas de solubilidad con sus excepciones y un ejemplo de precipitación resuelto en forma molecular, iónica completa e iónica neta; más de 40 iones poliatómicos con fórmula, carga, nombre IUPAC y nombre tradicional; y 26 productos de solubilidad Kps a 25 °C con la expresión de la constante y el cálculo de la solubilidad molar. Incluye un comprobador que combina cualquier catión con cualquier anión e indica si el compuesto precipita.',
  url: 'https://meskeia.com/tabla-solubilidad/',
  category: 'EducationalApplication',
  features: [
    'Comprobador de precipitación: elige catión y anión y obtén la fórmula, el estado y la regla aplicable',
    'Fórmula del compuesto construida automáticamente cruzando cargas y simplificando',
    'Ecuación molecular, iónica completa e iónica neta de cada precipitación',
    '21 reglas de solubilidad con sus excepciones explícitas',
    'Más de 40 iones poliatómicos con nombre IUPAC y tradicional',
    '26 valores de Kps a 25 °C con expresión de la constante y solubilidad molar',
    'Buscador instantáneo tolerante a acentos y con sinónimos',
    'Funciona 100% en el navegador, gratis y sin registro',
  ],
  keywords: ['tabla de solubilidad', 'iones poliatómicos', 'Kps', 'precipitado'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las reglas de solubilidad en agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son solubles todos los nitratos, acetatos, cloratos y percloratos, todas las sales de metales alcalinos (Li, Na, K, Rb, Cs) y de amonio, los cloruros, bromuros y yoduros salvo los de plata, plomo(II) y mercurio(I), y los sulfatos salvo los de bario, estroncio y plomo. Son insolubles los carbonatos, fosfatos, cromatos, sulfuros e hidróxidos, excepto los de metales alcalinos y amonio. El hidróxido de bario es soluble y los de calcio y estroncio son parcialmente solubles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se sabe si dos disoluciones forman un precipitado al mezclarlas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se identifican los cuatro iones presentes y se cruzan: el catión de una sal con el anión de la otra. Si alguna de las dos combinaciones nuevas es insoluble según las reglas de solubilidad, esa sal precipita. Por ejemplo, al mezclar nitrato de plata y cloruro de sodio se forma AgCl, que es insoluble, mientras que el nitrato de sodio permanece disuelto: la ecuación iónica neta es Ag⁺ + Cl⁻ → AgCl↓.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Kps o producto de solubilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Kps es la constante de equilibrio de la disolución de un sólido poco soluble, igual al producto de las concentraciones de sus iones en disolución saturada elevadas a sus coeficientes estequiométricos. Para AgCl(s) ⇌ Ag⁺ + Cl⁻ se cumple Kps = [Ag⁺]·[Cl⁻] = 1,8×10⁻¹⁰ a 25 °C. Cuanto menor es el Kps, menos soluble es el compuesto, pero solo se pueden comparar directamente sales con la misma estequiometría.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la solubilidad molar a partir del Kps?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se llama s a la solubilidad molar, se escriben las concentraciones de los iones en función de s y se sustituye en la expresión del Kps. Para una sal 1:1 como AgCl, Kps = s², luego s = √Kps = 1,3×10⁻⁵ mol/L. Para una sal 1:2 como CaF₂, Kps = s·(2s)² = 4s³, de donde s es la raíz cúbica de Kps/4, unos 2,1×10⁻⁴ mol/L.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las excepciones más preguntadas de las reglas de solubilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cuatro que más aparecen en examen son: los halogenuros de plata, plomo(II) y mercurio(I), que no se disuelven pese a la regla general de los cloruros; los sulfatos de bario, estroncio y plomo, insolubles, con sulfato de calcio y de plata poco solubles; el hidróxido de bario, que sí es soluble frente al resto de hidróxidos; y el carbonato de litio, poco soluble a pesar de ser una sal alcalina.',
      },
    },
  ],
};

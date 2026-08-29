import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Formulación y Nomenclatura Inorgánica: Fórmula ⇄ Nombre - meskeIA',
  description: 'Escribe una fórmula y obtén los tres nombres (sistemática, stock y tradicional) con los números de oxidación razonados. También al revés: del nombre a la fórmula, señalando el error si lo hay.',
  keywords: 'formulacion inorganica, nomenclatura inorganica, nomenclatura stock, nomenclatura sistematica, nomenclatura tradicional, numeros de oxidacion, valencias, oxidos, hidroxidos, oxoacidos, oxosales, sales binarias, hidruros, ejercicios formulacion quimica, secundaria, bachillerato, preparatoria, educacion media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/formulador-compuestos-inorganicos/',
  },
  openGraph: {
    type: 'website',
    title: 'Formulación y Nomenclatura Inorgánica: Fórmula ⇄ Nombre - meskeIA',
    description: 'Los tres nombres de cada compuesto inorgánico, con el número de oxidación deducido paso a paso. Incluye modo de práctica con corrección automática.',
    url: 'https://meskeia.com/formulador-compuestos-inorganicos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formulación y Nomenclatura Inorgánica: Fórmula ⇄ Nombre - meskeIA',
    description: 'De la fórmula al nombre y del nombre a la fórmula, con los números de oxidación razonados y modo de práctica.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Formulación Inorgánica meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Formulación y Nomenclatura Inorgánica: Fórmula ⇄ Nombre',
  description: 'Herramienta que analiza una fórmula inorgánica, identifica la familia de compuesto, deduce los números de oxidación y devuelve los nombres en nomenclatura sistemática, de stock y tradicional. Funciona también en sentido inverso, construyendo la fórmula a partir del nombre, e incluye un modo de práctica con corrección automática.',
  url: 'https://meskeia.com/formulador-compuestos-inorganicos/',
  category: 'EducationalApplication',
  features: [
    'Análisis de fórmulas con paréntesis y subíndices: Fe2O3, Ca(OH)2, Al2(SO4)3',
    'Los tres nombres a la vez: sistemática con prefijos, stock con números romanos y tradicional con sufijos',
    'Números de oxidación deducidos y comprobados por electroneutralidad',
    'Sentido inverso: del nombre a la fórmula, en cualquiera de las tres nomenclaturas',
    'Diez familias cubiertas: óxidos, peróxidos, hidruros, hidrácidos, hidróxidos, oxoácidos, sales binarias y oxosales',
    'Modo de práctica con ejercicios generados y corrección automática',
    'Razonamiento paso a paso de cómo se construye cada nombre',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las tres nomenclaturas de la química inorgánica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sistemática usa prefijos multiplicadores que cuentan átomos: Fe2O3 es trióxido de dihierro. La de stock indica el número de oxidación en números romanos entre paréntesis: óxido de hierro(III). La tradicional lo indica con sufijos sobre la raíz del elemento: óxido férrico, donde -oso señala la valencia menor y -ico la mayor. Las tres nombran el mismo compuesto; la IUPAC recomienda las dos primeras, pero la tradicional sigue siendo la más usada para ácidos y sales en los libros de texto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el número de oxidación de un elemento en un compuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se parte de que la suma de todos los números de oxidación multiplicados por sus subíndices debe dar cero en un compuesto neutro. El oxígeno actúa con −2 (salvo en peróxidos, donde es −1) y el hidrógeno con +1 frente a no metales y −1 frente a metales. En Fe2O3 se plantea 2x + 3(−2) = 0, de donde x = +3. Ese es el número que se escribe en romanos en la nomenclatura de stock y el que decide el sufijo en la tradicional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se usa -oso y cuándo -ico en la nomenclatura tradicional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de cuántos números de oxidación tenga el elemento. Con dos, el menor lleva -oso y el mayor -ico: hierro(II) es ferroso y hierro(III) es férrico. Con tres se añade el prefijo hipo- para el más bajo: hipocloroso, cloroso, clórico. Con cuatro se añade además per- para el más alto: hipocloroso, cloroso, clórico, perclórico. Cuando el elemento tiene un solo número de oxidación no hay ambigüedad y se usa directamente -ico o la forma con preposición: óxido cálcico u óxido de calcio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el sulfato se llama sulfato y no sulfúrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque cambia el sufijo al pasar del ácido a su sal. Cuando el hidrógeno del oxoácido se sustituye por un metal, el sufijo -oso del ácido pasa a -ito y el -ico pasa a -ato. Así, del ácido sulfúrico sale el sulfato y del ácido sulfuroso el sulfito; del ácido nítrico, el nitrato, y del nitroso, el nitrito. Los prefijos hipo- y per- se conservan: del ácido hipocloroso sale el hipoclorito y del perclórico, el perclorato.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un óxido metálico y un anhídrido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La composición es la misma —un elemento combinado con oxígeno— y lo que cambia es si ese elemento es metal o no metal. Los óxidos metálicos como CaO reaccionan con agua dando hidróxidos, y por eso se llaman óxidos básicos. Los de no metal como SO3 dan oxoácidos al reaccionar con agua, y la nomenclatura tradicional los llamaba anhídridos: anhídrido sulfúrico. La IUPAC dejó de recomendar ese término, así que hoy conviven trióxido de azufre, óxido de azufre(VI) y anhídrido sulfúrico para el mismo compuesto.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Grupos Funcionales — Nomenclatura IUPAC y Prioridad | meskeIA',
  description:
    'Tabla de grupos funcionales de química orgánica con buscador: fórmula, sufijo y prefijo IUPAC, ejemplo resuelto, diagrama del grupo y orden de prioridad ordenable para saber cuál manda al nombrar.',
  keywords:
    'grupos funcionales, tabla de grupos funcionales, nomenclatura IUPAC, orden de prioridad grupos funcionales, sufijos y prefijos IUPAC, quimica organica, acido carboxilico, aldehido, cetona, amina, amida, ester, eter, alcohol, nitrilo, tiol',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-grupos-funcionales/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Grupos Funcionales con Orden de Prioridad IUPAC | meskeIA',
    description:
      'Busca «COOH», «cetona» o «amina» y obtén fórmula, sufijo, prefijo, ejemplo y propiedades. Ordena la tabla por prioridad IUPAC y descubre qué grupo manda cuando hay varios.',
    url: 'https://meskeia.com/tabla-grupos-funcionales/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabla de Grupos Funcionales con Orden de Prioridad IUPAC | meskeIA',
    description:
      'Fórmula, sufijo, prefijo, ejemplo, diagrama y propiedades de 31 grupos funcionales, con la escalera de prioridad IUPAC ordenable.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Grupos Funcionales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Grupos Funcionales',
  description:
    'Tabla interactiva de 31 grupos funcionales de química orgánica: hidrocarburos, oxigenados, nitrogenados, azufrados, halogenados y organometálicos. Cada grupo incluye su fórmula, el sufijo y el prefijo IUPAC, un ejemplo con nombre y fórmula, un diagrama esquemático, sus propiedades características y su posición en el orden de prioridad IUPAC, que puede ordenarse con un clic.',
  url: 'https://meskeia.com/tabla-grupos-funcionales/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo por nombre, fórmula y sinónimos, tolerante a acentos',
    '31 grupos funcionales organizados en 6 categorías filtrables',
    'Orden de prioridad IUPAC ordenable con un clic',
    'Sufijo y prefijo de cada grupo, con la forma correcta según sea principal o sustituyente',
    'Diagrama esquemático del grupo con descripción textual accesible',
    'Nombre construido paso a paso en un ejemplo concreto por grupo',
    'Propiedades características: polaridad, puentes de hidrógeno, solubilidad y punto de ebullición',
    'Funciona 100 % en el navegador, sin registro ni instalación',
  ],
  keywords: [
    'grupos funcionales',
    'nomenclatura IUPAC',
    'orden de prioridad',
    'química orgánica',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es el orden de prioridad de los grupos funcionales en la nomenclatura IUPAC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De mayor a menor: ácido carboxílico, ácido sulfónico, anhídrido, éster, haluro de acilo, amida, nitrilo, aldehído, cetona, alcohol y fenol, tiol, amina, imina y éter. Por debajo quedan los dobles y triples enlaces y, al final, los grupos que solo pueden ser prefijo (halógenos, nitro, azo, isocianato, epoxi). El grupo más alto presente da el sufijo y numera la cadena; todos los demás pasan a prefijo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo un grupo funcional se nombra como sufijo y cuándo como prefijo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Solo el grupo de mayor prioridad presente en la molécula se nombra como sufijo, y es el que fija la numeración de la cadena principal buscando el localizador más bajo. El resto de grupos se nombran como prefijos por orden alfabético. Por ejemplo, en CH₃-CH(OH)-COOH el ácido gana al alcohol, así que el nombre es ácido 2-hidroxipropanoico y el -OH aparece como «hidroxi».',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un aldehído y una cetona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los dos tienen el grupo carbonilo C=O, pero en el aldehído ese carbono está en un extremo de la cadena y lleva un hidrógeno (-CHO), mientras que en la cetona está en el interior y se une a dos carbonos. El aldehído usa el sufijo -al y siempre ocupa la posición 1; la cetona usa -ona y necesita un localizador. Además el aldehído se oxida con facilidad a ácido carboxílico y la cetona no.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los alcoholes hierven a temperatura mucho más alta que los éteres de masa parecida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque el alcohol tiene un hidrógeno unido a oxígeno y puede formar puentes de hidrógeno entre sus propias moléculas, mientras que el éter solo puede aceptarlos, no donarlos. El etanol (masa molar 46 g/mol) hierve a 78 °C y el éter dimetílico (46 g/mol) a −24 °C, más de 100 grados de diferencia con la misma fórmula molecular C₂H₆O.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se reconoce un grupo funcional a partir de la fórmula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se busca el heteroátomo (O, N, S, halógeno) y qué lo rodea: -OH al final es alcohol, -COOH es ácido carboxílico, -CHO es aldehído, C=O entre carbonos es cetona, -COO- es éster, -CONH₂ es amida, -C≡N es nitrilo y -NH₂ es amina primaria. Si solo hay carbono e hidrógeno, es un hidrocarburo y basta con mirar si tiene enlaces dobles, triples o un anillo aromático.',
      },
    },
  ],
};

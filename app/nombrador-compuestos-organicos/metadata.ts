import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Nomenclatura Orgánica: Nombra y Corrige Compuestos | meskeIA',
  description: 'Monta la cadena de carbonos y obtén el nombre IUPAC con la numeración explicada paso a paso. También al revés: escribe un nombre y comprueba si está bien formulado.',
  keywords: 'nomenclatura organica, nombrar compuestos organicos, formulacion organica, nombre iupac, como numerar la cadena principal, localizadores, sustituyentes, alcanos alquenos alquinos, alcohol aldehido cetona acido carboxilico, prioridad grupos funcionales, quimica organica, secundaria, bachillerato, preparatoria, educacion media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/nombrador-compuestos-organicos/',
  },
  openGraph: {
    type: 'website',
    title: 'Nomenclatura Orgánica: Nombra y Corrige Compuestos | meskeIA',
    description: 'Coloca los grupos donde están y la herramienta numera la cadena, elige el sentido correcto y explica por qué. Incluye corrector de nombres IUPAC.',
    url: 'https://meskeia.com/nombrador-compuestos-organicos/',
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
    title: 'Nomenclatura Orgánica: Nombra y Corrige Compuestos | meskeIA',
    description: 'Del esqueleto al nombre IUPAC, con la numeración razonada. Y del nombre al esqueleto, señalando el error si lo hay.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Nomenclatura Orgánica meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Nomenclatura Orgánica: Nombrador y Corrector de Compuestos',
  description: 'Herramienta que aplica las reglas IUPAC a cadenas abiertas de hasta 12 carbonos: elige el sentido de numeración, ordena los sustituyentes alfabéticamente, coloca los prefijos multiplicadores y devuelve el nombre, la fórmula molecular y la fórmula semidesarrollada. Funciona también en sentido inverso, corrigiendo nombres mal formulados.',
  url: 'https://meskeia.com/nombrador-compuestos-organicos/',
  category: 'EducationalApplication',
  features: [
    'Construcción visual del esqueleto de carbono con grupos funcionales y sustituyentes',
    'Numeración automática de la cadena con la regla aplicada explicada en texto',
    'Nombre IUPAC moderno (hexan-2-ol) y variante clásica (2-hexanol)',
    'Fórmula molecular y fórmula semidesarrollada generadas a la vez',
    'Corrector inverso: escribe un nombre y señala si la numeración o la cadena principal están mal',
    'Ocho grupos funcionales con su orden de prioridad y doce sustituyentes frecuentes',
    'Detecta carbonos sin enlaces libres y avisa antes de nombrar',
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
      name: '¿Por dónde se empieza a numerar la cadena principal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se numera por el extremo que dé el localizador más bajo al grupo funcional principal. Si no hay grupo funcional con sufijo, manda la insaturación: el doble o triple enlace debe recibir el número más bajo. Si tampoco hay insaturación, se elige el sentido que dé el conjunto de localizadores más bajo a los sustituyentes, comparándolos uno a uno. Y si aun así hay empate, gana el sentido que dé el número menor al sustituyente que va antes por orden alfabético.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué grupo funcional manda cuando hay varios en la misma molécula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El orden de prioridad para llevar el sufijo es: ácido carboxílico, amida, nitrilo, aldehído, cetona, alcohol y amina. El grupo más prioritario da el sufijo y fija la numeración; los demás pasan a prefijo (hidroxi-, oxo-, amino-). Los dobles y triples enlaces nunca ganan a un grupo funcional: se quedan en el infijo -en- o -in-, aunque sí mandan sobre los sustituyentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se dice hexan-2-ol o 2-hexanol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las dos formas designan el mismo compuesto y se entienden igual. Hexan-2-ol es la forma recomendada por la IUPAC desde 2013: el localizador se coloca justo delante del sufijo al que se refiere, lo que evita ambigüedades en moléculas con varios grupos. La forma 2-hexanol es la clásica, agrupa todos los localizadores al principio y sigue siendo mayoritaria en muchos libros de texto de España y América Latina, así que conviene reconocer ambas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué está mal el nombre 2-etilbutano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque la cadena principal elegida no es la más larga. Si dibujas un butano con un etilo en el carbono 2, al recorrer la molécula por otro camino aparecen cinco carbonos seguidos: la cadena principal es un pentano y el nombre correcto es 3-metilpentano. La señal de alarma es siempre la misma: un sustituyente con dos o más carbonos en el segundo carbono de la cadena suele significar que había una cadena más larga sin ver.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se ordenan los sustituyentes dentro del nombre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se citan por orden alfabético, no por su localizador. Los prefijos multiplicadores di-, tri- y tetra- no cuentan para alfabetizar: en 4-etil-2,3-dimetilhexano, el etilo va antes que el metilo aunque tenga el número más alto. El prefijo terc- tampoco cuenta (terc-butilo alfabetiza por la b), pero iso- sí forma parte del nombre y alfabetiza por la i.',
      },
    },
  ],
};

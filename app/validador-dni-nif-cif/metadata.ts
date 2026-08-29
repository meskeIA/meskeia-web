import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// App estructuralmente española (documentos de identidad y NIF de España):
// no aplica la dualidad ES/LATAM; se señaliza con <RegionBadge variant="es-only" />.

export const metadata: Metadata = {
  title: 'Validar DNI, NIF, NIE y CIF - Calcular la letra del DNI | meskeIA',
  description:
    'Valida un DNI, NIF, NIE o CIF y calcula la letra del DNI al instante. Te muestra el algoritmo módulo 23 paso a paso y genera datos de prueba ficticios para desarrollo.',
  keywords:
    'calcular letra dni, validar dni, calcular letra nif, validar nif, validador cif, letra del dni, generador dni datos de prueba, validar nie, dígito de control cif, módulo 23 dni',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Validar DNI, NIF, NIE y CIF y calcular la letra del DNI',
    description:
      'Comprueba si un DNI, NIE o CIF es correcto y calcula la letra del DNI con el algoritmo módulo 23 explicado paso a paso.',
    url: 'https://meskeia.com/validador-dni-nif-cif',
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
    title: 'Validar DNI, NIF, NIE y CIF - Calcular la letra del DNI',
    description:
      'Validación instantánea de DNI, NIE y CIF con el cálculo de la letra explicado paso a paso.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Validador de DNI, NIF, NIE y CIF meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Validador de DNI, NIF, NIE y CIF',
  description:
    'Herramienta que detecta automáticamente si un identificador español es DNI, NIE o CIF, comprueba su letra o dígito de control y muestra el cálculo paso a paso. Incluye un generador de datos de prueba ficticios para entornos de desarrollo.',
  url: 'https://meskeia.com/validador-dni-nif-cif/',
  category: 'UtilityApplication',
  features: [
    'Calcula la letra del DNI con el algoritmo módulo 23 paso a paso',
    'Detecta automáticamente si el identificador es DNI, NIE o CIF',
    'Valida el dígito de control del CIF e indica el tipo de entidad',
    'Explica el motivo exacto del error cuando el identificador no es válido',
    'Genera datos de prueba ficticios en lote para entornos de desarrollo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la letra del DNI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se divide el número de 8 dígitos entre 23 y se toma el resto, un valor entre 0 y 22. Ese resto es la posición dentro de la cadena TRWAGMYFPDXBNJZSQVHLCKE, empezando a contar en 0. Por ejemplo, 12345678 dividido entre 23 da resto 14, y el carácter en la posición 14 de esa cadena es la Z, así que el documento completo es 12345678Z.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre DNI, NIF, NIE y CIF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El DNI es el documento de identidad de los españoles y el NIE el número de identidad de los extranjeros. El NIF es el número de identificación fiscal: para una persona física española coincide exactamente con su DNI incluida la letra, y para un extranjero con su NIE. El CIF era el número fiscal de las personas jurídicas; desde 2008 se denomina oficialmente NIF de entidad, aunque el término CIF sigue siendo de uso común.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el algoritmo del DNI usa el número 23?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque 23 es un número primo y se descartaron del alfabeto las letras I, Ñ, O, U y las tildes por confundirse con otros caracteres, quedando 23 letras útiles. Al ser primo, el resto se reparte de forma uniforme y el sistema detecta el 100% de los errores de un solo dígito y de las transposiciones de dígitos adyacentes, que son las equivocaciones más frecuentes al copiar un número a mano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede saber si un DNI existe realmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La letra solo comprueba la coherencia aritmética del número, no su existencia. Cualquier combinación de 8 dígitos tiene su letra correspondiente, así que hay 100 millones de DNI sintácticamente válidos frente a los aproximadamente 47 millones de habitantes de España. Comprobar si un documento está realmente asignado a alguien exige consultar bases oficiales, algo reservado a organismos autorizados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el dígito de control de un CIF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se suman los dígitos de las posiciones pares tal cual. Los de las posiciones impares se multiplican por dos y, si el resultado tiene dos cifras, se suman entre sí. El control es la unidad que falta para llegar a la siguiente decena. Según la letra inicial de la entidad ese control se expresa como número, como letra tomada de la cadena JABCDEFGHI, o indistintamente de las dos formas.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Valencias y Números de Oxidación — Todos los Elementos | meskeIA',
  description: 'Tabla de valencias y números de oxidación de los elementos químicos, con buscador, ejemplos de compuestos, iones poliatómicos, las tres nomenclaturas IUPAC y formulador de compuestos binarios.',
  keywords: 'tabla de valencias, valencias, numeros de oxidacion, numero de oxidacion, valencias quimica, tabla de valencias quimica, nomenclatura inorganica, nomenclatura quimica, formular compuestos, formulacion inorganica, nomenclatura stock, nomenclatura sistematica, nomenclatura tradicional, iones poliatomicos, oxidos, hidruros, sales binarias, quimica secundaria, bachillerato, preparatoria, educacion media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-valencias/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Valencias y Números de Oxidación | meskeIA',
    description: 'Consulta en segundos con qué números de oxidación actúa cada elemento, con ejemplos reales, las tres nomenclaturas IUPAC y un formulador de compuestos binarios.',
    url: 'https://meskeia.com/tabla-valencias/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabla de Valencias y Números de Oxidación | meskeIA',
    description: 'Busca cualquier elemento y consulta sus números de oxidación con ejemplos de compuestos reales.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Valencias meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Valencias y Números de Oxidación',
  description: 'Tabla consultable con los números de oxidación de 51 elementos químicos, ejemplos de compuestos reales para cada estado, tabla de iones poliatómicos, comparativa de las tres nomenclaturas IUPAC y un formulador automático de compuestos binarios.',
  url: 'https://meskeia.com/tabla-valencias/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo por símbolo, nombre y nombre tradicional (hierro, Fe, ferroso)',
    'Números de oxidación de cada elemento, distinguiendo los habituales de los poco frecuentes',
    'Ejemplo de compuesto real para cada estado de oxidación',
    'Filtros por familia: alcalinos, alcalinotérreos, halógenos, gases nobles, transición…',
    'Tabla de iones poliatómicos frecuentes con su carga',
    'Comparativa de las tres nomenclaturas: sistemática, de Stock y tradicional',
    'Formulador de compuestos binarios con intercambio y simplificación de subíndices',
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
      name: '¿Es lo mismo la valencia que el número de oxidación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No son lo mismo, aunque se usen como sinónimos. La valencia es la capacidad de combinación de un átomo, es decir, cuántos enlaces forma, y se expresa sin signo. El número de oxidación es una convención contable: la carga que tendría el átomo si todos sus enlaces fuesen iónicos, y siempre lleva signo. En el agua (H₂O) el oxígeno tiene valencia 2 y número de oxidación −2; en el peróxido de hidrógeno (H₂O₂) sigue teniendo valencia 2, pero su número de oxidación es −1.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué números de oxidación actúa el hierro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hierro actúa con +2 y +3. El estado +3 es el más estable y el más frecuente, como en el óxido de hierro(III), Fe₂O₃ (herrumbre). El +2 aparece en compuestos como el cloruro de hierro(II), FeCl₂. En nomenclatura tradicional se llaman ferroso (+2) y férrico (+3), y en nomenclatura de Stock se indican con números romanos entre paréntesis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se deduce el número de oxidación de un elemento dentro de un compuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se aplican reglas fijas y se despeja la incógnita. Un elemento libre vale 0; el hidrógeno vale +1 (salvo −1 en hidruros metálicos); el oxígeno vale −2 (salvo −1 en peróxidos); los metales del grupo 1 valen +1 y los del grupo 2, +2; el flúor siempre −1. La suma de todos los números de oxidación es 0 en un compuesto neutro y igual a la carga en un ion. Por ejemplo, en H₂SO₄: 2(+1) + S + 4(−2) = 0, luego el azufre actúa con +6.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se usan los sufijos -oso e -ico y los prefijos hipo- y per-?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son de la nomenclatura tradicional y dependen de cuántos estados de oxidación tenga el elemento. Con dos estados: -oso para el menor e -ico para el mayor (ferroso +2, férrico +3). Con cuatro estados, como los halógenos: hipo—oso, -oso, -ico y per—ico, de menor a mayor (hipocloroso +1, cloroso +3, clórico +5, perclórico +7). Con tres estados se usan hipo—oso, -oso e -ico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los metales de transición tienen varios números de oxidación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque sus orbitales d y el orbital s más externo tienen energías muy parecidas, de modo que pueden ceder distinto número de electrones sin un coste energético muy diferente. Por eso el manganeso actúa con +2, +3, +4, +6 y +7, y el cromo con +2, +3 y +6. En los elementos representativos, en cambio, los estados vienen impuestos por los electrones de valencia y la tendencia a alcanzar la configuración de gas noble, por lo que son mucho más predecibles.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cifrado por Transposición Online - Columnas, Rail Fence, Escítala | meskeIA',
  description: 'Cifra textos reordenando letras con métodos de transposición: Columnas con clave, Rail Fence (zigzag) y Escítala espartana. Visualización paso a paso.',
  keywords: 'cifrado transposicion, columnar cipher, rail fence, escitala, criptografia, reordenar letras, cifrado clasico, zigzag',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cifrado por Transposición Online | meskeIA',
    description: 'Cifra textos reordenando letras: Columnas, Rail Fence y Escítala.',
    url: 'https://meskeia.com/cifrado-transposicion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cifrado por Transposición | meskeIA',
    description: 'Cifrados clásicos de transposición con visualización',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cifrado por Transposición",
  description: "Cifra textos reordenando letras con métodos de transposición: Columnas con clave, Rail Fence (zigzag) y Escítala espartana. Visualización paso a paso.",
  url: "https://meskeia.com/cifrado-transposicion/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un cifrado por transposición?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cifrado por transposición es un método criptográfico que encripta el mensaje reordenando las letras originales sin sustituirlas. A diferencia de los cifrados por sustitución (que reemplazan letras), los de transposición mezclan su posición según una regla o clave. El mensaje cifrado contiene exactamente las mismas letras que el original, pero en un orden diferente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre cifrado columnar, Rail Fence y Escítala?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado columnar escribe el texto en filas dentro de una cuadrícula y lee las columnas en el orden marcado por una clave alfabética. El Rail Fence (o zigzag) escribe las letras alternando entre dos o más "rieles" en diagonal y luego las lee fila por fila. La Escítala espartana enrollaba una tira de cuero en un bastón de diámetro concreto; solo con un bastón del mismo grosor se podía leer el mensaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se descifra un mensaje cifrado por transposición?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para descifrar hay que aplicar la transposición inversa: conocer la clave o el patrón de reorganización y reconstruir la posición original de cada letra. En el cifrado columnar se necesita la clave para ordenar las columnas correctamente. En Rail Fence, conocer el número de rieles permite dividir el texto cifrado en los segmentos adecuados. Sin la clave, se puede atacar por análisis de patrones o fuerza bruta con claves cortas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son seguros los cifrados de transposición modernamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No son seguros para uso real. Los cifrados de transposición simples son vulnerables al criptoanálisis estadístico: las frecuencias de letras y dígrafos se conservan, lo que ayuda al atacante. Sin embargo, combinados con sustitución (como en la cifra de transposición doble o los cifrados de la Segunda Guerra Mundial como ADFGVX), aumentan notablemente la resistencia. Hoy se estudian con fines educativos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué aplicaciones históricas tuvieron los cifrados de transposición?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Escítala fue usada por los espartanos en el siglo V a.C. para comunicaciones militares. Durante la Primera y Segunda Guerra Mundial, el ejército alemán usó variantes de cifrado columnar y de transposición doble. La Armada de la Unión en la Guerra de Secesión estadounidense empleó el cifrado de ruta, otra forma de transposición. Todos fueron eventualmente rotos por los criptoanalistas.',
      },
    },
  ],
};

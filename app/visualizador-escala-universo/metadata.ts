import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Escala del Universo - Del Quark a la Galaxia | meskeIA',
  description: 'Explora los 12 niveles de escala del universo: desde un quark hasta una galaxia. Zoom interactivo con tamaños, comparaciones y datos fascinantes para Bachillerato.',
  keywords: 'escala universo, tamaño universo, física bachillerato, quark átomo molécula célula, escala espacial, astronomía educativa, ciencias bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Escala del Universo',
    description: 'Del quark a la galaxia: 12 niveles de zoom interactivo con tamaños y comparaciones.',
    url: 'https://meskeia.com/visualizador-escala-universo/',
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
    title: 'La Escala del Universo',
    description: 'Explora 12 niveles de escala del universo, del quark a la galaxia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Escala Universo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Escala del Universo',
  description: 'Explicador visual interactivo de las escalas de tamaño del universo: desde un quark (10⁻¹⁸ m) hasta una galaxia (10²¹ m). 12 niveles con iconos, tamaños, objetos representativos y comparaciones sorprendentes.',
  url: 'https://meskeia.com/visualizador-escala-universo/',
  features: [
    '12 niveles de escala: quark, átomo, molécula ADN, célula, hormiga, humano, edificio, montaña, Tierra, Sol, sistema solar, galaxia',
    'Slider de zoom interactivo entre niveles',
    'Tamaño en metros con notación científica',
    'Comparación entre niveles adyacentes',
    'Objeto representativo y dato fascinante por nivel',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la escala del universo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala del universo es una representación comparativa de los tamaños de los objetos que existen en la naturaleza, desde las partículas subatómicas hasta las estructuras cósmicas más grandes. Abarca unos 42 órdenes de magnitud: el quark mide aproximadamente 10⁻¹⁸ metros, mientras que una galaxia típica como la Vía Láctea alcanza los 10²¹ metros (unos 100.000 años luz).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto más grande es el Sol que la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sol tiene un diámetro de aproximadamente 1.392.000 km, mientras que el de la Tierra es de unos 12.742 km. Esto significa que el Sol es unas 109 veces más ancho que la Tierra y que cabrían aproximadamente 1,3 millones de planetas Tierra dentro del Sol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este visualizador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El visualizador es adecuado desde la educación secundaria hasta el bachillerato y primeros cursos universitarios de física y astronomía. Los 12 niveles con notación científica y comparaciones cotidianas ayudan a desarrollar la intuición sobre las escalas de tamaño, un concepto clave en física, química y biología.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el objeto más pequeño que podemos observar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El límite de la observación directa con microscopio óptico está alrededor de 200 nanómetros (2×10⁻⁷ m), aproximadamente el tamaño de una bacteria pequeña. Los quarks y los propios protones (10⁻¹⁵ m) solo pueden estudiarse de forma indirecta mediante aceleradores de partículas como el LHC del CERN, ya que son mucho más pequeños que la longitud de onda de la luz visible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos niveles de escala hay entre un átomo y un ser humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre un átomo de hidrógeno (~10⁻¹⁰ m) y un ser humano (~1,7 m) hay aproximadamente 10 órdenes de magnitud, es decir, un factor de 10.000 millones. En los niveles intermedios se encuentran la molécula de ADN (~10⁻⁹ m), un virus (~10⁻⁷ m), una bacteria (~10⁻⁶ m), una célula eucariota (~10⁻⁵ m) y un insecto pequeño (~10⁻³ m).',
      },
    },
  ],
};

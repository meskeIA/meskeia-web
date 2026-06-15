import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Ondas e Interferencia | meskeIA',
  description:
    'Simula ondas viajeras, interferencia de 2 fuentes y ondas estacionarias en cuerdas y tubos. Ajusta frecuencia, amplitud, fase y separación. Física Bachillerato y Universidad.',
  keywords:
    'ondas interferencia, ondas estacionarias, doble rendija, superposición ondas, nodos antinodos, armónicos cuerda, frecuencia fundamental, física bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-ondas-interferencia/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Ondas e Interferencia | meskeIA',
    description:
      'Onda viajera, interferencia de 2 fuentes y ondas estacionarias con animación interactiva',
    url: 'https://meskeia.com/simulador-ondas-interferencia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      { url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Ondas e Interferencia | meskeIA',
    description: 'Aprende ondas y superposición con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Ondas e Interferencia',
  description:
    'Simulador interactivo de ondas, interferencia y ondas estacionarias. Ajusta amplitud, frecuencia, velocidad, fase y separación de fuentes; observa patrones 1D y 2D, nodos, antinodos y armónicos.',
  url: 'https://meskeia.com/simulador-ondas-interferencia/',
  category: 'EducationalApplication',
  features: [
    'Onda viajera 1D animada con λ, T y k medidos',
    'Interferencia 2D de 2 fuentes con mapa de color',
    'Ondas estacionarias en cuerda y tubo abierto/cerrado',
    'Hasta 5 modos armónicos visualizables',
    'Patrones predefinidos: doble rendija, fuentes opuestas',
    'En español',
  ],
  keywords: ['ondas', 'interferencia', 'estacionarias', 'física bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la interferencia de ondas y cómo se produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La interferencia ocurre cuando dos o más ondas se superponen en el mismo punto del espacio. Si las crestas coinciden (diferencia de fase 0°) se produce interferencia constructiva y la amplitud aumenta; si cresta y valle coinciden (180°) se produce interferencia destructiva y la amplitud se cancela. El resultado depende de la diferencia de camino o de fase entre las fuentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los nodos y antinodos en una onda estacionaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los nodos son puntos que permanecen en reposo porque la interferencia destructiva es permanente; los antinodos son los puntos de máxima vibración donde la interferencia es siempre constructiva. En una cuerda fija en ambos extremos, los extremos son siempre nodos. La distancia entre dos nodos consecutivos es media longitud de onda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las frecuencias de los armónicos en una cuerda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una cuerda de longitud L tensada a velocidad v, la frecuencia fundamental es f₁ = v/(2L). Los armónicos superiores son múltiplos enteros: f_n = n·f₁. El primer armónico (n=1) es el modo fundamental, con un solo antinodo; el segundo (n=2) tiene dos antinodos, y así sucesivamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia una onda viajera de una onda estacionaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una onda viajera transporta energía en una dirección: sus crestas y valles se desplazan a lo largo del tiempo. Una onda estacionaria surge de la superposición de dos ondas iguales que viajan en sentidos opuestos; sus nodos y antinodos están fijos en el espacio y la energía queda atrapada entre los extremos, sin desplazarse neta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el experimento de la doble rendija de Young?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando una onda pasa por dos rendijas separadas una distancia d, cada rendija actúa como fuente secundaria coherente. Las ondas se superponen en la pantalla creando franjas brillantes (constructivas) donde la diferencia de camino es un múltiplo entero de λ, y franjas oscuras (destructivas) donde la diferencia es un semientero de λ. La separación entre franjas es proporcional a λ e inversamente proporcional a d.',
      },
    },
  ],
};

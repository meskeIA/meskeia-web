import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Carbono: Diamante, Grafeno y la Molécula de la Vida | meskeIA',
  description:
    'Por qué un solo elemento forma el diamante más duro y el grafeno más flexible. Alótropos, ciclo del carbono, química orgánica y datación con C-14.',
  keywords: [
    'carbono elemento',
    'alótropos carbono',
    'diamante grafito diferencia',
    'grafeno propiedades',
    'ciclo del carbono',
    'carbono 14 datacion',
    'quimica organica carbono',
  ],
  openGraph: {
    title: 'El Carbono: Diamante, Grafeno y la Molécula de la Vida',
    description:
      'Un solo elemento que forma el diamante más duro, el grafeno más delgado y todas las moléculas de la vida',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Carbono: Diamante, Grafeno y la Molécula de la Vida',
    description: 'Un solo elemento que forma el diamante más duro, el grafeno más delgado y todas las moléculas de la vida',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "El Carbono: Diamante, Grafeno y la Molécula de la Vida",
  description: "Por qué un solo elemento forma el diamante más duro y el grafeno más flexible. Alótropos, ciclo del carbono, química orgánica y datación con C-14.",
  url: "https://meskeia.com/visualizador-carbono/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué el diamante y el grafito son tan diferentes si ambos son carbono puro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia reside en la estructura cristalina, no en la composición. En el diamante, cada átomo de carbono forma 4 enlaces covalentes en una red tetraédrica tridimensional, lo que lo convierte en el mineral natural más duro. En el grafito, los átomos se organizan en capas hexagonales unidas entre sí por fuerzas débiles de van der Waals, lo que permite que las capas se deslicen fácilmente y explica su textura untuosa. Es el mismo elemento con propiedades radicalmente distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el grafeno y por qué se dice que es el material del futuro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El grafeno es una sola capa de átomos de carbono dispuestos en una red hexagonal, con solo un átomo de grosor. Es el material más delgado conocido y, a la vez, unas 200 veces más resistente que el acero. Conduce la electricidad mejor que el cobre y el calor mejor que el diamante. Sus aplicaciones potenciales incluyen transistores más rápidos, baterías de carga ultrarrápida, filtros de agua y pantallas flexibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la datación por carbono 14?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El carbono 14 (C-14) es un isótopo radiactivo que se forma en la atmósfera por la acción de los rayos cósmicos y se incorpora a los organismos vivos mientras están vivos. Al morir, dejan de absorber C-14 y el que ya tenían empieza a desintegrarse con una vida media de 5.730 años. Midiendo la proporción de C-14 restante respecto al C-12 estable, se puede calcular cuándo murió el organismo. El método es fiable hasta unos 50.000 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el papel del carbono en el calentamiento global?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El dióxido de carbono (CO₂) es el principal gas de efecto invernadero de origen humano. El carbono circula entre la atmósfera, los océanos, los suelos y los seres vivos en lo que se denomina ciclo del carbono. La quema de combustibles fósiles libera carbono que llevaba millones de años almacenado, aumentando la concentración de CO₂ en la atmósfera de unas 280 ppm preindustriales a más de 420 ppm en la actualidad, intensificando el efecto invernadero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se dice que la química orgánica es la química del carbono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El carbono puede formar cuatro enlaces covalentes y encadenarse consigo mismo formando estructuras lineales, ramificadas o cíclicas de longitud prácticamente ilimitada. Esta versatilidad permite la existencia de decenas de millones de compuestos distintos, desde el metano hasta el ADN. Todos los seres vivos están construidos sobre esqueletos carbonados, por lo que la química de los compuestos del carbono —la química orgánica— es esencialmente la química de la vida.',
      },
    },
  ],
};

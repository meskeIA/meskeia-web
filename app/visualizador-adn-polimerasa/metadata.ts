import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'ADN Polimerasa - La Enzima que Copia el Genoma | meskeIA',
  description: 'Cómo funciona la ADN polimerasa: replica el genoma a 1.000 nucleótidos por segundo con un error cada 10⁹ bases, la horquilla de replicación, los fragmentos de Okazaki, la corrección de pruebas y la Taq polimerasa del PCR.',
  keywords: ['ADN polimerasa como funciona', 'replicacion ADN', 'horquilla replicacion', 'fragmentos Okazaki', 'Taq polimerasa PCR', 'fidelidad ADN polimerasa', 'correccion pruebas ADN', 'PCR enzima'],
  openGraph: {
    title: 'ADN Polimerasa - La Fotocopiadora del Genoma | meskeIA',
    description: 'Cómo la ADN polimerasa copia el genoma con precisión extraordinaria.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "ADN Polimerasa - La Máquina que Copia tu Genoma",
  description: "Cómo funciona la ADN polimerasa: replica el genoma a 1.000 nucleótidos por segundo con un error cada 10⁹ bases, la horquilla de replicación, los fragmentos de Okazaki, la corrección de pruebas y la Ta",
  url: "https://meskeia.com/visualizador-adn-polimerasa/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la ADN polimerasa y cuál es su función principal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ADN polimerasa es una enzima que sintetiza nuevas cadenas de ADN a partir de una plantilla existente. Su función principal es la replicación del ADN antes de la división celular, copiando el genoma completo para que cada célula hija reciba una copia idéntica. También participa en la reparación del ADN dañado. Opera siempre en dirección 5\'→3\' y necesita un cebador de ARN para iniciarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué velocidad trabaja la ADN polimerasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En células humanas, la ADN polimerasa delta incorpora aproximadamente 1.000 nucleótidos por segundo. Para replicar los ~3.200 millones de pares de bases del genoma humano, el proceso completo tarda entre 6 y 8 horas y se realiza en paralelo desde unos 50.000 orígenes de replicación simultáneos. La tasa de error inherente es de 1 en 10⁵, que el sistema de corrección de pruebas reduce a 1 en 10⁹.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los fragmentos de Okazaki en la replicación del ADN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los fragmentos de Okazaki son segmentos cortos de ADN (100-200 nucleótidos en eucariotas) sintetizados de forma discontinua en la hebra rezagada durante la replicación. Como la ADN polimerasa solo puede trabajar en dirección 5\'→3\', la hebra complementaria a la que se lee en dirección 3\'→5\' se construye en fragmentos cortos que luego une la ADN ligasa. Los descubrió Reiji Okazaki en 1968.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la Taq polimerasa y para qué sirve en el PCR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Taq polimerasa es una ADN polimerasa termoestable aislada de la bacteria Thermus aquaticus, que vive en fuentes termales a 70-75 °C. Su resistencia al calor la hace ideal para la técnica PCR (Reacción en Cadena de la Polimerasa), que requiere ciclos de desnaturalización a ~95 °C. El PCR permite amplificar millones de copias de una secuencia de ADN específica y es la base del diagnóstico genético moderno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo corrige sus errores la ADN polimerasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ADN polimerasa tiene actividad exonucleasa 3\'→5\' que actúa como corrector de pruebas: si incorpora un nucleótido incorrecto, hace una pausa, lo elimina y lo sustituye por el correcto. Este mecanismo reduce la tasa de error de 1 en 10⁵ a 1 en 10⁷. Sistemas adicionales de reparación post-replicativa, como el sistema MMR (mismatch repair), reducen aún más los errores hasta 1 en 10⁹ o 10¹⁰.',
      },
    },
  ],
};

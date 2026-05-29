import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Infraseguro - Regla Proporcional | meskeIA',
  description: 'Calcula cuánto cobrarás en caso de siniestro si tienes infraseguro. Aplica la regla proporcional según la Ley de Contrato de Seguro (art. 30).',
  keywords: 'infraseguro, regla proporcional, seguro hogar, indemnización siniestro, capital asegurado, valor real, ley contrato seguro, artículo 30',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Infraseguro - Regla Proporcional | meskeIA',
    description: 'Calcula cuánto cobrarás en caso de siniestro si tu capital asegurado es inferior al valor real.',
    url: 'https://meskeia.com/estimador-infraseguro/',
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
    title: 'Estimador de Infraseguro - meskeIA',
    description: 'Calcula la indemnización real aplicando la regla proporcional del infraseguro.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/estimador-infraseguro/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Infraseguro",
  description: "Calcula cuánto cobrarás en caso de siniestro si tienes infraseguro. Aplica la regla proporcional según la Ley de Contrato de Seguro (art. 30).",
  url: "https://meskeia.com/estimador-infraseguro/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el infraseguro y cómo me afecta en caso de siniestro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El infraseguro ocurre cuando el capital asegurado en tu póliza es inferior al valor real del bien. En España, el artículo 30 de la Ley de Contrato de Seguro permite a la aseguradora aplicar la regla proporcional: si tu casa vale 200.000 € pero la tienes asegurada por 100.000 €, solo cubrirás el 50% del valor, y en un siniestro de 40.000 € recibirás únicamente 20.000 €. Es una penalización directa sobre la indemnización.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la indemnización con la regla proporcional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula es: Indemnización = Daños × (Capital asegurado / Valor real del bien). Por ejemplo, si el daño es de 30.000 €, tienes asegurado 120.000 € y el valor real es 200.000 €, cobrarás 30.000 × (120.000/200.000) = 18.000 €. El cálculo es sencillo, pero el impacto puede ser significativo cuando hay una gran diferencia entre capital asegurado y valor real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si tengo infraseguro en mi seguro de hogar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Compara el capital asegurado de tu póliza con el coste de reconstrucción actual del inmueble (no el precio de mercado ni el valor catastral). Para una estimación orientativa, el coste de reconstrucción en España ronda los 800-1.200 €/m² según la zona y calidades. Si el valor asegurado está muy por debajo de ese cálculo, es probable que tengas infraseguro. Los peritos de las aseguradoras determinan el valor real en el momento del siniestro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Pueden las aseguradoras siempre aplicar la regla proporcional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No siempre. La regla proporcional solo se aplica si el infraseguro es voluntario o por negligencia del asegurado. Además, algunas pólizas incluyen cláusulas de valor de reposición o de cobertura a primer riesgo que limitan o eliminan su aplicación. Leer las condiciones generales de la póliza es clave para saber si estás expuesto a esta penalización en caso de siniestro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre valor de reposición y valor venal en los seguros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El valor venal o de mercado es el precio por el que se podría vender el bien teniendo en cuenta su antigüedad y depreciación. El valor de reposición es el coste de reemplazarlo por uno nuevo de características similares. Las pólizas que garantizan el valor de reposición son más caras pero más protectoras: en caso de siniestro total no sufres la depreciación del bien. Para viviendas habituales, asegurar por valor de reconstrucción (no de mercado) es lo correcto.',
      },
    },
  ],
};

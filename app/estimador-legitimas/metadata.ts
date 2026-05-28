import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Legítimas — Herencia forzosa por CCAA | meskeIA',
  description: 'Calcula la legítima hereditaria según el derecho civil de tu comunidad autónoma (Código Civil, Cataluña, Aragón, Galicia, Baleares, País Vasco, Navarra). Estimación de cuotas por heredero forzoso y parte de libre disposición.',
  keywords: 'legitima herencia, calculo legitima, tercio legitima estricta mejora, herencia forzosa españa, legitima cataluña aragon galicia, parte libre disposicion herencia, herederos forzosos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Legítimas | meskeIA',
    description: 'Estima la herencia forzosa y la parte de libre disposición según el régimen civil de tu comunidad autónoma.',
    url: 'https://meskeia.com/estimador-legitimas/',
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
    title: 'Estimador de Legítimas | meskeIA',
    description: 'Calcula legítimas hereditarias por CCAA: Código Civil, Cataluña, Aragón, Galicia…',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Legítimas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Legítimas",
  description: "Calcula la legítima hereditaria según el derecho civil de tu comunidad autónoma (Código Civil, Cataluña, Aragón, Galicia, Baleares, País Vasco, Navarra). Estimación de cuotas por heredero forzoso y pa",
  url: "https://meskeia.com/estimador-legitimas/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la legítima en una herencia y quiénes tienen derecho a ella?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La legítima es la parte de la herencia que la ley reserva obligatoriamente a determinados herederos forzosos, con independencia de lo que diga el testamento. En el Código Civil español, los legitimarios son los hijos y descendientes (en primer lugar), los padres y ascendientes (en defecto de descendientes) y el cónyuge viudo (con derecho de usufructo). El testador solo puede disponer libremente de la parte no reservada por ley.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto es la legítima según el Código Civil español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el régimen general del Código Civil, la herencia se divide en tres tercios: el tercio de legítima estricta (que se reparte obligatoriamente a partes iguales entre los hijos), el tercio de mejora (que puede destinarse a cualquier descendiente a elección del testador) y el tercio de libre disposición (de uso totalmente libre). En la práctica, los hijos tienen derecho a dos tercios del caudal hereditario (legítima larga), aunque uno de ellos puede concentrarse en un solo hijo mediante la mejora.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cambia la legítima según la comunidad autónoma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, España tiene un sistema de pluralidad de derechos civiles. Cataluña reserva solo la cuarta parte del caudal para los descendientes (legítima reducida). Aragón establece la legítima colectiva para el grupo de hijos. Galicia permite la mejora de habitación y tiene reglas propias. Navarra solo reconoce la legítima formal (un euro simbólico). Baleares y País Vasco también tienen particularidades relevantes. La comunidad autónoma aplicable suele ser la del domicilio habitual del fallecido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede el testador desheredar a los hijos y dejarlos sin legítima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La desheredación válida requiere una causa legal expresa recogida en el testamento y que esa causa sea reconocida por el Código Civil o el derecho foral aplicable. Las causas incluyen maltrato de obra o injurias graves al testador, negación de alimentos en situación de necesidad, y otras causas de indignidad. Si no hay causa legal o no se prueba, el heredero desheredado puede impugnar el testamento judicialmente y recuperar su legítima.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la parte de libre disposición y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La parte de libre disposición es la fracción de la herencia sobre la que el testador puede decidir con total libertad: dejarla a quien quiera (familiar, amigo, pareja no casada, fundación) o usarla para mejorar la cuota de un descendiente concreto. Bajo el Código Civil general, equivale a un tercio del caudal hereditario. En regímenes forales con legítima más reducida (como Cataluña, con legítima de un cuarto), la parte libre es mayor.',
      },
    },
  ],
};
